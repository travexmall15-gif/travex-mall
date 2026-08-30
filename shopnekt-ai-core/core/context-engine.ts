/**
 * SHOPNEKT AI CORE - Context Engine Implementation
 * 
 * Manages conversation context including current intent,
 * previous intents, active entities, and conversation state.
 */

import type {
  ConversationContext,
  ContextEngine,
  IntentId,
  ExtractedEntity,
  SupportedLanguage,
  ContextState,
} from './ai-types.js'

const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export class ContextEngineImpl implements ContextEngine {
  private contexts = new Map<string, ContextState>()
  private sessionTimeout: number

  constructor(sessionTimeout: number = DEFAULT_SESSION_TIMEOUT) {
    this.sessionTimeout = sessionTimeout
  }

  /**
   * Create a new conversation context
   */
  createContext(sessionId: string, language: SupportedLanguage): ConversationContext {
    const now = Date.now()
    const context: ConversationContext = {
      sessionId,
      currentIntent: null,
      previousIntents: [],
      activeEntities: {},
      unresolvedEntities: [],
      conversationTopic: null,
      currentShop: null,
      currentProduct: null,
      currentOrder: null,
      language,
      timestamp: now,
      turnCount: 0,
    }

    this.contexts.set(sessionId, {
      context,
      updatedAt: now,
      expiresAt: now + this.sessionTimeout,
    })

    return context
  }

  /**
   * Update context with new intent and entities
   */
  updateContext(
    context: ConversationContext,
    intent: IntentId,
    entities: ExtractedEntity[]
  ): ConversationContext {
    const now = Date.now()

    // Move current intent to previous if it exists and is different
    if (context.currentIntent && context.currentIntent !== intent) {
      context.previousIntents = [...context.previousIntents, context.currentIntent].slice(-10) // Keep last 10
    }

    // Set new current intent
    context.currentIntent = intent

    // Update active entities
    for (const entity of entities) {
      context.activeEntities[entity.type] = entity
    }

    // Update topic based on intent
    context.conversationTopic = this.inferTopicFromIntent(intent, context.activeEntities)

    // Increment turn count
    context.turnCount++

    // Update timestamp
    context.timestamp = now

    // Update session expiration
    const state = this.contexts.get(context.sessionId)
    if (state) {
      state.context = context
      state.updatedAt = now
      state.expiresAt = now + this.sessionTimeout
      this.contexts.set(context.sessionId, state)
    }

    return context
  }

  /**
   * Get context for a session
   */
  getContext(sessionId: string): ConversationContext | null {
    const state = this.contexts.get(sessionId)

    if (!state) {
      return null
    }

    // Check if context has expired
    if (Date.now() > state.expiresAt) {
      this.contexts.delete(sessionId)
      return null
    }

    return state.context
  }

  /**
   * Clear context for a session
   */
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId)
  }

  /**
   * Get all active sessions (for debugging/monitoring)
   */
  getActiveSessions(): string[] {
    const now = Date.now()
    const activeSessions: string[] = []

    for (const [sessionId, state] of this.contexts.entries()) {
      if (now <= state.expiresAt) {
        activeSessions.push(sessionId)
      }
    }

    return activeSessions
  }

  /**
   * Clean up expired contexts
   */
  cleanupExpiredContexts(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [sessionId, state] of this.contexts.entries()) {
      if (now > state.expiresAt) {
        this.contexts.delete(sessionId)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  /**
   * Update specific context fields without changing intent
   */
  updateContextFields(
    sessionId: string,
    updates: Partial<Omit<ConversationContext, 'sessionId'>>
  ): ConversationContext | null {
    const state = this.contexts.get(sessionId)
    if (!state) {
      return null
    }

    const context = state.context
    const now = Date.now()

    // Apply updates
    Object.assign(context, updates)
    context.timestamp = now
    state.updatedAt = now
    state.expiresAt = now + this.sessionTimeout

    this.contexts.set(sessionId, state)
    return context
  }

  /**
   * Add an entity to the active entities
   */
  addEntity(sessionId: string, entity: ExtractedEntity): ConversationContext | null {
    const state = this.contexts.get(sessionId)
    if (!state) {
      return null
    }

    state.context.activeEntities[entity.type] = entity
    state.context.timestamp = Date.now()
    state.updatedAt = Date.now()
    state.expiresAt = Date.now() + this.sessionTimeout

    this.contexts.set(sessionId, state)
    return state.context
  }

  /**
   * Remove an entity from active entities
   */
  removeEntity(sessionId: string, entityType: string): ConversationContext | null {
    const state = this.contexts.get(sessionId)
    if (!state) {
      return null
    }

    delete state.context.activeEntities[entityType]
    state.context.timestamp = Date.now()
    state.updatedAt = Date.now()
    state.expiresAt = Date.now() + this.sessionTimeout

    this.contexts.set(sessionId, state)
    return state.context
  }

  /**
   * Get entity from context by type
   */
  getEntity(sessionId: string, entityType: string): ExtractedEntity | null {
    const context = this.getContext(sessionId)
    if (!context) {
      return null
    }
    return context.activeEntities[entityType] || null
  }

  /**
   * Mark an entity as unresolved (needs clarification)
   */
  markUnresolved(sessionId: string, entityType: string): void {
    const state = this.contexts.get(sessionId)
    if (!state) {
      return
    }

    if (!state.context.unresolvedEntities.includes(entityType)) {
      state.context.unresolvedEntities.push(entityType)
    }

    this.contexts.set(sessionId, state)
  }

  /**
   * Clear unresolved entities
   */
  clearUnresolved(sessionId: string): void {
    const state = this.contexts.get(sessionId)
    if (!state) {
      return
    }

    state.context.unresolvedEntities = []
    this.contexts.set(sessionId, state)
  }

  // ───────────────────────────────────────────────────────────
  // Private helper methods
  // ───────────────────────────────────────────────────────────

  private inferTopicFromIntent(
    intent: IntentId,
    entities: Record<string, ExtractedEntity>
  ): string | null {
    // Map intents to topics
    const topicMap: Record<string, string> = {
      PRODUCT_SEARCH: 'product_search',
      SHOP_SEARCH: 'shop_search',
      PRODUCT_DETAILS: 'product_details',
      SHOP_DETAILS: 'shop_details',
      PRICE_QUERY: 'pricing',
      PRODUCT_COMPARISON: 'product_comparison',
      RECOMMENDATION: 'recommendations',
      ORDER_STATUS: 'order_tracking',
      ORDER_HELP: 'order_support',
      SELLER_HELP: 'seller_support',
      FLASH_DEAL_SEARCH: 'flash_deals',
      GROUP_BUY_SEARCH: 'group_buy',
      VYBE_DISCOVERY: 'vybe',
      PREFERRED_SHOP: 'preferred_shops',
      CART_HELP: 'cart',
      ACCOUNT_HELP: 'account',
      GENERAL_SHOPNEKT_HELP: 'general',
    }

    let topic = topicMap[intent] || null

    // Enhance topic with entity information
    if (entities.category) {
      topic = `${topic}_${entities.category.value}`
    }

    if (entities.location) {
      topic = `${topic}_${entities.location.value}`
    }

    return topic
  }
}
