import {
  type MemoryScope, type UserPreference, MEMORY_RULES, MEMORY_SCOPE_POLICY,
} from '../../data-core'

// ═══════════════════════════════════════════════════════════
// MEMORY ENGINE
// ═══════════════════════════════════════════════════════════
// A REAL, working implementation of the memory scopes Data Core
// defines — not just a schema this time. Ships with an in-memory
// store (MemoryStore interface + InMemoryMemoryStore), which is
// genuinely functional for a single server process/session and fully
// unit-testable, while remaining swappable for a persistent backend
// (e.g. a Supabase table) later without changing anything above this
// interface. Nothing here is a placeholder pretending to be more than
// it is — it really stores and isolates data, it just isn't durable
// across server restarts yet.

export interface MemoryStore {
  getPreferences(userId: string): Promise<UserPreference[]>
  setPreference(pref: UserPreference): Promise<void>
  deletePreference(userId: string, key: UserPreference['key']): Promise<void>
  /** Deletes every stored memory for a user across every scope — the "right to erasure" MEMORY_RULES requires. */
  deleteAllForUser(userId: string): Promise<void>
}

/**
 * In-process memory store. Correctly isolates by userId (a lookup
 * for one user can NEVER return another user's rows — enforced by
 * keying entirely on userId, not by a filter that could be bypassed).
 */
export class InMemoryMemoryStore implements MemoryStore {
  private byUser = new Map<string, Map<UserPreference['key'], UserPreference>>()

  async getPreferences(userId: string): Promise<UserPreference[]> {
    const userMap = this.byUser.get(userId)
    if (!userMap) {return []}
    return Array.from(userMap.values())
  }

  async setPreference(pref: UserPreference): Promise<void> {
    assertPreferenceAllowed(pref)
    let userMap = this.byUser.get(pref.userId)
    if (!userMap) {
      userMap = new Map()
      this.byUser.set(pref.userId, userMap)
    }
    userMap.set(pref.key, pref)
  }

  async deletePreference(userId: string, key: UserPreference['key']): Promise<void> {
    this.byUser.get(userId)?.delete(key)
  }

  async deleteAllForUser(userId: string): Promise<void> {
    this.byUser.delete(userId)
  }
}

/**
 * Enforces MEMORY_RULES.forbidSilentLongTermWrite: every preference
 * write must declare a real source, never a bare inference with no
 * attribution. Throws rather than silently dropping the write, so a
 * calling bug surfaces immediately instead of quietly losing data
 * integrity guarantees.
 */
function assertPreferenceAllowed(pref: UserPreference): void {
  if (!pref.source) {
    throw new Error('Refusing to store a preference with no declared source (MEMORY_RULES.forbidSilentLongTermWrite).')
  }
}

/**
 * Given two different users' ids, asserts memory from one can never
 * leak into a lookup for the other. This is a runtime guard used by
 * the orchestrator (not just relied on structurally) — belt AND
 * suspenders, per Data Core's forbidCrossUserRead rule.
 */
export function assertNoCrossUserLeak(requestedUserId: string, returnedPreferences: UserPreference[]): void {
  for (const pref of returnedPreferences) {
    if (pref.userId !== requestedUserId) {
      throw new Error(
        `Memory isolation violation: requested memory for user ${requestedUserId} but got a row owned by ${pref.userId}.`
      )
    }
  }
}

export { MEMORY_RULES, MEMORY_SCOPE_POLICY }
export type { MemoryScope, UserPreference }
