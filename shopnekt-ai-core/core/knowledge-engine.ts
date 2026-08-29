/**
 * SHOPNEKT AI CORE - Knowledge Engine Implementation
 * 
 * Manages static knowledge about ShopNekt platform, concepts, rules, and workflows.
 * Does NOT contain live data - only schemas, concepts, and relationships.
 */

import type { KnowledgeEngine, KnowledgeDomain, KnowledgeEntry } from './ai-types.js'

export class KnowledgeEngineImpl implements KnowledgeEngine {
  private knowledgeBase = new Map<string, KnowledgeEntry[]>()

  constructor() {
    this.loadDefaultKnowledge()
  }

  /**
   * Get a specific knowledge entry
   */
  getKnowledge(domain: KnowledgeDomain, key: string): KnowledgeEntry | null {
    const entries = this.knowledgeBase.get(domain) || []
    return entries.find(e => e.key === key) || null
  }

  /**
   * Search knowledge across domains
   */
  searchKnowledge(query: string, domains?: KnowledgeDomain[]): KnowledgeEntry[] {
    const lowerQuery = query.toLowerCase()
    const results: KnowledgeEntry[] = []

    const searchDomains = domains || Array.from(this.knowledgeBase.keys())

    for (const domain of searchDomains) {
      const entries = this.knowledgeBase.get(domain) || []
      for (const entry of entries) {
        if (
          entry.title.toLowerCase().includes(lowerQuery) ||
          entry.description.toLowerCase().includes(lowerQuery) ||
          Object.values(entry.terminology).some(t => t.toLowerCase().includes(lowerQuery))
        ) {
          results.push(entry)
        }
      }
    }

    return results
  }

  /**
   * Get all knowledge entries for a domain
   */
  getDomainDefinitions(domain: KnowledgeDomain): KnowledgeEntry[] {
    return this.knowledgeBase.get(domain) || []
  }

  /**
   * Add or update a knowledge entry
   */
  addKnowledge(domain: KnowledgeDomain, entry: KnowledgeEntry): void {
    const entries = this.knowledgeBase.get(domain) || []
    const existingIndex = entries.findIndex(e => e.key === entry.key)

    if (existingIndex >= 0) {
      entries[existingIndex] = entry
    } else {
      entries.push(entry)
    }

    this.knowledgeBase.set(domain, entries)
  }

  // ───────────────────────────────────────────────────────────
  // Private methods
  // ───────────────────────────────────────────────────────────

  private loadDefaultKnowledge(): void {
    // ShopNekt Platform Knowledge
    this.addKnowledge('shopnekt', {
      domain: 'shopnekt',
      key: 'what_is_shopnekt',
      title: 'What is ShopNekt',
      description: 'ShopNekt is an AI-powered digital marketplace platform that enables entrepreneurs to open online stores in minutes and sell globally.',
      relationships: ['markets', 'shops', 'sellers', 'buyers'],
      workflows: ['open_store', 'browse_products', 'place_order'],
      terminology: {
        'ShopNekt': 'The main platform',
        'Marketplace': 'Digital market space',
        'AI': 'Artificial Intelligence assistance',
      },
    })

    this.addKnowledge('shopnekt', {
      domain: 'shopnekt',
      key: 'qnex360',
      title: 'QNEX360',
      description: 'QNEX360 is the parent company behind ShopNekt, focused on empowering African entrepreneurs through technology.',
      relationships: ['shopnekt'],
      workflows: [],
      terminology: {
        'QNEX360': 'Parent company',
      },
    })

    // Markets Knowledge
    this.addKnowledge('markets', {
      domain: 'markets',
      key: 'business_market',
      title: 'Business Market (Soko la Biashara)',
      description: 'The main marketplace for verified sellers with all product categories across multiple regions. 500+ shops available.',
      relationships: ['shops', 'products', 'sellers'],
      workflows: ['browse_shops', 'search_products', 'contact_seller'],
      terminology: {
        'Business Market': 'Soko la Biashara',
        'Verified Sellers': 'Wauzaji Waliohakikishwa',
      },
    })

    this.addKnowledge('markets', {
      domain: 'markets',
      key: 'campus_market',
      title: 'Campus Market (Soko la Vyuo)',
      description: 'Student-only marketplace for buying and selling within university campuses. Verified student sellers.',
      relationships: ['shops', 'students', 'universities'],
      workflows: ['verify_student', 'browse_campus_shops', 'campus_delivery'],
      terminology: {
        'Campus Market': 'Soko la Vyuo',
        'Student Plan': 'Mpango wa Mwanafunzi',
      },
    })

    this.addKnowledge('markets', {
      domain: 'markets',
      key: 'vybe',
      title: 'Social Vybe',
      description: 'Social commerce feed where verified sellers post products and engage with buyers. Live feed of photos and reels.',
      relationships: ['posts', 'sellers', 'products'],
      workflows: ['post_product', 'like_post', 'share_post', 'visit_shop'],
      terminology: {
        'Vybe': 'Social commerce feed',
        'Posts': 'Machapisho',
        'Feed': 'Mpasho',
      },
    })

    // Flash Deals Knowledge
    this.addKnowledge('flashDeals', {
      domain: 'flashDeals',
      key: 'what_are_flash_deals',
      title: 'Flash Deals (Ofa za Haraka)',
      description: 'Time-limited special offers from sellers with significant discounts. Limited duration deals.',
      relationships: ['products', 'sellers', 'discounts'],
      workflows: ['browse_flash_deals', 'claim_deal', 'time_tracking'],
      terminology: {
        'Flash Deal': 'Ofa ya Haraka',
        'Limited Time': 'Muda Mfupi',
      },
    })

    // Group Buy Knowledge
    this.addKnowledge('groupBuy', {
      domain: 'groupBuy',
      key: 'what_is_group_buy',
      title: 'Group Buy (Nunua Pamoja)',
      description: 'Join groups with other buyers to unlock discounts up to 20%. More members = bigger discounts.',
      relationships: ['groups', 'members', 'discounts'],
      workflows: ['join_group', 'reach_minimum', 'unlock_discount', 'complete_purchase'],
      terminology: {
        'Group Buy': 'Nunua Pamoja',
        'Group': 'Kikundi',
        'Discount': 'Punguzo',
      },
    })

    // Sellers Knowledge
    this.addKnowledge('sellers', {
      domain: 'sellers',
      key: 'become_a_seller',
      title: 'Become a Seller',
      description: 'Anyone can become a ShopNekt seller by opening a store. Choose between Business Market or Campus Market (students only).',
      relationships: ['shops', 'markets', 'subscription'],
      workflows: ['register', 'choose_plan', 'setup_shop', 'add_products'],
      terminology: {
        'Seller': 'Muuzaji',
        'Open Store': 'Fungua Duka',
        'Premium Plan': 'Mpango wa Premium',
        'Basic Plan': 'Mpango wa Msingi',
      },
    })

    this.addKnowledge('sellers', {
      domain: 'sellers',
      key: 'seller_plans',
      title: 'Seller Subscription Plans',
      description: 'ShopNekt offers Basic and Premium subscription plans for sellers. Premium includes more visibility and features.',
      relationships: ['subscription', 'features'],
      workflows: ['choose_plan', 'upgrade_plan'],
      terminology: {
        'Premium': 'Daraja la Juu',
        'Basic': 'Msingi',
        'Per Month': '/ mwezi',
      },
    })

    // Buyers Knowledge
    this.addKnowledge('buyers', {
      domain: 'buyers',
      key: 'buyer_experience',
      title: 'Buyer Experience',
      description: 'Buyers can browse shops, search products, compare items, track orders, and get AI assistance throughout their journey.',
      relationships: ['products', 'shops', 'orders', 'ai'],
      workflows: ['browse', 'search', 'compare', 'order', 'track'],
      terminology: {
        'Buyer': 'Mnunuzi',
        'Order': 'Oda',
        'Track': 'Fuatilia',
      },
    })

    // Orders Knowledge
    this.addKnowledge('orders', {
      domain: 'orders',
      key: 'order_workflow',
      title: 'Order Workflow',
      description: 'Orders go through confirmation, processing, shipping, and delivery stages. Buyers can track status at each stage.',
      relationships: ['buyers', 'sellers', 'shipping'],
      workflows: ['place_order', 'confirm_payment', 'ship', 'deliver', 'complete'],
      terminology: {
        'Order Status': 'Hali ya Oda',
        'Processing': 'Inachakatwa',
        'Shipped': 'Imeondoka',
        'Delivered': 'Imefika',
      },
    })

    // Preferred Shops Knowledge
    this.addKnowledge('preferredShops', {
      domain: 'preferredShops',
      key: 'preferred_shops',
      title: 'Preferred Shops',
      description: 'Buyers can save favorite shops for quick access. Preferred shops appear in personalized recommendations.',
      relationships: ['shops', 'buyers', 'recommendations'],
      workflows: ['save_shop', 'view_preferred', 'get_recommendations'],
      terminology: {
        'Preferred': 'Pendwa',
        'Favorite': 'Kipendwa',
      },
    })

    // Platform Rules Knowledge
    this.addKnowledge('platformRules', {
      domain: 'platformRules',
      key: 'platform_rules',
      title: 'Platform Rules',
      description: 'ShopNekt maintains quality standards for sellers, prohibits certain products, and ensures fair trading practices.',
      relationships: ['sellers', 'buyers', 'moderation'],
      workflows: ['report_violation', 'review_content', 'enforce_rules'],
      terminology: {
        'Rules': 'Sheria',
        'Violation': 'Ukiukwaji',
        'Moderation': 'Usimamizi',
      },
    })

    // AI Knowledge
    this.addKnowledge('ai', {
      domain: 'ai',
      key: 'ai_assistant',
      title: 'AI Assistant',
      description: 'ShopNekt AI helps buyers find products, get recommendations, track orders, and assists sellers with store management.',
      relationships: ['buyers', 'sellers', 'tools'],
      workflows: ['ask_question', 'get_recommendation', 'execute_tool'],
      terminology: {
        'AI': 'Akili Bandia',
        'Assistant': 'Msaidizi',
      },
    })
  }
}
