import { describe, it, expect } from 'vitest'
import { InMemoryMemoryStore, assertNoCrossUserLeak } from '../memory/store'
import type { UserPreference } from '../../data-core'

describe('InMemoryMemoryStore — user isolation', () => {
  it('never returns another user\'s preferences', async () => {
    const store = new InMemoryMemoryStore()
    await store.setPreference({ userId: 'user-A', key: 'preferredCategory', value: 'Phones', source: 'explicitUserStatement', setAt: new Date().toISOString() })
    await store.setPreference({ userId: 'user-B', key: 'preferredCategory', value: 'Shoes', source: 'explicitUserStatement', setAt: new Date().toISOString() })

    const aPrefs = await store.getPreferences('user-A')
    const bPrefs = await store.getPreferences('user-B')

    expect(aPrefs).toHaveLength(1)
    expect(aPrefs[0].value).toBe('Phones')
    expect(bPrefs).toHaveLength(1)
    expect(bPrefs[0].value).toBe('Shoes')
  })

  it('returns an empty array for a user with no stored preferences', async () => {
    const store = new InMemoryMemoryStore()
    expect(await store.getPreferences('nobody')).toEqual([])
  })

  it('deletePreference only affects the specified user', async () => {
    const store = new InMemoryMemoryStore()
    await store.setPreference({ userId: 'user-A', key: 'preferredBrand', value: 'Samsung', source: 'explicitUserStatement', setAt: new Date().toISOString() })
    await store.setPreference({ userId: 'user-B', key: 'preferredBrand', value: 'Apple', source: 'explicitUserStatement', setAt: new Date().toISOString() })

    await store.deletePreference('user-A', 'preferredBrand')

    expect(await store.getPreferences('user-A')).toEqual([])
    expect(await store.getPreferences('user-B')).toHaveLength(1)
  })

  it('deleteAllForUser supports the right-to-erasure requirement without touching other users', async () => {
    const store = new InMemoryMemoryStore()
    await store.setPreference({ userId: 'user-A', key: 'preferredCategory', value: 'Phones', source: 'explicitUserStatement', setAt: new Date().toISOString() })
    await store.setPreference({ userId: 'user-A', key: 'preferredBrand', value: 'Samsung', source: 'explicitUserStatement', setAt: new Date().toISOString() })
    await store.setPreference({ userId: 'user-B', key: 'preferredCategory', value: 'Shoes', source: 'explicitUserStatement', setAt: new Date().toISOString() })

    await store.deleteAllForUser('user-A')

    expect(await store.getPreferences('user-A')).toEqual([])
    expect(await store.getPreferences('user-B')).toHaveLength(1)
  })

  it('refuses to store a preference with no declared source (forbidSilentLongTermWrite)', async () => {
    const store = new InMemoryMemoryStore()
    const bad = { userId: 'user-A', key: 'preferredCategory', value: 'Phones', setAt: new Date().toISOString() } as unknown as UserPreference
    await expect(store.setPreference(bad)).rejects.toThrow()
  })
})

describe('assertNoCrossUserLeak', () => {
  it('does not throw when all preferences belong to the requesting user', () => {
    const prefs: UserPreference[] = [{ userId: 'user-A', key: 'preferredCategory', value: 'Phones', source: 'explicitUserStatement', setAt: 'now' }]
    expect(() => assertNoCrossUserLeak('user-A', prefs)).not.toThrow()
  })

  it('throws if a returned preference belongs to a different user', () => {
    const prefs: UserPreference[] = [{ userId: 'user-B', key: 'preferredCategory', value: 'Shoes', source: 'explicitUserStatement', setAt: 'now' }]
    expect(() => assertNoCrossUserLeak('user-A', prefs)).toThrow(/isolation violation/)
  })
})
