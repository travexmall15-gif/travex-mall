/**
 * SHOPNEKT AI CORE - Model Types
 * 
 * Re-exports types from core/ai-types.ts for model-specific imports.
 * This keeps model-related types organized.
 */

export type {
  ModelRuntime,
  ModelGenerateOptions,
  ModelGenerateRequest,
  ModelGenerateResponse,
  ModelEmbedRequest,
  ModelEmbedResponse,
  ModelHealthStatus,
} from '../core/ai-types.js'
