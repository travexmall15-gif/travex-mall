/**
 * SHOPNEKT AI CORE - Main Engine Implementation
 * 
 * The central orchestrator for all AI Core operations.
 * Coordinates language understanding, intent detection, entity extraction,
 * context management, memory, knowledge, reasoning, and response generation.
 */

import type {
  AIRequest,
  AIResponse,
  AIEngineConfig,
  ShopNektAIEngine,
  ModelRuntime,
  SupportedLanguage,
  ExtractedEntity,
  EvaluationTestCase,
  EvaluationReport,
} from './ai-types.js'

import { LanguageEngineImpl } from './language-engine.js'
import { ContextEngineImpl } from './context-engine.js'
import { IntentEngineImpl } from './intent-engine.js'
import { EntityEngineImpl } from './entity-engine.js'
import { KnowledgeEngineImpl } from './knowledge-engine.js'
import { MemoryEngineImpl } from './memory-engine.js'
import { ReasoningEngineImpl } from './reasoning-engine.js'
import { ResponseEngineImpl } from './response-engine.js'

import type {
  LanguageEngine,
  IntentEngine,
  EntityEngine,
  ContextEngine,
  MemoryEngine,
  KnowledgeEngine,
  ReasoningEngine,
  ResponseEngine,
} from './ai-types.js'

export class ShopNektAIEngineImpl implements ShopNektAIEngine {
  private config: AIEngineConfig | null = null
  private modelRuntime: ModelRuntime | null = null
  private initialized = false

  // Engines
  private languageEngine: LanguageEngineImpl | null = null
  private contextEngine: ContextEngineImpl | null = null
  private intentEngine: IntentEngineImpl | null = null
  private entityEngine: EntityEngineImpl | null = null
  private knowledgeEngine: KnowledgeEngineImpl | null = null
  private memoryEngine: MemoryEngineImpl | null = null
  private reasoningEngine: ReasoningEngineImpl | null = null
  private responseEngine: ResponseEngineImpl | null = null

  /**
   * Initialize the AI Core with configuration
   */
  async initialize(config: AIEngineConfig): Promise<void> {
    if (this.initialized) {
      throw new Error('AI Core already initialized')
    }

    this.config = config

    // Initialize all engines
    this.languageEngine = new LanguageEngineImpl()
    this.contextEngine = new ContextEngineImpl(config.sessionTimeout)
    this.intentEngine = new IntentEngineImpl()
    this.entityEngine = new EntityEngineImpl()
    this.knowledgeEngine = new KnowledgeEngineImpl()
    this.memoryEngine = new MemoryEngineImpl(config.enableMemory)
    this.reasoningEngine = new ReasoningEngineImpl()
    this.responseEngine = new ResponseEngineImpl()

    // Load static knowledge and configurations
    await this.loadStaticKnowledge()
    await this.loadIntentRegistry()
    await this.loadEntityDefinitions()

    this.initialized = true
    this.log('info', 'AI Core initialized successfully')
  }

  /**
   * Process an incoming AI request
   */
  async processRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error('AI Core not initialized')
    }

    const startTime = Date.now()
    this.log('debug', 'Processing request', { sessionId: request.sessionId })

    try {
      // Step 1: Detect/validate language
      const language = request.language || this.config!.defaultLanguage

      // Step 2: Normalize input
      const normalizedText = this.languageEngine!.normalize(request.message, language)

      // Step 3: Get or create context
      let context = this.contextEngine!.getContext(request.sessionId)
      if (!context) {
        context = this.contextEngine!.createContext(request.sessionId, language)
      }

      // Step 4: Detect intent
      const intentResult = this.intentEngine!.detectIntent(normalizedText, context)

      // Step 5: Extract entities
      const entities = this.entityEngine!.extractEntities(normalizedText, intentResult.intent)

      // Step 6: Update context with new information
      context = this.contextEngine!.updateContext(context, intentResult.intent, entities)

      // Step 7: Apply reasoning rules and safety checks
      const reasoningResult = this.reasoningEngine!.applyRules(request, context)
      if (!reasoningResult.allowed) {
        return this.createBlockedResponse(reasoningResult.reasons, request.language)
      }

      // Step 8: Generate response
      const response = await this.responseEngine!.generateResponse(
        intentResult.intent,
        this.entitiesToRecord(entities),
        context,
        language
      )

      // Step 9: Apply response policy
      const policyResponse = this.responseEngine!.applyPolicy(response, this.getDefaultPolicy())

      // Step 10: Add metadata
      policyResponse.metadata = {
        processingTimeMs: Date.now() - startTime,
        modelUsed: this.modelRuntime?.getModelId() || 'none',
      }

      this.log('info', 'Request processed', {
        sessionId: request.sessionId,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        processingTime: policyResponse.metadata?.processingTimeMs,
      })

      return policyResponse
    } catch (error) {
      this.log('error', 'Error processing request', { error })
      return this.createErrorResponse(this.config!.defaultLanguage)
    }
  }

  /**
   * Get the language engine
   */
  getLanguageEngine(): LanguageEngine {
    if (!this.languageEngine) {
      throw new Error('AI Core not initialized')
    }
    return this.languageEngine
  }

  /**
   * Get the intent engine
   */
  getIntentEngine(): IntentEngine {
    if (!this.intentEngine) {
      throw new Error('AI Core not initialized')
    }
    return this.intentEngine
  }

  /**
   * Get the entity engine
   */
  getEntityEngine(): EntityEngine {
    if (!this.entityEngine) {
      throw new Error('AI Core not initialized')
    }
    return this.entityEngine
  }

  /**
   * Get the context engine
   */
  getContextEngine(): ContextEngine {
    if (!this.contextEngine) {
      throw new Error('AI Core not initialized')
    }
    return this.contextEngine
  }

  /**
   * Get the memory engine
   */
  getMemoryEngine(): MemoryEngine {
    if (!this.memoryEngine) {
      throw new Error('AI Core not initialized')
    }
    return this.memoryEngine
  }

  /**
   * Get the knowledge engine
   */
  getKnowledgeEngine(): KnowledgeEngine {
    if (!this.knowledgeEngine) {
      throw new Error('AI Core not initialized')
    }
    return this.knowledgeEngine
  }

  /**
   * Get the reasoning engine
   */
  getReasoningEngine(): ReasoningEngine {
    if (!this.reasoningEngine) {
      throw new Error('AI Core not initialized')
    }
    return this.reasoningEngine
  }

  /**
   * Get the response engine
   */
  getResponseEngine(): ResponseEngine {
    if (!this.responseEngine) {
      throw new Error('AI Core not initialized')
    }
    return this.responseEngine
  }

  /**
   * Set the model runtime implementation
   */
  setModelRuntime(runtime: ModelRuntime): void {
    this.modelRuntime = runtime
    this.log('info', 'Model runtime set', { modelId: runtime.getModelId() })
  }

  /**
   * Get the current model runtime
   */
  getModelRuntime(): ModelRuntime | null {
    return this.modelRuntime
  }

  /**
   * Run evaluation test cases
   */
  async runEvaluation(testCases: EvaluationTestCase[]): Promise<EvaluationReport> {
    if (!this.initialized) {
      throw new Error('AI Core not initialized')
    }

    const results: EvaluationReport['results'] = []
    let passedCount = 0
    let failedCount = 0
    const categoryResults: Record<string, { passed: number; failed: number }> = {}
    let totalConfidence = 0

    for (const testCase of testCases) {
      const startTime = Date.now()
      const errors: string[] = []

      try {
        const response = await this.processRequest(testCase.input)

        // Check intent match
        const intentMatch = !testCase.expectedIntent || response.intent === testCase.expectedIntent
        if (!intentMatch) {
          errors.push(`Intent mismatch: expected ${testCase.expectedIntent}, got ${response.intent}`)
        }

        // Check confidence threshold
        const confidenceOk = response.confidence >= testCase.minConfidence
        if (!confidenceOk) {
          errors.push(`Confidence below threshold: ${response.confidence} < ${testCase.minConfidence}`)
        }

        const passed = intentMatch && confidenceOk && errors.length === 0
        if (passed) {
          passedCount++
        } else {
          failedCount++
        }

        // Update category results
        if (!categoryResults[testCase.category]) {
          categoryResults[testCase.category] = { passed: 0, failed: 0 }
        }
        if (passed) {
          categoryResults[testCase.category].passed++
        } else {
          categoryResults[testCase.category].failed++
        }

        totalConfidence += response.confidence

        results.push({
          testCaseId: testCase.id,
          passed,
          actualIntent: response.intent ?? undefined,
          expectedIntent: testCase.expectedIntent,
          actualConfidence: response.confidence,
          expectedConfidence: testCase.minConfidence,
          errors,
          executionTime: Date.now() - startTime,
        })
      } catch (error) {
        failedCount++
        errors.push(`Execution error: ${(error as Error).message}`)

        if (!categoryResults[testCase.category]) {
          categoryResults[testCase.category] = { passed: 0, failed: 0 }
        }
        categoryResults[testCase.category].failed++

        results.push({
          testCaseId: testCase.id,
          passed: false,
          errors,
          actualConfidence: 0,
          expectedConfidence: testCase.minConfidence,
          executionTime: Date.now() - startTime,
        })
      }
    }

    return {
      totalTests: testCases.length,
      passedTests: passedCount,
      failedTests: failedCount,
      averageConfidence: testCases.length > 0 ? totalConfidence / testCases.length : 0,
      categoryResults,
      results,
      executedAt: Date.now(),
    }
  }

  /**
   * Shutdown the AI Core gracefully
   */
  async shutdown(): Promise<void> {
    this.log('info', 'Shutting down AI Core')
    this.initialized = false
    this.modelRuntime = null
    // Clear contexts and cleanup
    if (this.contextEngine) {
      // Future: persist contexts if needed
    }
    this.log('info', 'AI Core shutdown complete')
  }

  // ───────────────────────────────────────────────────────────
  // Private helper methods
  // ───────────────────────────────────────────────────────────

  private async loadStaticKnowledge(): Promise<void> {
    // Load static knowledge from JSON files
    // This will be implemented to load from /knowledge directory
    this.log('info', 'Loading static knowledge')
  }

  private async loadIntentRegistry(): Promise<void> {
    // Load intent definitions from /intent/registry.json
    this.log('info', 'Loading intent registry')
  }

  private async loadEntityDefinitions(): Promise<void> {
    // Load entity definitions from /entities directory
    this.log('info', 'Loading entity definitions')
  }

  private entitiesToRecord(entities: ExtractedEntity[]): Record<string, ExtractedEntity> {
    const record: Record<string, ExtractedEntity> = {}
    for (const entity of entities) {
      record[entity.type] = entity
    }
    return record
  }

  private createBlockedResponse(reasons: string[], language: SupportedLanguage): AIResponse {
    const message = language === 'sw'
      ? 'Samahani, siwezi kufanya hatua hiyo kwa sababu za usalama.'
      : 'Sorry, I cannot perform that action due to safety restrictions.'

    return {
      message,
      language,
      intent: null,
      entities: {},
      actions: [],
      citations: [],
      confidence: 1.0,
      requiresToolExecution: false,
      metadata: { blocked: true, reasons },
    }
  }

  private createErrorResponse(language: SupportedLanguage): AIResponse {
    const message = language === 'sw'
      ? 'Samahani, nimetatizika kuchakata ombi lako. Tafadhali jaribu tena.'
      : 'Sorry, I encountered an error processing your request. Please try again.'

    return {
      message,
      language,
      intent: null,
      entities: {},
      actions: [],
      citations: [],
      confidence: 0,
      requiresToolExecution: false,
      metadata: { error: true },
    }
  }

  private getDefaultPolicy() {
    return {
      id: 'default',
      name: 'Default Response Policy',
      rules: {
        requireUserLanguage: true,
        preserveBrandTerminology: true,
        useConversationContext: true,
        avoidRepetition: true,
        communicateUncertainty: true,
        neverInventData: true,
        distinguishKnowledgeFromLiveData: true,
      },
    }
  }

  private log(level: AIEngineConfig['logLevel'], message: string, data?: Record<string, unknown>): void {
    if (!this.config) return

    const logLevels: Record<string, number> = { debug: 0, info: 1, warn: 2, error: 3 }
    const currentLevel = logLevels[this.config.logLevel]
    const messageLevel = logLevels[level]

    if (messageLevel >= currentLevel) {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data || '')
    }
  }
}

// Export singleton instance pattern for convenience
let aiEngineInstance: ShopNektAIEngineImpl | null = null

export function getAIEngine(): ShopNektAIEngine {
  if (!aiEngineInstance) {
    aiEngineInstance = new ShopNektAIEngineImpl()
  }
  return aiEngineInstance
}
