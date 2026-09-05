import {
  type ConversationContext, type ConversationTurn, type ActiveTask, type EntitySlot,
  type IntentDefinition, mergeEntitiesIntoActiveTask, getIntentById,
} from '../../data-core'
import type { AIRequestContext } from '../security/authorize'

// ═══════════════════════════════════════════════════════════
// CONTEXT ENGINE
// ═══════════════════════════════════════════════════════════
// Real, working multi-turn context management built on top of Data
// Core's ConversationContext schema and mergeEntitiesIntoActiveTask
// logic. This module owns the STATE TRANSITIONS (starting a new
// active task, advancing turns, deciding when to summarize) — Data
// Core owns the shapes and the pure merge function itself.

export function createConversationContext(
  conversationId: string,
  request: AIRequestContext
): ConversationContext {
  return {
    conversationId,
    userId: request.userId,
    role: request.role,
    applicationLanguage: request.applicationLanguage,
    recentTurns: [],
    summary: null,
    activeTask: null,
    tokenBudgetTurns: 12,
  }
}

/** Appends a turn, truncating/summarizing older turns once the budget is exceeded. */
export function appendTurn(context: ConversationContext, turn: ConversationTurn): ConversationContext {
  const recentTurns = [...context.recentTurns, turn]

  if (recentTurns.length <= context.tokenBudgetTurns) {
    return { ...context, recentTurns }
  }

  // Budget exceeded: fold the oldest turns into a running summary
  // rather than silently dropping them (Part 8's token-budgeting
  // requirement). The summary here is a structural placeholder line —
  // a real model-generated summary is Batch 3's job; until then this
  // at least preserves a factual trace of what was discussed instead
  // of losing it outright.
  const overflow = recentTurns.length - context.tokenBudgetTurns
  const foldedTurns = recentTurns.slice(0, overflow)
  const kept = recentTurns.slice(overflow)

  const foldedSummaryLine = foldedTurns
    .map(t => `${t.role}: ${t.text.slice(0, 80)}`)
    .join(' | ')

  return {
    ...context,
    recentTurns: kept,
    summary: context.summary ? `${context.summary} | ${foldedSummaryLine}` : foldedSummaryLine,
  }
}

/** Starts a fresh active task for a newly classified intent, with empty slots for its expected entities. */
export function startActiveTask(intent: IntentDefinition): ActiveTask {
  const slots: EntitySlot[] = intent.expectedEntities.map(entityType => ({
    entityType: entityType as any,
    value: null,
    filled: false,
    filledAtTurn: null,
  }))
  return { intentId: intent.id, slots, readyToExecute: slots.length === 0 }
}

/**
 * The core continuity rule: if there's already an active task and the
 * newly classified intent either matches it OR classification was
 * too weak to confidently start something new, treat this turn as
 * CONTINUING the active task (merging entities into it) rather than
 * replacing it — this is what makes "Natafuta simu." -> "Samsung."
 * work instead of "Samsung" being treated as an unrelated request.
 */
export function advanceContext(
  context: ConversationContext,
  turn: number,
  classifiedIntentId: string | null,
  intentConfidence: number,
  freshEntities: Record<string, unknown>
): ConversationContext {
  let activeTask = context.activeTask

  const shouldContinueExisting =
    activeTask !== null &&
    !activeTask.readyToExecute &&
    // A short, low-information follow-up (e.g. just a category word
    // like "nguo") can sometimes score a marginally higher confidence
    // for a DIFFERENT intent than the one already in progress, purely
    // because that intent has fewer expected entities (a smaller
    // denominator inflates its entity-presence boost — see
    // intent/classify.ts). A real, deliberate topic switch mid-flow
    // should be unambiguous, not win by a hair — 0.6 requires a
    // clearly confident new intent before abandoning unfinished work,
    // found and raised from an earlier 0.35 after exactly this
    // "nguo" tie-break case broke a live guided PRODUCT_SEARCH flow.
    (classifiedIntentId === null || classifiedIntentId === activeTask.intentId || intentConfidence < 0.6)

  if (shouldContinueExisting && activeTask) {
    activeTask = mergeEntitiesIntoActiveTask(activeTask, freshEntities, turn)
  } else if (classifiedIntentId) {
    const intentDef = getIntentById(classifiedIntentId)
    if (intentDef) {
      activeTask = mergeEntitiesIntoActiveTask(startActiveTask(intentDef), freshEntities, turn)
    }
  }

  return { ...context, activeTask }
}
