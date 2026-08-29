/**
 * SHOPNEKT AI CORE - Entity Engine Implementation
 * 
 * Extracts entities from user input such as products, prices, locations, etc.
 */

import type {
  EntityEngine,
  EntityTypes,
  EntityDefinition,
  ExtractedEntity,
  IntentId,
} from './ai-types.js'

const ENTITY_DEFINITIONS: EntityDefinition[] = [
  {
    type: 'product',
    name: 'Product',
    description: 'Product name or type being searched',
    extractionPatterns: ['simu', 'phone', 'laptop', 'shoes', 'nguo', 'bidhaa'],
    valueType: 'string',
  },
  {
    type: 'shop',
    name: 'Shop',
    description: 'Shop or store name',
    extractionPatterns: ['duka', 'shop', 'store', 'doo'],
    valueType: 'string',
  },
  {
    type: 'category',
    name: 'Category',
    description: 'Product category',
    extractionPatterns: ['electronics', 'fashion', 'food', 'beauty', 'home', 'books', 'sports'],
    valueType: 'string',
  },
  {
    type: 'brand',
    name: 'Brand',
    description: 'Product brand',
    extractionPatterns: ['nike', 'adidas', 'iphone', 'samsung', 'tecno', 'infinix'],
    valueType: 'string',
  },
  {
    type: 'price',
    name: 'Price',
    description: 'Price amount or range',
    extractionPatterns: ['\\d+', 'laki', 'milioni', 'elfu', 'k'],
    valueType: 'number',
  },
  {
    type: 'currency',
    name: 'Currency',
    description: 'Currency type',
    extractionPatterns: ['tzs', 'usd', 'euro', 'shilingi', 'dollar'],
    valueType: 'string',
  },
  {
    type: 'location',
    name: 'Location',
    description: 'Geographic location',
    extractionPatterns: ['dar', 'arusha', 'mwanza', 'dodoma', 'moshi', 'zanzibar', 'tanga', 'morogoro'],
    valueType: 'string',
  },
  {
    type: 'orderId',
    name: 'Order ID',
    description: 'Order identifier',
    extractionPatterns: ['ORD-\\d+', '#\\d+'],
    valueType: 'string',
  },
  {
    type: 'seller',
    name: 'Seller',
    description: 'Seller name or identifier',
    extractionPatterns: ['muuzaji', 'seller', 'vendor'],
    valueType: 'string',
  },
  {
    type: 'market',
    name: 'Market',
    description: 'Market type (business, campus, vybe)',
    extractionPatterns: ['biashara', 'campus', 'vybe', 'chuo'],
    valueType: 'string',
  },
  {
    type: 'quantity',
    name: 'Quantity',
    description: 'Number of items',
    extractionPatterns: ['\\d+\\s*(pieces|vitu|idadi)'],
    valueType: 'number',
  },
  {
    type: 'date',
    name: 'Date',
    description: 'Date reference',
    extractionPatterns: ['leo', 'kesho', 'jana', 'today', 'tomorrow', 'yesterday'],
    valueType: 'string',
  },
  {
    type: 'time',
    name: 'Time',
    description: 'Time reference',
    extractionPatterns: ['\\d+:\\d+', 'saa', 'hour', 'morning', 'evening'],
    valueType: 'string',
  },
  {
    type: 'dealDuration',
    name: 'Deal Duration',
    description: 'Duration of a deal or offer',
    extractionPatterns: ['masaa', 'hours', 'siku', 'days', 'wiki', 'weeks'],
    valueType: 'string',
  },
]

// Price extraction patterns for Swahili
const SW_PRICE_WORDS: Record<string, number> = {
  'laki': 100000,
  'milioni': 1000000,
  'elfu': 1000,
}

export class EntityEngineImpl implements EntityEngine {
  private entities = new Map<EntityTypes, EntityDefinition>()

  constructor() {
    // Load entity definitions
    ENTITY_DEFINITIONS.forEach(def => {
      this.entities.set(def.type, def)
    })
  }

  /**
   * Extract entities from text
   */
  extractEntities(text: string, intent?: IntentId): ExtractedEntity[] {
    const entities: ExtractedEntity[] = []
    const lowerText = text.toLowerCase()

    // Extract price entities
    const priceEntities = this.extractPrice(lowerText)
    entities.push(...priceEntities)

    // Extract location entities
    const locationEntities = this.extractLocation(lowerText)
    entities.push(...locationEntities)

    // Extract product/category entities
    const productEntities = this.extractProductRelated(lowerText, intent)
    entities.push(...productEntities)

    // Extract brand entities
    const brandEntities = this.extractBrand(lowerText)
    entities.push(...brandEntities)

    // Extract quantity entities
    const quantityEntities = this.extractQuantity(lowerText)
    entities.push(...quantityEntities)

    // Remove duplicates by type (keep highest confidence)
    const uniqueEntities = new Map<EntityTypes, ExtractedEntity>()
    for (const entity of entities) {
      const existing = uniqueEntities.get(entity.type)
      if (!existing || entity.confidence > existing.confidence) {
        uniqueEntities.set(entity.type, entity)
      }
    }

    return Array.from(uniqueEntities.values())
  }

  /**
   * Get entity definition by type
   */
  getEntityDefinition(type: EntityTypes): EntityDefinition | null {
    return this.entities.get(type) || null
  }

  /**
   * Register a new entity definition
   */
  registerEntity(definition: EntityDefinition): void {
    this.entities.set(definition.type, definition)
  }

  // ───────────────────────────────────────────────────────────
  // Private extraction methods
  // ───────────────────────────────────────────────────────────

  private extractPrice(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = []

    // Pattern: "500k" or "500K"
    const kPattern = /(\d+(?:\.\d+)?)\s*k\b/i
    const kMatch = text.match(kPattern)
    if (kMatch) {
      const value = parseFloat(kMatch[1]) * 1000
      entities.push({
        type: 'price',
        value,
        confidence: 0.95,
        sourceText: kMatch[0],
      })
    }

    // Pattern: "laki tano" (Swahili)
    for (const [word, multiplier] of Object.entries(SW_PRICE_WORDS)) {
      const swPattern = new RegExp(`(moja|mbili|tatu|nne|tano|sita|saba|nane|tisa|kumi)?\\s*${word}`, 'i')
      const swMatch = text.match(swPattern)
      if (swMatch) {
        const numWord = swMatch[1]
        let multiplier_value = 1

        if (numWord) {
          const swNumbers: Record<string, number> = {
            'moja': 1, 'mbili': 2, 'tatu': 3, 'nne': 4, 'tano': 5,
            'sita': 6, 'saba': 7, 'nane': 8, 'tisa': 9, 'kumi': 10,
          }
          multiplier_value = swNumbers[numWord] || 1
        }

        entities.push({
          type: 'price',
          value: multiplier * multiplier_value,
          confidence: 0.9,
          sourceText: swMatch[0],
        })
      }
    }

    // Pattern: Plain numbers with context
    const plainNumPattern = /(?:bei|price|cost|ghali|rahisi)[^\d]*(\d+(?:,\d{3})*(?:\.\d+)?)/i
    const plainMatch = text.match(plainNumPattern)
    if (plainMatch && !kMatch) {
      const value = parseFloat(plainMatch[1].replace(/,/g, ''))
      entities.push({
        type: 'price',
        value,
        confidence: 0.8,
        sourceText: plainMatch[0],
      })
    }

    // Pattern: Standalone large numbers (likely prices in context)
    const standaloneNumPattern = /\b(\d{5,}(?:,\d{3})*)\b/
    const standaloneMatch = text.match(standaloneNumPattern)
    if (standaloneMatch && !kMatch && entities.length === 0) {
      const value = parseFloat(standaloneMatch[1].replace(/,/g, ''))
      entities.push({
        type: 'price',
        value,
        confidence: 0.6,
        sourceText: standaloneMatch[0],
      })
    }

    return entities
  }

  private extractLocation(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = []

    const locations = [
      'dar es salaam', 'dar', 'arusha', 'mwanza', 'dodoma',
      'moshi', 'zanzibar', 'unguja', 'tanga', 'morogoro',
      'mbeya', 'tabora', 'kigoma', 'singida', 'shinyanga',
    ]

    for (const location of locations) {
      const regex = new RegExp(`\\b${location}\\b`, 'i')
      if (regex.test(text)) {
        entities.push({
          type: 'location',
          value: location,
          confidence: 0.95,
          sourceText: location,
        })
      }
    }

    return entities
  }

  private extractProductRelated(text: string, intent?: IntentId): ExtractedEntity[] {
    const entities: ExtractedEntity[] = []

    // Common product keywords
    const products = [
      'simu', 'phone', 'laptop', 'computer', 'tablet',
      'shoes', 'viatu', 'nguo', 'clothes', 'dress', 'shirt',
      'bag', 'mfuko', 'watch', 'saa', 'headphones',
      'charger', 'tv', 'televisheni', 'radio', 'speaker',
    ]

    for (const product of products) {
      const regex = new RegExp(`\\b${product}\\b`, 'i')
      if (regex.test(text)) {
        // Determine if it's a product or category
        const isCategory = ['electronics', 'fashion', 'food', 'beauty'].includes(product)
        entities.push({
          type: isCategory ? 'category' : 'product',
          value: product,
          confidence: 0.85,
          sourceText: product,
        })
      }
    }

    return entities
  }

  private extractBrand(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = []

    const brands = [
      'nike', 'adidas', 'puma', 'reebok',
      'iphone', 'apple', 'samsung', 'huawei',
      'tecno', 'infinix', 'itel', 'xiaomi',
      'lg', 'sony', 'hp', 'dell', 'lenovo',
    ]

    for (const brand of brands) {
      const regex = new RegExp(`\\b${brand}\\b`, 'i')
      if (regex.test(text)) {
        entities.push({
          type: 'brand',
          value: brand,
          confidence: 0.9,
          sourceText: brand,
        })
      }
    }

    return entities
  }

  private extractQuantity(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = []

    // Pattern: "5 pieces" or "5 vitu"
    const pattern = /(\d+)\s*(pieces|vitu|idadi|pcs)/i
    const match = text.match(pattern)
    if (match) {
      entities.push({
        type: 'quantity',
        value: parseInt(match[1]),
        confidence: 0.9,
        sourceText: match[0],
      })
    }

    return entities
  }
}
