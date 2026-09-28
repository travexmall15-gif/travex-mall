/**
 * SHOPNEKT AI CORE - Model Types
 * 
 * Re-exports and extends types from core/ai-types.ts for model-specific usage.
 * This keeps model-related types organized while maintaining compatibility.
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

// Extended types for local model runtime
export interface GenerationRequest {
  prompt: string
  temperature?: number
  topP?: number
  topK?: number
  maxTokens?: number
  stopSequences?: string[]
  seed?: number
}

export interface GenerationResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason?: 'stop' | 'length' | 'error'
  metadata?: Record<string, unknown>
}

export interface GenerationChunk {
  content: string
  done: boolean
  metadata?: Record<string, unknown>
}

export interface EmbeddingResponse {
  embeddings: number[][]
  dimensions: number
  model: string
}

export interface ModelHealth {
  healthy: boolean
  modelLoaded: boolean
  latencyMs: number
  version: string
  deviceId?: string
  memoryUsage?: string
  error?: string
}

export interface ModelMetadata {
  modelId: string
  contextLength: number
  provider: string
  capabilities: string[]
  version: string
}
