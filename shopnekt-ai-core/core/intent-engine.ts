/**
 * SHOPNEKT AI CORE - Intent Engine Implementation
 * 
 * Detects user intent from natural language input.
 * Uses pattern matching, keyword analysis, and context awareness.
 */

import type {
  IntentEngine,
  IntentId,
  IntentDefinition,
  ConversationContext,
} from './ai-types.js'

// Default intent registry
const DEFAULT_INTENTS: IntentDefinition[] = [
  {
    id: 'PRODUCT_SEARCH',
    name: 'Search Products',
    description: 'User wants to find products matching criteria',
    keywords: ['tafuta', 'nataka', 'ninatafuta', 'search', 'find', 'looking for', 'need', 'want', 'buy', 'nunua', 'gundua', 'ona'],
    examples: ['Natafuta simu', 'I want shoes', 'Tafuta laptop', 'Nunua nguo'],
    requiresAuth: false,
    tools: ['searchProducts'],
  },
  {
    id: 'SHOP_SEARCH',
    name: 'Search Shops',
    description: 'User wants to find shops/stores',
    keywords: ['duka', 'maduka', 'shop', 'store', 'seller', 'muuzaji', 'wauzaji'],
    examples: ['Tafuta duka la simu', 'Find electronics shop', 'Maduka ya Dar es Salaam'],
    requiresAuth: false,
    tools: ['searchShops'],
  },
  {
    id: 'PRODUCT_DETAILS',
    name: 'Product Details',
    description: 'User wants details about a specific product',
    keywords: ['details', 'maelezo', 'info', 'information', 'bei', 'price', 'specs'],
    examples: ['Maelezo ya simu hii', 'Show product details', 'Bei gani'],
    requiresAuth: false,
    tools: ['getProduct'],
  },
  {
    id: 'SHOP_DETAILS',
    name: 'Shop Details',
    description: 'User wants details about a specific shop',
    keywords: ['duka', 'shop', 'store', 'about', 'kuhusu', 'location', 'mahali'],
    examples: ['Duka lipo wapi', 'Where is this shop', 'Show shop info'],
    requiresAuth: false,
    tools: ['getShop'],
  },
  {
    id: 'PRICE_QUERY',
    name: 'Price Query',
    description: 'User is asking about prices',
    keywords: ['bei', 'price', 'cost', 'ghali', 'rahisi', 'ngapi', 'how much'],
    examples: ['Bei gani', 'How much', 'Ni ghali kiasi gani', 'Cheap options'],
    requiresAuth: false,
    tools: ['getProduct', 'searchProducts'],
  },
  {
    id: 'PRODUCT_COMPARISON',
    name: 'Product Comparison',
    description: 'User wants to compare products',
    keywords: ['linganisha', 'compare', 'vs', 'versus', 'difference', 'tofauti'],
    examples: ['Linganisha iPhone na Samsung', 'Compare these two', 'Tofauti ni ipi'],
    requiresAuth: false,
    tools: ['compareProducts'],
  },
  {
    id: 'RECOMMENDATION',
    name: 'Recommendation',
    description: 'User wants product recommendations',
    keywords: ['pendekeza', 'recommend', 'suggest', 'bora', 'best', 'nzuri'],
    examples: ['Nipendekee simu nzuri', 'Recommend best laptop', 'Bora chini ya 500k'],
    requiresAuth: false,
    tools: ['recommendProducts'],
  },
  {
    id: 'ORDER_STATUS',
    name: 'Order Status',
    description: 'User wants to check order status',
    keywords: ['oda', 'order', 'status', 'fuatilia', 'track', 'wapi', 'where'],
    examples: ['Fuatilia oda yangu', 'Track my order', 'Oda iko wapi'],
    requiresAuth: true,
    tools: ['getOrder'],
  },
  {
    id: 'ORDER_HELP',
    name: 'Order Help',
    description: 'User needs help with orders',
    keywords: ['oda', 'order', 'help', 'shida', 'problem', 'issue', 'return', 'refund'],
    examples: ['Nina shida na oda', 'Help with my order', 'Return policy'],
    requiresAuth: true,
    tools: ['getOrder', 'contactSupport'],
  },
  {
    id: 'SELLER_HELP',
    name: 'Seller Help',
    description: 'User wants to become a seller or needs seller assistance',
    keywords: ['sell', 'seller', 'muuzaji', 'kuwa', 'become', 'fungua duka', 'open store', 'anza kuuza'],
    examples: ['Nataka kuwa muuzaji', 'How to open shop', 'Fungua duka langu'],
    requiresAuth: false,
    tools: ['sellerOnboarding'],
  },
  {
    id: 'FLASH_DEAL_SEARCH',
    name: 'Flash Deal Search',
    description: 'User wants to find flash deals',
    keywords: ['flash', 'ofa', 'haraka', 'deal', 'punguzo', 'discount', 'limited'],
    examples: ['Ofa za haraka', 'Flash deals leo', 'Punguzo la muda'],
    requiresAuth: false,
    tools: ['getFlashDeals'],
  },
  {
    id: 'GROUP_BUY_SEARCH',
    name: 'Group Buy Search',
    description: 'User wants to find group buy deals',
    keywords: ['group', 'kikundi', 'pamoja', 'together', 'nunua pamoja', 'join'],
    examples: ['Nunua pamoja', 'Group deals', 'Jiunge na kikundi'],
    requiresAuth: false,
    tools: ['getGroupBuys'],
  },
  {
    id: 'VYBE_DISCOVERY',
    name: 'Vybe Discovery',
    description: 'User wants to explore Vybe content',
    keywords: ['vybe', 'social', 'post', 'machapisho', 'feed', 'mpasho'],
    examples: ['Vybe posts', 'Social feed', 'Gundua vybe'],
    requiresAuth: false,
    tools: ['getVybePosts'],
  },
  {
    id: 'PREFERRED_SHOP',
    name: 'Preferred Shop',
    description: 'User wants to mark or view preferred shops',
    keywords: ['preferred', 'penda', 'favorite', 'save', 'duka langu'],
    examples: ['Orodhesha duka', 'Save this shop', 'Maduka yangu'],
    requiresAuth: true,
    tools: ['addPreferredShop', 'getPreferredShops'],
  },
  {
    id: 'CART_HELP',
    name: 'Cart Help',
    description: 'User needs help with shopping cart',
    keywords: ['cart', 'kikapu', 'basket', 'checkout', 'maliza'],
    examples: ['Empty my cart', 'Checkout help', 'Kikapu changu'],
    requiresAuth: true,
    tools: ['getCart', 'updateCart'],
  },
  {
    id: 'ACCOUNT_HELP',
    name: 'Account Help',
    description: 'User needs account assistance',
    keywords: ['account', 'akaunti', 'profile', 'settings', 'mipangilio', 'login', 'password'],
    examples: ['Reset password', 'Settings', 'Badilisha akaunti'],
    requiresAuth: true,
    tools: ['updateAccount', 'resetPassword'],
  },
  {
    id: 'GENERAL_SHOPNEKT_HELP',
    name: 'General ShopNekt Help',
    description: 'General questions about ShopNekt platform',
    keywords: ['shopnekt', 'platform', 'help', 'saidia', 'jinsi', 'how', 'what', 'nini'],
    examples: ['What is ShopNekt', 'Jinsi ya kutumia', 'Platform help'],
    requiresAuth: false,
    tools: ['getHelpInfo'],
  },
]

export class IntentEngineImpl implements IntentEngine {
  private intents = new Map<IntentId, IntentDefinition>()

  constructor() {
    // Load default intents
    DEFAULT_INTENTS.forEach(intent => {
      this.intents.set(intent.id, intent)
    })
  }

  /**
   * Detect intent from text input
   */
  detectIntent(text: string, context?: ConversationContext): { intent: IntentId; confidence: number } {
    const lowerText = text.toLowerCase()
    const tokens = this.tokenize(lowerText)

    let bestMatch: { intent: IntentId; score: number } = {
      intent: 'GENERAL_SHOPNEKT_HELP',
      score: 0,
    }

    // Score each intent
    for (const [intentId, definition] of this.intents.entries()) {
      const score = this.scoreIntent(tokens, definition, context)

      if (score > bestMatch.score) {
        bestMatch = { intent: intentId, score }
      }
    }

    // Apply context boost if previous intent is related
    if (context?.currentIntent && context.currentIntent !== bestMatch.intent) {
      const relatedIntents = this.getRelatedIntents(context.currentIntent)
      if (relatedIntents.includes(bestMatch.intent)) {
        bestMatch.score *= 1.2 // 20% boost for related follow-up
      }
    }

    // Normalize confidence to 0-1 range
    const confidence = Math.min(1, bestMatch.score / 5)

    return {
      intent: bestMatch.intent,
      confidence,
    }
  }

  /**
   * Get intent definition by ID
   */
  getIntentDefinition(intentId: IntentId): IntentDefinition | null {
    return this.intents.get(intentId) || null
  }

  /**
   * Register a new intent definition
   */
  registerIntent(definition: IntentDefinition): void {
    this.intents.set(definition.id, definition)
  }

  /**
   * Get all registered intents
   */
  getAllIntents(): IntentDefinition[] {
    return Array.from(this.intents.values())
  }

  // ───────────────────────────────────────────────────────────
  // Private helper methods
  // ───────────────────────────────────────────────────────────

  private tokenize(text: string): string[] {
    return text
      .replace(/[.,!?;:()"'`]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0)
  }

  private scoreIntent(
    tokens: string[],
    definition: IntentDefinition,
    context?: ConversationContext
  ): number {
    let score = 0

    // Keyword matching
    for (const keyword of definition.keywords) {
      const keywordLower = keyword.toLowerCase()
      for (const token of tokens) {
        if (token === keywordLower) {
          score += 2 // Exact match
        } else if (token.includes(keywordLower) || keywordLower.includes(token)) {
          score += 1 // Partial match
        }
      }

      // Check full text for multi-word keywords
      if (tokens.join(' ').includes(keywordLower)) {
        score += 1.5
      }
    }

    // Example similarity bonus
    for (const example of definition.examples) {
      const exampleTokens = this.tokenize(example)
      const overlap = tokens.filter(t => exampleTokens.includes(t)).length
      if (overlap >= 2) {
        score += overlap * 0.5
      }
    }

    // Context bonus - if same as previous intent, slight boost
    if (context?.currentIntent === definition.id) {
      score += 1
    }

    return score
  }

  private getRelatedIntents(intentId: IntentId): IntentId[] {
    const relations: Record<string, IntentId[]> = {
      PRODUCT_SEARCH: ['PRODUCT_DETAILS', 'PRICE_QUERY', 'RECOMMENDATION', 'SHOP_SEARCH'],
      SHOP_SEARCH: ['SHOP_DETAILS', 'PRODUCT_SEARCH', 'PREFERRED_SHOP'],
      PRODUCT_DETAILS: ['PRODUCT_COMPARISON', 'PRICE_QUERY', 'RECOMMENDATION'],
      PRICE_QUERY: ['PRODUCT_SEARCH', 'PRODUCT_DETAILS', 'RECOMMENDATION'],
      ORDER_STATUS: ['ORDER_HELP'],
      ORDER_HELP: ['ORDER_STATUS'],
      FLASH_DEAL_SEARCH: ['GROUP_BUY_SEARCH', 'PRODUCT_SEARCH'],
      GROUP_BUY_SEARCH: ['FLASH_DEAL_SEARCH', 'PRODUCT_SEARCH'],
    }

    return relations[intentId] || []
  }
}
