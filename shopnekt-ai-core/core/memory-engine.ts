/**
 * SHOPNEKT AI CORE - Memory Engine Implementation
 * 
 * Manages user memory with privacy controls and classification.
 * Supports temporary, session, preference, and long-term memory types.
 */

import type {
  MemoryEngine,
  UserMemory,
  MemoryClassification,
  MemorySchema,
} from './ai-types.js'

// Memory retention periods (in milliseconds)
const RETENTION_PERIODS: Record<MemoryClassification, number> = {
  'TEMPORARY': 5 * 60 * 1000,      // 5 minutes
  'SESSION': 30 * 60 * 1000,       // 30 minutes (session length)
  'PREFERENCE': 90 * 24 * 60 * 60 * 1000,  // 90 days
  'LONG_TERM': 365 * 24 * 60 * 60 * 1000,  // 1 year
}

// Default memory schemas
const DEFAULT_SCHEMAS: MemorySchema[] = [
  {
    category: 'preferred_categories',
    description: 'User\'s preferred product categories',
    fields: { categories: 'array', lastUpdated: 'string' },
    retention: 'PREFERENCE',
    isPII: false,
  },
  {
    category: 'preferred_brands',
    description: 'User\'s preferred brands',
    fields: { brands: 'array', lastUpdated: 'string' },
    retention: 'PREFERENCE',
    isPII: false,
  },
  {
    category: 'preferred_shops',
    description: 'User\'s saved/favorite shops',
    fields: { shopIds: 'array', savedAt: 'string' },
    retention: 'PREFERENCE',
    isPII: false,
  },
  {
    category: 'price_range',
    description: 'User\'s typical price range preferences',
    fields: { minPrice: 'number', maxPrice: 'number', currency: 'string' },
    retention: 'PREFERENCE',
    isPII: false,
  },
  {
    category: 'location',
    description: 'User\'s preferred location for shopping',
    fields: { region: 'string', city: 'string' },
    retention: 'PREFERENCE',
    isPII: true,
  },
  {
    category: 'search_history',
    description: 'Recent search queries (temporary)',
    fields: { queries: 'array', timestamps: 'array' },
    retention: 'TEMPORARY',
    isPII: false,
  },
  {
    category: 'viewed_products',
    description: 'Recently viewed products (behavioral signal)',
    fields: { productIds: 'array', viewCounts: 'object', lastViewed: 'string' },
    retention: 'SESSION',
    isPII: false,
  },
  {
    category: 'purchase_history_signals',
    description: 'Aggregated purchase behavior signals (not raw orders)',
    fields: { categories: 'array', frequency: 'string', avgOrderValue: 'number' },
    retention: 'LONG_TERM',
    isPII: false,
  },
]

export class MemoryEngineImpl implements MemoryEngine {
  private memories = new Map<string, UserMemory[]>() // userId -> memories
  private schemas = new Map<string, MemorySchema>()  // category -> schema
  private enabled: boolean

  constructor(enabled: boolean = true) {
    this.enabled = enabled
    this.loadDefaultSchemas()
  }

  /**
   * Store user memory
   */
  async storeMemory(memory: UserMemory): Promise<void> {
    if (!this.enabled) {
      return
    }

    // Validate against schema if exists
    const schema = this.schemas.get(memory.category)
    if (schema) {
      this.validateAgainstSchema(memory.data, schema)
    }

    // Set expiration based on classification
    const now = Date.now()
    memory.createdAt = memory.createdAt || now
    memory.updatedAt = now
    memory.expiresAt = now + RETENTION_PERIODS[memory.classification]

    // Get or create user's memory array
    let userMemories = this.memories.get(memory.userId) || []

    // Check for existing memory in same category
    const existingIndex = userMemories.findIndex(m => m.category === memory.category)
    if (existingIndex >= 0) {
      // Update existing
      userMemories[existingIndex] = memory
    } else {
      // Add new
      userMemories.push(memory)
    }

    this.memories.set(memory.userId, userMemories)
  }

  /**
   * Get user memories, optionally filtered by classification
   */
  async getMemory(userId: string, classification?: MemoryClassification): Promise<UserMemory[]> {
    if (!this.enabled) {
      return []
    }

    const userMemories = this.memories.get(userId) || []
    const now = Date.now()

    // Filter out expired memories
    const validMemories = userMemories.filter(m => {
      if (!m.expiresAt || now < m.expiresAt) {
        return true
      }
      return false
    })

    // Update stored memories to remove expired ones
    if (validMemories.length !== userMemories.length) {
      this.memories.set(userId, validMemories)
    }

    // Filter by classification if specified
    if (classification) {
      return validMemories.filter(m => m.classification === classification)
    }

    return validMemories
  }

  /**
   * Delete user memory by category
   */
  async deleteMemory(userId: string, category: string): Promise<void> {
    const userMemories = this.memories.get(userId) || []
    const filtered = userMemories.filter(m => m.category !== category)
    this.memories.set(userId, filtered)
  }

  /**
   * Validate that a user can only access their own memory
   */
  validateMemoryAccess(userId: string, memory: UserMemory): boolean {
    // Critical security check: users can ONLY access their own memory
    return memory.userId === userId
  }

  /**
   * Get memory schema by category
   */
  getSchema(category: string): MemorySchema | null {
    return this.schemas.get(category) || null
  }

  /**
   * Register a new memory schema
   */
  registerSchema(schema: MemorySchema): void {
    this.schemas.set(schema.category, schema)
  }

  /**
   * Clear all memories (for testing or reset)
   */
  clearAllMemories(): void {
    this.memories.clear()
  }

  /**
   * Cleanup expired memories across all users
   */
  cleanupExpiredMemories(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [userId, memories] of this.memories.entries()) {
      const validMemories = memories.filter(m => {
        if (!m.expiresAt || now < m.expiresAt) {
          return true
        }
        cleanedCount++
        return false
      })

      if (validMemories.length !== memories.length) {
        this.memories.set(userId, validMemories)
      }
    }

    return cleanedCount
  }

  // ───────────────────────────────────────────────────────────
  // Private methods
  // ───────────────────────────────────────────────────────────

  private loadDefaultSchemas(): void {
    DEFAULT_SCHEMAS.forEach(schema => {
      this.schemas.set(schema.category, schema)
    })
  }

  private validateAgainstSchema(
    data: Record<string, unknown>,
    schema: MemorySchema
  ): void {
    const expectedFields = Object.keys(schema.fields)

    for (const field of expectedFields) {
      if (!(field in data)) {
        console.warn(`Memory validation warning: Missing field '${field}' for category '${schema.category}'`)
      }
    }

    // Type checking could be added here for stricter validation
  }

  /**
   * Classify memory based on content (helper for determining storage type)
   */
  classifyMemory(data: Record<string, unknown>, category: string): MemoryClassification {
    // Explicit preferences should be long-term
    if (category.includes('preferred') || category.includes('favorite')) {
      return 'PREFERENCE'
    }

    // PII should generally not be stored long-term without explicit consent
    const schema = this.schemas.get(category)
    if (schema?.isPII) {
      return 'SESSION'
    }

    // Behavioral signals can be medium-term
    if (category.includes('history') || category.includes('viewed')) {
      return 'SESSION'
    }

    // Default to temporary for unknown categories
    return 'TEMPORARY'
  }
}
