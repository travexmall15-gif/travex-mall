/**
 * SHOPNEKT AI CORE - Model Configuration Types
 * 
 * Configuration options for local model runtime.
 * Supports various inference engines and model formats.
 */

export interface ModelConfig {
  /** Model identifier (e.g., 'shopnekt-local-0.1', 'llama-3-8b') */
  modelId: string
  
  /** Path to model weights file or directory */
  modelPath?: string
  
  /** Maximum context length in tokens */
  contextLength: number
  
  /** Maximum tokens to generate */
  maxTokens: number
  
  /** Sampling temperature (0.0 - 2.0) */
  temperature: number
  
  /** Top-p sampling (nucleus sampling) */
  topP: number
  
  /** Top-k sampling */
  topK: number
  
  /** Repetition penalty */
  repetitionPenalty: number
  
  /** Quantization level (e.g., 'q4_0', 'q8_0', 'f16', 'f32') */
  quantization?: string
  
  /** Device preference ('cpu', 'cuda', 'metal', 'auto') */
  device: 'cpu' | 'cuda' | 'metal' | 'auto'
  
  /** Number of CPU threads for inference */
  threads: number
  
  /** Batch size for processing */
  batchSize: number
  
  /** Number of layers to offload to GPU */
  gpuLayers: number
  
  /** Memory limit in MB */
  memoryLimit?: number
  
  /** Enable memory mapping for large models */
  useMmap: boolean
  
  /** Runtime engine type */
  runtimeType: 'llama-cpp' | 'vllm' | 'ollama' | 'mock' | 'custom'
  
  /** HTTP endpoint for remote inference servers */
  endpointUrl?: string
  
  /** API key for remote inference servers */
  apiKey?: string
  
  /** Request timeout in milliseconds */
  timeoutMs: number
  
  /** Enable streaming responses */
  streaming: boolean
  
  /** Model version identifier */
  modelVersion: string
  
  /** Configuration version for compatibility checking */
  configVersion: string
}

export interface ModelMetadata {
  /** Model name */
  name: string
  
  /** Model version */
  version: string
  
  /** Supported languages */
  languages: string[]
  
  /** Context window size */
  contextWindow: number
  
  /** Parameter count (e.g., '7B', '13B', '70B') */
  parameterCount?: string
  
  /** Architecture type (e.g., 'transformer', 'mixture-of-experts') */
  architecture?: string
  
  /** License information */
  license?: string
  
  /** Training data cutoff date */
  trainingCutoff?: string
  
  /** Capabilities */
  capabilities: {
    textGeneration: boolean
    structuredOutput: boolean
    toolCalling: boolean
    embeddings: boolean
    streaming: boolean
  }
}

export interface RuntimeHealth {
  /** Is the runtime healthy and ready */
  healthy: boolean
  
  /** Is the model loaded and ready */
  modelLoaded: boolean
  
  /** Available memory in MB */
  availableMemory?: number
  
  /** Current device being used */
  device?: string
  
  /** Response latency in ms */
  latency?: number
  
  /** Runtime version */
  runtimeVersion?: string
  
  /** Model version */
  modelVersion?: string
  
  /** Last health check timestamp */
  lastChecked: number
}

export interface GenerationConfig {
  /** Temperature for sampling */
  temperature?: number
  
  /** Maximum tokens to generate */
  maxTokens?: number
  
  /** Stop sequences */
  stopSequences?: string[]
  
  /** Top-p sampling */
  topP?: number
  
  /** Top-k sampling */
  topK?: number
  
  /** Repetition penalty */
  repetitionPenalty?: number
  
  /** Enable streaming */
  stream?: boolean
  
  /** Random seed for reproducibility */
  seed?: number
  
  /** Presence penalty */
  presencePenalty?: number
  
  /** Frequency penalty */
  frequencyPenalty?: number
}

export interface EmbeddingConfig {
  /** Model to use for embeddings */
  model?: string
  
  /** Dimensions for output embeddings */
  dimensions?: number
  
  /** Normalization for embeddings */
  normalize?: boolean
}

/**
 * Default configuration for development
 */
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  modelId: 'mock-model',
  contextLength: 4096,
  maxTokens: 512,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  repetitionPenalty: 1.1,
  device: 'cpu',
  threads: 4,
  batchSize: 1,
  gpuLayers: 0,
  useMmap: true,
  runtimeType: 'mock',
  timeoutMs: 30000,
  streaming: true,
  modelVersion: '0.1.0',
  configVersion: '1.0.0',
}
