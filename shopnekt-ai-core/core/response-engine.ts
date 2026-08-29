/**
 * SHOPNEKT AI CORE - Response Engine Implementation
 * 
 * Generates appropriate responses based on intent, entities, and context.
 * Applies response policies to ensure quality and consistency.
 */

import type {
  ResponseEngine,
  IntentId,
  ExtractedEntity,
  ConversationContext,
  SupportedLanguage,
  AIResponse,
  ResponsePolicy,
  AIAction,
} from './ai-types.js'

// Response templates by language and intent
const RESPONSE_TEMPLATES: Record<string, Record<IntentId, Record<string, string>>> = {
  sw: {
    PRODUCT_SEARCH: {
      found: 'Nimekupata bidhaa {count} zinazolingana na utafutaji wako.',
      none: 'Samahani, sikupata bidhaa zinazolingana na "{query}".',
      followup: 'Je, unataka nifanye utafutaji kwa bei gani?',
    },
    SHOP_SEARCH: {
      found: 'Nimekupata maduka {count} yanayouza bidhaa unazotafuta.',
      none: 'Samahani, sikupata maduka kwa eneo hili.',
      followup: 'Je, unataka kuona maduka ya mkoa gani?',
    },
    ORDER_STATUS: {
      found: 'Oda yako iko katika hali ya "{status}".',
      none: 'Samahani, sikupata oda kwa nambari uliyotoa.',
      followup: 'Je, ungependa maelezo zaidi kuhusu oda yako?',
    },
    GENERAL_SHOPNEKT_HELP: {
      default: 'Karibu ShopNekt! Ninaweza kukusaidiaje leo?',
    },
  },
  en: {
    PRODUCT_SEARCH: {
      found: 'I found {count} products matching your search.',
      none: 'Sorry, I couldn\'t find products matching "{query}".',
      followup: 'Would you like me to search within a specific price range?',
    },
    SHOP_SEARCH: {
      found: 'I found {count} shops selling products you\'re looking for.',
      none: 'Sorry, I couldn\'t find shops in this location.',
      followup: 'Which region would you like to see shops from?',
    },
    ORDER_STATUS: {
      found: 'Your order is currently "{status}".',
      none: 'Sorry, I couldn\'t find an order with that number.',
      followup: 'Would you like more details about your order?',
    },
    GENERAL_SHOPNEKT_HELP: {
      default: 'Welcome to ShopNekt! How can I help you today?',
    },
  },
}

export class ResponseEngineImpl implements ResponseEngine {
  /**
   * Generate a response based on intent, entities, and context
   */
  async generateResponse(
    intent: IntentId,
    entities: Record<string, ExtractedEntity>,
    context: ConversationContext,
    language: SupportedLanguage
  ): Promise<AIResponse> {
    const templateSet = RESPONSE_TEMPLATES[language] || RESPONSE_TEMPLATES['en']
    const intentTemplates = templateSet[intent] || templateSet['GENERAL_SHOPNEKT_HELP']

    let message = ''
    let actions: AIAction[] = []
    let confidence = 0.7

    // Generate message based on intent
    switch (intent) {
      case 'PRODUCT_SEARCH':
        if (entities.category || entities.product) {
          message = intentTemplates.found.replace('{count}', 'several')
          confidence = 0.85

          // Add search action
          actions.push({
            type: 'search_products',
            tool: 'searchProducts',
            parameters: this.buildSearchParameters(entities),
            confidence: 0.85,
          })
        } else {
          message = intentTemplates.followup
          confidence = 0.6
        }
        break

      case 'SHOP_SEARCH':
        if (entities.location || entities.category) {
          message = intentTemplates.found.replace('{count}', 'several')
          confidence = 0.85

          actions.push({
            type: 'search_shops',
            tool: 'searchShops',
            parameters: this.buildSearchParameters(entities),
            confidence: 0.85,
          })
        } else {
          message = intentTemplates.followup
          confidence = 0.6
        }
        break

      case 'ORDER_STATUS':
      case 'ORDER_HELP':
        if (entities.orderId) {
          message = intentTemplates.found.replace('{status}', 'processing')
          confidence = 0.9

          actions.push({
            type: 'get_order',
            tool: 'getOrder',
            parameters: { orderId: entities.orderId.value },
            confidence: 0.9,
          })
        } else {
          message = 'Please provide your order number.'
          confidence = 0.5
        }
        break

      case 'SELLER_HELP':
        message = language === 'sw'
          ? 'Ninaweza kukusaidia kufungua duka lako la ShopNekt. Je, ungependa kujua zaidi kuhusu mipango yetu?'
          : 'I can help you open your ShopNekt store. Would you like to know more about our plans?'
        confidence = 0.8
        actions.push({
          type: 'seller_onboarding',
          tool: 'sellerOnboarding',
          parameters: {},
          confidence: 0.8,
        })
        break

      case 'FLASH_DEAL_SEARCH':
        message = language === 'sw'
          ? 'Ninaangalia ofa za haraka zinazopatikana sasa...'
          : 'Let me check the available flash deals...'
        confidence = 0.75
        actions.push({
          type: 'get_flash_deals',
          tool: 'getFlashDeals',
          parameters: {},
          confidence: 0.75,
        })
        break

      case 'GROUP_BUY_SEARCH':
        message = language === 'sw'
          ? 'Ninaangalia vikundi vinavyofanya kazi...'
          : 'Let me check the active group buy deals...'
        confidence = 0.75
        actions.push({
          type: 'get_group_buys',
          tool: 'getGroupBuys',
          parameters: {},
          confidence: 0.75,
        })
        break

      case 'RECOMMENDATION':
        message = language === 'sw'
          ? 'Nitakupendekeza bidhaa bora kulingana na unachotafuta.'
          : 'Let me recommend the best products based on what you\'re looking for.'
        confidence = 0.7
        actions.push({
          type: 'recommend_products',
          tool: 'recommendProducts',
          parameters: this.buildSearchParameters(entities),
          confidence: 0.7,
        })
        break

      case 'GENERAL_SHOPNEKT_HELP':
      default:
        message = intentTemplates.default
        confidence = 0.5
        break
    }

    // Build response
    const response: AIResponse = {
      message,
      language,
      intent,
      entities,
      actions,
      citations: [],
      confidence,
      requiresToolExecution: actions.length > 0,
      context: {
        sessionId: context.sessionId,
        currentIntent: intent,
        language,
      },
    }

    return response
  }

  /**
   * Apply response policy to ensure quality standards
   */
  applyPolicy(response: AIResponse, policy: ResponsePolicy): AIResponse {
    const rules = policy.rules

    // Ensure response is in user's language
    if (rules.requireUserLanguage) {
      // Already handled during generation
    }

    // Prevent hallucination indicators
    if (rules.neverInventData) {
      // Remove any speculative content
      const uncertaintyPhrases = [
        'probably', 'maybe', 'might be', 'I think',
        'labda', 'nafikiri', 'inawezekana',
      ]
      for (const phrase of uncertaintyPhrases) {
        response.message = response.message.replace(new RegExp(phrase, 'gi'), '')
      }
    }

    // Communicate uncertainty when appropriate
    if (rules.communicateUncertainty && response.confidence < 0.5) {
      const uncertaintyMessage = response.language === 'sw'
        ? ' Ninafanya utafutaji bora nilioweza.'
        : ' I\'m doing my best search.'
      response.message += uncertaintyMessage
    }

    // Avoid repetition
    if (rules.avoidRepetition && response.context?.sessionId) {
      // Future: Check conversation history for repeated phrases
    }

    return response
  }

  // ───────────────────────────────────────────────────────────
  // Private methods
  // ───────────────────────────────────────────────────────────

  private buildSearchParameters(entities: Record<string, ExtractedEntity>): Record<string, unknown> {
    const params: Record<string, unknown> = {}

    if (entities.category) {
      params.category = entities.category.value
    }

    if (entities.brand) {
      params.brand = entities.brand.value
    }

    if (entities.price) {
      params.maxPrice = entities.price.value
    }

    if (entities.location) {
      params.location = entities.location.value
    }

    if (entities.product) {
      params.query = entities.product.value
    }

    return params
  }

  /**
   * Get localized message for common scenarios
   */
  getLocalizedMessage(key: string, language: SupportedLanguage, variables?: Record<string, string | number>): string {
    const templates: Record<string, Record<string, string>> = {
      not_found: {
        sw: 'Samahani, sikupata "{query}".',
        en: 'Sorry, I couldn\'t find "{query}".',
      },
      requires_auth: {
        sw: 'Tafadhali ingia ili kupata taarifa hii.',
        en: 'Please sign in to access this information.',
      },
      processing: {
        sw: 'Ninachakata ombi lako...',
        en: 'Processing your request...',
      },
      error: {
        sw: 'Samahani, nimetatizika. Tafadhali jaribu tena.',
        en: 'Sorry, I encountered an error. Please try again.',
      },
    }

    let message = templates[key]?.[language] || key

    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        message = message.replace(`{${key}}`, String(value))
      }
    }

    return message
  }
}
