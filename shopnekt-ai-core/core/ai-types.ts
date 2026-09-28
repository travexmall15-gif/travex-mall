/**
 * SHOPNEKT AI CORE - Type Definitions
 * 
 * Foundation types for the AI Core system.
 * These types define the contract for all AI Core operations.
 */

// ─────────────────────────────────────────────────────────────
// LANGUAGE SUPPORT
// ─────────────────────────────────────────────────────────────

export type SupportedLanguage = 'en' | 'sw' | 'fr' | 'de' | 'pt' | 'ar'

export interface LanguageMeta {
  code: SupportedLanguage
  name: string
  flag: string
  dir: 'ltr' | 'rtl'
}

// ─────────────────────────────────────────────────────────────
// INTENT REGISTRY
// ─────────────────────────────────────────────────────────────

export type IntentId =
  | 'PRODUCT_SEARCH'
  | 'SHOP_SEARCH'
  | 'PRODUCT_DETAILS'
  | 'SHOP_DETAILS'
  | 'PRICE_QUERY'
  | 'PRODUCT_COMPARISON'
  | 'RECOMMENDATION'
  | 'ORDER_STATUS'
  | 'ORDER_HELP'
  | 'SELLER_HELP'
  | 'FLASH_DEAL_SEARCH'
  | 'GROUP_BUY_SEARCH'
  | 'VYBE_DISCOVERY'
  | 'PREFERRED_SHOP'
  | 'CART_HELP'
  | 'ACCOUNT_HELP'
  | 'GENERAL_SHOPNEKT_HELP'
  | string // extensible for future intents

export interface IntentDefinition {
  id: IntentId
  name: string
  description: string
  keywords: string[]
  examples: string[]
  requiresAuth: boolean
  tools: string[]
}

// ─────────────────────────────────────────────────────────────
// ENTITY TYPES
// ─────────────────────────────────────────────────────────────

export type EntityTypes =
  | 'product'
  | 'shop'
  | 'category'
  | 'brand'
  | 'price'
  | 'currency'
  | 'location'
  | 'orderId'
  | 'seller'
  | 'market'
  | 'quantity'
  | 'date'
  | 'time'
  | 'dealDuration'
  | string

export interface EntityDefinition {
  type: EntityTypes
  name: string
  description: string
  extractionPatterns: string[]
  valueType: 'string' | 'number' | 'boolean' | 'array'
}

export interface ExtractedEntity {
  type: EntityTypes
  value: string | number | boolean | string[]
  confidence: number
  sourceText: string
}

// ─────────────────────────────────────────────────────────────
// CONTEXT MODEL
// ─────────────────────────────────────────────────────────────

export interface ConversationContext {
  sessionId: string
  currentIntent: IntentId | null
  previousIntents: IntentId[]
  activeEntities: Record<string, ExtractedEntity>
  unresolvedEntities: string[]
  conversationTopic: string | null
  currentShop: string | null
  currentProduct: string | null
  currentOrder: string | null
  language: SupportedLanguage
  timestamp: number
  turnCount: number
}

export interface ContextState {
  context: ConversationContext
  updatedAt: number
  expiresAt: number
}

// ─────────────────────────────────────────────────────────────
// MEMORY TYPES
// ─────────────────────────────────────────────────────────────

export type MemoryClassification = 'TEMPORARY' | 'SESSION' | 'PREFERENCE' | 'LONG_TERM'

export interface UserMemory {
  userId: string
  classification: MemoryClassification
  category: string
  data: Record<string, unknown>
  createdAt: number
  updatedAt: number
  expiresAt?: number
  isPrivate: boolean
}

export interface MemorySchema {
  category: string
  description: string
  fields: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>
  retention: MemoryClassification
  isPII: boolean
}

// ─────────────────────────────────────────────────────────────
// KNOWLEDGE DOMAINS
// ─────────────────────────────────────────────────────────────

export type KnowledgeDomain =
  | 'shopnekt'
  | 'qnex360'
  | 'buyers'
  | 'sellers'
  | 'shops'
  | 'markets'
  | 'products'
  | 'orders'
  | 'vybe'
  | 'flashDeals'
  | 'groupBuy'
  | 'preferredShops'
  | 'messages'
  | 'ai'
  | 'sellerDashboard'
  | 'buyerExperience'
  | 'platformRules'
  | string

export interface KnowledgeEntry {
  domain: KnowledgeDomain
  key: string
  title: string
  description: string
  relationships: string[]
  workflows: string[]
  terminology: Record<string, string>
}

// ─────────────────────────────────────────────────────────────
// CAPABILITY REGISTRY
// ─────────────────────────────────────────────────────────────

export interface CapabilityDefinition {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'deprecated'
  requiresAuth: boolean
  tool: string
  inputSchema: Record<string, unknown>
  outputSchema: Record<string, unknown>
}

// ─────────────────────────────────────────────────────────────
// TOOL SYSTEM
// ─────────────────────────────────────────────────────────────

export type ToolRiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  outputSchema: Record<string, unknown>
  requiresAuth: boolean
  requiresAuthorization: boolean
  riskLevel: ToolRiskLevel
  handler: string
}

export interface ToolExecutionRequest {
  toolName: string
  parameters: Record<string, unknown>
  userId?: string
  sessionId: string
}

export interface ToolExecutionResult {
  success: boolean
  data?: unknown
  error?: string
  metadata?: Record<string, unknown>
}

// ─────────────────────────────────────────────────────────────
// MODEL RUNTIME ABSTRACTION
// ─────────────────────────────────────────────────────────────

export interface ModelGenerateOptions {
  temperature?: number
  maxTokens?: number
  stopSequences?: string[]
  stream?: boolean
}

export interface ModelGenerateRequest {
  prompt: string
  context?: Record<string, unknown>
  options?: ModelGenerateOptions
}

export interface ModelGenerateResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metadata?: Record<string, unknown>
}

export interface ModelEmbedRequest {
  text: string | string[]
  model?: string
}

export interface ModelEmbedResponse {
  embeddings: number[][]
  dimensions: number
  model: string
}

export interface ModelHealthStatus {
  healthy: boolean
  latency: number
  version?: string
  lastChecked: number
}

/**
 * ModelRuntime Interface
 * 
 * Abstract interface for model providers.
 * Implementations can be local, private infrastructure, or cloud-based.
 * The AI Core operates without knowing which specific model is being used.
 */
export interface ModelRuntime {
  /**
   * Generate a response from the model
   */
  generate(request: ModelGenerateRequest): Promise<ModelGenerateResponse>

  /**
   * Stream a response from the model
   */
  stream(request: ModelGenerateRequest): AsyncIterableIterator<string>

  /**
   * Generate embeddings for text
   */
  embed(request: ModelEmbedRequest): Promise<ModelEmbedResponse>

  /**
   * Check model health and availability
   */
  healthCheck(): Promise<ModelHealthStatus>

  /**
   * Get the model identifier
   */
  getModelId(): string

  /**
   * Check if the runtime supports streaming
   */
  supportsStreaming(): boolean

  /**
   * Check if the runtime supports embeddings
   */
  supportsEmbeddings(): boolean
}

// ─────────────────────────────────────────────────────────────
// AI REQUEST/RESPONSE CONTRACT
// ─────────────────────────────────────────────────────────────

export interface AIRequest {
  message: string
  language: SupportedLanguage
  sessionId: string
  context?: Partial<ConversationContext>
  userId?: string
  metadata?: Record<string, unknown>
}

export interface AIAction {
  type: string
  tool?: string
  parameters?: Record<string, unknown>
  confidence: number
}

export interface AICitation {
  source: string
  domain: KnowledgeDomain
  key: string
  confidence: number
}

export interface AIResponse {
  message: string
  language: SupportedLanguage
  intent: IntentId | null
  entities: Record<string, ExtractedEntity>
  actions: AIAction[]
  citations: AICitation[]
  confidence: number
  requiresToolExecution: boolean
  context?: Partial<ConversationContext>
  metadata?: Record<string, unknown>
}

// ─────────────────────────────────────────────────────────────
// TRAINING DATA STRUCTURES
// ─────────────────────────────────────────────────────────────

export interface TrainingExample {
  id: string
  input: string
  language: SupportedLanguage
  intent: IntentId
  entities: Record<string, string | number | boolean>
  expectedBehavior: string
  context?: Record<string, unknown>
  approved: boolean
  createdAt: number
}

export interface CorrectionRecord {
  id: string
  originalInput: string
  originalOutput: AIResponse
  correctedOutput: AIResponse
  reason: string
  approved: boolean
  createdAt: number
}

// ─────────────────────────────────────────────────────────────
// EVALUATION STRUCTURES
// ─────────────────────────────────────────────────────────────

export interface EvaluationTestCase {
  id: string
  name: string
  category: 'language' | 'intent' | 'entity' | 'context' | 'tool' | 'response'
  input: AIRequest
  expectedIntent?: IntentId
  expectedEntities?: Record<string, unknown>
  expectedActions?: AIAction[]
  minConfidence: number
  tags: string[]
}

export interface EvaluationResult {
  testCaseId: string
  passed: boolean
  actualIntent?: IntentId
  expectedIntent?: IntentId
  actualEntities?: Record<string, unknown>
  expectedEntities?: Record<string, unknown>
  actualConfidence: number
  expectedConfidence: number
  errors: string[]
  executionTime: number
}

export interface EvaluationReport {
  totalTests: number
  passedTests: number
  failedTests: number
  averageConfidence: number
  categoryResults: Record<string, { passed: number; failed: number }>
  results: EvaluationResult[]
  executedAt: number
}

// ─────────────────────────────────────────────────────────────
// SAFETY AND SECURITY
// ─────────────────────────────────────────────────────────────

export interface SafetyRule {
  id: string
  name: string
  description: string
  category: 'privacy' | 'authorization' | 'hallucination' | 'financial' | 'account' | 'admin'
  severity: 'low' | 'medium' | 'high' | 'critical'
  action: 'block' | 'warn' | 'log' | 'redirect'
  pattern?: string
  handler: string
}

export interface ResponsePolicy {
  id: string
  name: string
  rules: {
    requireUserLanguage: boolean
    preserveBrandTerminology: boolean
    useConversationContext: boolean
    avoidRepetition: boolean
    communicateUncertainty: boolean
    neverInventData: boolean
    distinguishKnowledgeFromLiveData: boolean
  }
}

// ─────────────────────────────────────────────────────────────
// ENGINE INTERFACES
// ─────────────────────────────────────────────────────────────

export interface LanguageEngine {
  detectLanguage(text: string): SupportedLanguage
  normalize(text: string, language: SupportedLanguage): string
  tokenize(text: string): string[]
  supportsLanguage(language: SupportedLanguage): boolean
}

export interface IntentEngine {
  detectIntent(text: string, context?: ConversationContext): { intent: IntentId; confidence: number }
  getIntentDefinition(intentId: IntentId): IntentDefinition | null
  registerIntent(definition: IntentDefinition): void
}

export interface EntityEngine {
  extractEntities(text: string, intent?: IntentId): ExtractedEntity[]
  getEntityDefinition(type: EntityTypes): EntityDefinition | null
  registerEntity(definition: EntityDefinition): void
}

export interface ContextEngine {
  createContext(sessionId: string, language: SupportedLanguage): ConversationContext
  updateContext(context: ConversationContext, intent: IntentId, entities: ExtractedEntity[]): ConversationContext
  getContext(sessionId: string): ConversationContext | null
  clearContext(sessionId: string): void
}

export interface MemoryEngine {
  storeMemory(memory: UserMemory): Promise<void>
  getMemory(userId: string, classification?: MemoryClassification): Promise<UserMemory[]>
  deleteMemory(userId: string, category: string): Promise<void>
  validateMemoryAccess(userId: string, memory: UserMemory): boolean
}

export interface KnowledgeEngine {
  getKnowledge(domain: KnowledgeDomain, key: string): KnowledgeEntry | null
  searchKnowledge(query: string, domains?: KnowledgeDomain[]): KnowledgeEntry[]
  getDomainDefinitions(domain: KnowledgeDomain): KnowledgeEntry[]
}

export interface ReasoningEngine {
  applyRules(input: AIRequest, context: ConversationContext): { allowed: boolean; reasons: string[] }
  validateToolExecution(tool: ToolDefinition, userId?: string): { allowed: boolean; reasons: string[] }
}

export interface ResponseEngine {
  generateResponse(
    intent: IntentId,
    entities: Record<string, ExtractedEntity>,
    context: ConversationContext,
    language: SupportedLanguage
  ): Promise<AIResponse>
  applyPolicy(response: AIResponse, policy: ResponsePolicy): AIResponse
}

// ─────────────────────────────────────────────────────────────
// MAIN AI ENGINE INTERFACE
// ─────────────────────────────────────────────────────────────

export interface AIEngineConfig {
  defaultLanguage: SupportedLanguage
  sessionTimeout: number
  enableMemory: boolean
  enableContext: boolean
  enableEvaluation: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface ShopNektAIEngine {
  // Initialization
  initialize(config: AIEngineConfig): Promise<void>

  // Core processing
  processRequest(request: AIRequest): Promise<AIResponse>

  // Engine access
  getLanguageEngine(): LanguageEngine
  getIntentEngine(): IntentEngine
  getEntityEngine(): EntityEngine
  getContextEngine(): ContextEngine
  getMemoryEngine(): MemoryEngine
  getKnowledgeEngine(): KnowledgeEngine
  getReasoningEngine(): ReasoningEngine
  getResponseEngine(): ResponseEngine

  // Model runtime
  setModelRuntime(runtime: ModelRuntime): void
  getModelRuntime(): ModelRuntime | null

  // Evaluation
  runEvaluation(testCases: EvaluationTestCase[]): Promise<EvaluationReport>

  // Lifecycle
  shutdown(): Promise<void>
}
