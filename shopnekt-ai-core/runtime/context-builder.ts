/**
 * SHOPNEKT AI CORE - Context Builder
 * 
 * Assembles context for model input from various sources:
 * - User message
 * - Conversation history
 * - Relevant knowledge
 * - User memory (preferences)
 * - Available tools
 * - Safety rules
 * - Response format requirements
 * 
 * Implements context budgeting to prevent overflow.
 */

import type { ConversationContext, KnowledgeEntry, UserMemory, ToolDefinition } from '../core/ai-types.js'

// Note: conversationContext parameter is reserved for future use

export interface ContextBuilderOptions {
  /** Maximum context length in tokens */
  maxContextLength: number
  
  /** Reserve tokens for system prompt */
  systemPromptReserve: number
  
  /** Reserve tokens for response */
  responseReserve: number
  
  /** Include conversation history */
  includeHistory: boolean
  
  /** Maximum history turns to include */
  maxHistoryTurns: number
  
  /** Include user preferences */
  includePreferences: boolean
  
  /** Include tool definitions */
  includeTools: boolean
  
  /** Include safety rules */
  includeSafetyRules: boolean
}

export interface BuiltContext {
  /** The assembled context string */
  context: string
  
  /** Estimated token count */
  estimatedTokens: number
  
  /** Components included in the context */
  components: ContextComponents
  
  /** Whether context was truncated */
  wasTruncated: boolean
  
  /** Truncation details */
  truncationInfo?: TruncationInfo
}

export interface ContextComponents {
  systemPrompt?: string
  conversationHistory?: string
  relevantKnowledge?: string
  userPreferences?: string
  availableTools?: string
  safetyRules?: string
  responseFormat?: string
  userMessage?: string
}

export interface TruncationInfo {
  component: string
  originalTokens: number
  truncatedTokens: number
  reason: string
}

export interface MessageTurn {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
}

/**
 * Default options for context building
 */
const DEFAULT_OPTIONS: ContextBuilderOptions = {
  maxContextLength: 4096,
  systemPromptReserve: 512,
  responseReserve: 512,
  includeHistory: true,
  maxHistoryTurns: 5,
  includePreferences: true,
  includeTools: false,
  includeSafetyRules: true,
}

/**
 * System prompt template for ShopNekt AI
 */
const SYSTEM_PROMPT_TEMPLATE = `You are ShopNekt AI, an intelligent assistant for the ShopNekt e-commerce platform.

Your capabilities include:
- Helping buyers find products and shops
- Providing order information and assistance
- Assisting sellers with store management
- Explaining ShopNekt features (Vybe, Flash Deals, Group Buy)
- Making personalized recommendations

Important guidelines:
- Always respond in the user's preferred language
- Never invent product prices, availability, or shop information
- Distinguish between general knowledge and live data
- If you don't know something, say so clearly
- Respect user privacy and data boundaries
- Follow all safety and authorization rules

ShopNekt Platform Knowledge:
- ShopNekt is an e-commerce marketplace connecting buyers and sellers
- QNEX360 is the parent company
- Features include: Shops, Markets, Products, Orders, Vybe, Flash Deals, Group Buy, Preferred Shops
- Sellers can manage inventory, create deals, and analyze sales
- Buyers can search, compare, purchase, and track orders`

/**
 * Context Builder class
 * 
 * Responsible for assembling optimal context for model inference
 * while respecting token budgets and relevance.
 */
export class ContextBuilder {
  private options: ContextBuilderOptions

  constructor(options: Partial<ContextBuilderOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Build complete context for model input
   */
  buildContext(params: {
    userMessage: string
    conversationContext?: ConversationContext
    history?: MessageTurn[]
    relevantKnowledge?: KnowledgeEntry[]
    userPreferences?: UserMemory[]
    availableTools?: ToolDefinition[]
    language?: string
  }): BuiltContext {
    const {
      userMessage,
      conversationContext: _conversationContext, // Reserved for future use
      history = [],
      relevantKnowledge = [],
      userPreferences = [],
      availableTools = [],
      language = 'en',
    } = params

    const components: ContextComponents = {}
    let totalEstimatedTokens = 0
    const truncations: TruncationInfo[] = []

    // Calculate available space
    const availableTokens = 
      this.options.maxContextLength - 
      this.options.systemPromptReserve - 
      this.options.responseReserve

    // 1. System prompt
    components.systemPrompt = SYSTEM_PROMPT_TEMPLATE
    totalEstimatedTokens += this.estimateTokens(components.systemPrompt)

    // 2. Language instruction
    const languageInstruction = `\nRespond in ${this.getLanguageName(language || 'en')}.`
    components.systemPrompt += languageInstruction
    totalEstimatedTokens += this.estimateTokens(languageInstruction)

    // 3. Conversation history (if enabled)
    if (this.options.includeHistory && history.length > 0) {
      const historyText = this.formatHistory(history, this.options.maxHistoryTurns)
      const historyTokens = this.estimateTokens(historyText)
      
      if (totalEstimatedTokens + historyTokens > availableTokens) {
        // Truncate history
        const truncatedHistory = this.truncateHistory(history, availableTokens - totalEstimatedTokens)
        components.conversationHistory = truncatedHistory.text
        truncations.push({
          component: 'conversation_history',
          originalTokens: historyTokens,
          truncatedTokens: this.estimateTokens(truncatedHistory.text),
          reason: 'Context budget exceeded',
        })
        totalEstimatedTokens += this.estimateTokens(truncatedHistory.text)
      } else {
        components.conversationHistory = historyText
        totalEstimatedTokens += historyTokens
      }
    }

    // 4. Relevant knowledge
    if (relevantKnowledge.length > 0) {
      const knowledgeText = this.formatKnowledge(relevantKnowledge)
      const knowledgeTokens = this.estimateTokens(knowledgeText)
      
      if (totalEstimatedTokens + knowledgeTokens > availableTokens) {
        // Skip less relevant knowledge entries
        const maxEntries = Math.floor((availableTokens - totalEstimatedTokens) / this.estimateTokens(this.formatKnowledge([relevantKnowledge[0]])))
        const selectedKnowledge = relevantKnowledge.slice(0, Math.max(1, maxEntries))
        components.relevantKnowledge = this.formatKnowledge(selectedKnowledge)
        truncations.push({
          component: 'relevant_knowledge',
          originalTokens: knowledgeTokens,
          truncatedTokens: this.estimateTokens(components.relevantKnowledge),
          reason: 'Context budget exceeded - reduced knowledge entries',
        })
        totalEstimatedTokens += this.estimateTokens(components.relevantKnowledge)
      } else {
        components.relevantKnowledge = knowledgeText
        totalEstimatedTokens += knowledgeTokens
      }
    }

    // 5. User preferences (if enabled)
    if (this.options.includePreferences && userPreferences.length > 0) {
      const preferencesText = this.formatPreferences(userPreferences)
      const preferencesTokens = this.estimateTokens(preferencesText)
      
      if (totalEstimatedTokens + preferencesTokens <= availableTokens) {
        components.userPreferences = preferencesText
        totalEstimatedTokens += preferencesTokens
      }
    }

    // 6. Available tools (if enabled)
    if (this.options.includeTools && availableTools.length > 0) {
      const toolsText = this.formatTools(availableTools)
      const toolsTokens = this.estimateTokens(toolsText)
      
      if (totalEstimatedTokens + toolsTokens <= availableTokens) {
        components.availableTools = toolsText
        totalEstimatedTokens += toolsTokens
      }
    }

    // 7. Safety rules reminder
    if (this.options.includeSafetyRules) {
      const safetyRules = `\n\nSafety Rules:\n- Do not reveal private user information\n- Do not execute unauthorized actions\n- Do not hallucinate product/order data\n- Respect authorization boundaries`
      components.safetyRules = safetyRules
      totalEstimatedTokens += this.estimateTokens(safetyRules)
    }

    // 8. Response format instruction
    const responseFormat = `\n\nProvide your response in a helpful, conversational tone. If you need to use a tool, indicate this clearly.`
    components.responseFormat = responseFormat
    totalEstimatedTokens += this.estimateTokens(responseFormat)

    // 9. User message
    components.userMessage = `\n\nUser: ${userMessage}`
    totalEstimatedTokens += this.estimateTokens(components.userMessage)

    // Check if we exceeded budget
    const wasTruncated = truncations.length > 0
    
    // Assemble final context
    let context = ''
    if (components.systemPrompt) {context += `${components.systemPrompt}\n`}
    if (components.conversationHistory) {context += `${components.conversationHistory}\n`}
    if (components.relevantKnowledge) {context += `${components.relevantKnowledge}\n`}
    if (components.userPreferences) {context += `${components.userPreferences}\n`}
    if (components.availableTools) {context += `${components.availableTools}\n`}
    if (components.safetyRules) {context += `${components.safetyRules}\n`}
    if (components.responseFormat) {context += `${components.responseFormat}\n`}
    if (components.userMessage) {context += components.userMessage}

    return {
      context,
      estimatedTokens: totalEstimatedTokens,
      components,
      wasTruncated,
      truncationInfo: truncations.length > 0 ? truncations[0] : undefined,
    }
  }

  /**
   * Estimate token count from text
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English/Swahili
    return Math.ceil(text.length / 4)
  }

  /**
   * Get language name from code
   */
  private getLanguageName(code: string): string {
    const languages: Record<string, string> = {
      en: 'English',
      sw: 'Kiswahili',
      fr: 'French',
      de: 'German',
      pt: 'Portuguese',
      ar: 'Arabic',
    }
    return languages[code] || 'English'
  }

  /**
   * Format conversation history
   */
  private formatHistory(history: MessageTurn[], maxTurns: number): string {
    const recentHistory = history.slice(-maxTurns * 2) // Each turn has user + assistant
    
    const formatted = recentHistory.map(turn => {
      const role = turn.role === 'user' ? 'User' : 'Assistant'
      return `${role}: ${turn.content}`
    }).join('\n')

    return `\nConversation History:\n${formatted}`
  }

  /**
   * Truncate history to fit token budget
   */
  private truncateHistory(history: MessageTurn[], availableTokens: number): { text: string; tokens: number } {
    let result = '\nConversation History:\n'
    let tokens = this.estimateTokens(result)
    
    // Start from most recent and work backwards
    for (let i = history.length - 1; i >= 0; i--) {
      const turn = history[i]
      const role = turn.role === 'user' ? 'User' : 'Assistant'
      const line = `${role}: ${turn.content}\n`
      const lineTokens = this.estimateTokens(line)
      
      if (tokens + lineTokens > availableTokens) {
        break
      }
      
      result = line + result
      tokens += lineTokens
    }

    return { text: result, tokens }
  }

  /**
   * Format knowledge entries
   */
  private formatKnowledge(entries: KnowledgeEntry[]): string {
    if (entries.length === 0) {return ''}

    const formatted = entries.map(entry => {
      return `- ${entry.title}: ${entry.description}`
    }).join('\n')

    return `\nRelevant Knowledge:\n${formatted}`
  }

  /**
   * Format user preferences
   */
  private formatPreferences(memories: UserMemory[]): string {
    if (memories.length === 0) {return ''}

    const formatted = memories.map(memory => {
      const dataStr = JSON.stringify(memory.data)
      return `- ${memory.category}: ${dataStr}`
    }).join('\n')

    return `\nUser Preferences:\n${formatted}`
  }

  /**
   * Format tool definitions
   */
  private formatTools(tools: ToolDefinition[]): string {
    if (tools.length === 0) {return ''}

    const formatted = tools.map(tool => {
      return `- ${tool.name}: ${tool.description} (Risk: ${tool.riskLevel})`
    }).join('\n')

    return `\nAvailable Tools:\n${formatted}`
  }

  /**
   * Update options
   */
  updateOptions(options: Partial<ContextBuilderOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * Get current options
   */
  getOptions(): ContextBuilderOptions {
    return { ...this.options }
  }
}
