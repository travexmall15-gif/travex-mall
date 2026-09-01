// ═══════════════════════════════════════════════════════════
// SHOPNEKT 360 AI — TOP-LEVEL PUBLIC API
// ═══════════════════════════════════════════════════════════
// Batch 1: Data Core (knowledge/schemas — pure, no I/O)
// Batch 2: AI Core (orchestration) + Buyer 360 AI + Seller 360 AI
// Batch 3: model runtime + integration — NOT STARTED

export * from './data-core'

export { processMessage } from './core/orchestrator'
export type { ProcessMessageInput, ProcessMessageResult } from './core/orchestrator'

export { detectInputLanguage } from './core/language/detect'
export type { LanguageDetectionResult } from './core/language/detect'

export { classifyIntent } from './core/intent/classify'
export type { IntentClassificationResult } from './core/intent/classify'

export { createConversationContext, appendTurn, advanceContext, startActiveTask } from './core/context/engine'

export { decideNextAction } from './core/reasoning/plan'
export type { ReasoningDecision } from './core/reasoning/plan'

export { executeTool } from './core/tools/executor'
export type { ToolExecutionResult } from './core/tools/executor'

export { authorizeToolCall, detectPromptInjectionAttempt, AIRequestContextSchema } from './core/security/authorize'
export type { AIRequestContext, AuthorizationResult } from './core/security/authorize'

export { InMemoryMemoryStore, assertNoCrossUserLeak } from './core/memory/store'
export type { MemoryStore } from './core/memory/store'

export {
  buildRefusalResponse, buildUnknownResponse, buildClarificationResponse,
  buildToolResultResponse, buildConfirmationRequiredResponse, streamResponse, getStatusMessage,
} from './core/response/format'
export type { AIResponse, AIResponseStatus, ResponseChunk } from './core/response/format'

export {
  createBuyerRequestContext, startBuyerConversation, sendBuyerMessage, getBuyerCapabilities,
} from './assistants/buyer-360'
export {
  createSellerRequestContext, startSellerConversation, sendSellerMessage, getSellerCapabilities,
} from './assistants/seller-360'
