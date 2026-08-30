import { z } from 'zod'

// ═══════════════════════════════════════════════════════════
// MEMORY ARCHITECTURE
// ═══════════════════════════════════════════════════════════
// Defines the SHAPE and RULES for AI memory — this module does not
// implement storage (that belongs to AI Core/Engine, which will read/
// write these shapes against a real, access-controlled store). Every
// memory scope below declares its own retention and isolation policy
// so that policy lives with the data definition, not scattered across
// implementation code.

export const MemoryScopeSchema = z.enum(['session', 'conversation', 'preference', 'longTerm'])
export type MemoryScope = z.infer<typeof MemoryScopeSchema>

export const MEMORY_SCOPE_POLICY: Record<MemoryScope, {
  description: string
  retention: string
  userIsolated: true // non-negotiable for every scope — one user's memory must never appear in another user's conversation
  requiresExplicitConsent: boolean
}> = {
  session: {
    description: 'Ephemeral state for the current app session only (e.g. current search filters mid-conversation).',
    retention: 'Cleared when the session ends.',
    userIsolated: true,
    requiresExplicitConsent: false,
  },
  conversation: {
    description: 'Context relevant to the current conversation thread (see rules/context-rules.ts for the live shape).',
    retention: 'Cleared/summarized once the conversation is closed or exceeds the token budget.',
    userIsolated: true,
    requiresExplicitConsent: false,
  },
  preference: {
    description: 'Explicit, user-controllable shopping preferences (preferred categories, brands, price range, preferred shops, language).',
    retention: 'Persists until the user changes or clears it. Must be visible and editable by the user (not silently inferred and hidden).',
    userIsolated: true,
    requiresExplicitConsent: true,
  },
  longTerm: {
    description: 'Durable history genuinely useful across many future conversations (e.g. recurring interests) — the narrowest, most conservative scope.',
    retention: 'Persists until the user deletes it. Subject to the strictest scrutiny before anything is written here.',
    userIsolated: true,
    requiresExplicitConsent: true,
  },
}

/** A single stored preference — always attributable, never silently fabricated. */
export const UserPreferenceSchema = z.object({
  userId: z.string(),
  key: z.enum(['preferredCategory', 'preferredBrand', 'preferredPriceRange', 'preferredShop', 'language']),
  value: z.unknown(),
  /** How this preference was captured — required so the AI can never claim to know something it inferred without telling the user. */
  source: z.enum(['explicitUserStatement', 'explicitUserSetting', 'derivedFromLikedShop']),
  setAt: z.string(),
})
export type UserPreference = z.infer<typeof UserPreferenceSchema>

/**
 * Rules the AI must follow when deciding whether to read/write memory.
 * Encoded as data (not prose) so AI Core can check against it
 * programmatically rather than "remembering" a policy from a prompt.
 */
export const MEMORY_RULES = {
  /** The AI must never write to `longTerm` or `preference` scope without the source being explicit. */
  forbidSilentLongTermWrite: true,
  /** The AI must never read another user's memory, under any scope, for any reason. */
  forbidCrossUserRead: true,
  /** Sensitive personal attributes (health, religion, political views, etc.) must never be inferred or stored, even if mentioned in passing. */
  forbiddenInferredAttributes: [
    'health', 'religion', 'politicalView', 'sexualOrientation', 'ethnicity', 'immigrationStatus',
  ] as const,
  /** Every write to preference/longTerm scope must be deletable by the user on request (right to erasure). */
  mustSupportUserDeletion: true,
} as const
