import { z } from 'zod'
import { EntityTypeSchema } from '../entities'
import { SupportedLanguageSchema } from '../schemas/language'

// ═══════════════════════════════════════════════════════════
// CONVERSATION / CONTEXT RULES
// ═══════════════════════════════════════════════════════════
// Defines the SHAPE of conversational state — what AI Core (Batch 2)
// must track across turns so a user never has to repeat information.
// This module contains no runtime state itself (no database, no
// in-memory store) — it is the schema + policy that a real
// implementation must follow.
//
// Reference scenario this schema is designed around (from the master
// spec): a buyer says "Natafuta simu." (category=phone), the assistant
// asks a clarifying question, the buyer replies "Samsung." — the
// system must resolve "Samsung" as the BRAND for the phone search
// already in progress, not as a new, disconnected request.

/** One filled or pending "slot" of information for the active intent. */
export const EntitySlotSchema = z.object({
  entityType: EntityTypeSchema,
  value: z.unknown().nullable(),
  /** Whether this slot still needs to be asked about before the intent can be fulfilled. */
  filled: z.boolean(),
  /** Which turn (1-indexed) this slot was filled on, for debugging/audit — null if still pending. */
  filledAtTurn: z.number().int().positive().nullable(),
})
export type EntitySlot = z.infer<typeof EntitySlotSchema>

/** The active task the conversation is currently working toward. */
export const ActiveTaskSchema = z.object({
  intentId: z.string(),
  slots: z.array(EntitySlotSchema),
  /** True once every REQUIRED slot for this intent's tool call is filled. */
  readyToExecute: z.boolean(),
})
export type ActiveTask = z.infer<typeof ActiveTaskSchema>

/** One turn of the conversation, kept for short-term context — not permanent memory. */
export const ConversationTurnSchema = z.object({
  turn: z.number().int().positive(),
  role: z.enum(['user', 'assistant']),
  text: z.string(),
  /** The language this turn was written in (may differ from the app's configured UI language — see language.ts). */
  detectedLanguage: SupportedLanguageSchema.optional(),
  /** Entities extracted from this specific turn, if any. */
  extractedEntityTypes: z.array(EntityTypeSchema).default([]),
})
export type ConversationTurn = z.infer<typeof ConversationTurnSchema>

/**
 * Full conversation context passed to the reasoning layer. This is
 * NOT the same as long-term Memory (see memory/index.ts) — context is
 * scoped to the current conversation only and is expected to be
 * summarized/truncated once it grows large (tokenBudget below).
 */
export const ConversationContextSchema = z.object({
  conversationId: z.string(),
  userId: z.string().nullable(),
  role: z.enum(['buyer', 'seller']),
  /** The application's currently selected UI language — AI responses must use this, regardless of what language the user typed in. */
  applicationLanguage: SupportedLanguageSchema,
  recentTurns: z.array(ConversationTurnSchema),
  /** A running summary used once recentTurns exceeds the token budget, so old context isn't silently lost. */
  summary: z.string().nullable(),
  activeTask: ActiveTaskSchema.nullable(),
  /** Maximum number of recent turns to keep verbatim before summarizing (rest of Part 8's 'token budgeting' requirement). */
  tokenBudgetTurns: z.number().int().positive().default(12),
})
export type ConversationContext = z.infer<typeof ConversationContextSchema>

/**
 * Given the current context and a set of freshly extracted entities,
 * merges them into the active task's slots — this is the "Samsung
 * fills the pending brand slot" rule. Pure function, no I/O, easy to
 * unit test.
 */
export function mergeEntitiesIntoActiveTask(
  task: ActiveTask,
  freshEntities: Partial<Record<string, unknown>>,
  turn: number
): ActiveTask {
  const nextSlots = task.slots.map(slot => {
    if (slot.filled) return slot
    const value = freshEntities[slot.entityType]
    if (value === undefined || value === null) return slot
    return { ...slot, value, filled: true, filledAtTurn: turn }
  })
  return {
    ...task,
    slots: nextSlots,
    readyToExecute: nextSlots.every(s => s.filled),
  }
}
