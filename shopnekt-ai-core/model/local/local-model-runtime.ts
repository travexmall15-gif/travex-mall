/**
 * SHOPNEKT AI CORE - Local Model Runtime Implementation
 * 
 * Abstract local model runtime that interfaces with self-hosted inference engines.
 * This is the foundation for running ShopNekt AI on private infrastructure.
 * 
 * Supported backends (to be implemented):
 * - llama.cpp: CPU/GPU inference with quantization support
 * - vLLM: High-throughput GPU inference
 * - Ollama: Simple local model management
 * - Custom: Any HTTP-based inference endpoint
 */

import type { ModelRuntime, ModelGenerateRequest, ModelGenerateResponse, ModelEmbedRequest, ModelEmbedResponse, ModelHealthStatus } from '../model-types.js'
import type { ModelConfig, ModelMetadata, RuntimeHealth, GenerationConfig } from '../model-config.js'
import { DEFAULT_MODEL_CONFIG } from '../model-config.js'

// Note: ModelMetadata, RuntimeHealth, and GenerationConfig are imported for future use in concrete implementations
// The duplicate import is intentional - type imports are erased at runtime and don't affect bundle size

/**
 * Abstract base class for local model runtimes
 * 
 * Concrete implementations should extend this class and provide
 * actual inference logic for specific backends.
 */
export abstract class LocalModelRuntime implements ModelRuntime {
  protected config: ModelConfig
  protected isLoaded: boolean = false
  protected isLoading: boolean = false
  protected lastHealthCheck: number = 0

  constructor(config: Partial<ModelConfig> = {}) {
    this.config = { ...DEFAULT_MODEL_CONFIG, ...config }
  }

  /**
   * Load the model into memory
   * Must be implemented by concrete runtime
   */
  abstract load(): Promise<void>

  /**
   * Unload the model from memory
   * Must be implemented by concrete runtime
   */
  abstract unload(): Promise<void>

  /**
   * Generate a response from the model
   * Must be implemented by concrete runtime
   */
  abstract generate(request: ModelGenerateRequest): Promise<ModelGenerateResponse>

  /**
   * Stream a response from the model
   * Default implementation falls back to non-streaming
   */
  async *stream(request: ModelGenerateRequest): AsyncIterableIterator<string> {
    const response = await this.generate(request)
    yield response.content
  }

  /**
   * Generate embeddings for text
   * Default implementation throws error if not supported
   */
  async embed(_request: ModelEmbedRequest): Promise<ModelEmbedResponse> {
    throw new Error('Embeddings not supported by this runtime')
  }

  /**
   * Check model health and availability
   */
  async healthCheck(): Promise<ModelHealthStatus> {
    const startTime = Date.now()
    try {
      // Quick health check without generating full response
      if (!this.isLoaded && !this.isLoading) {
        return {
          healthy: false,
          latency: Date.now() - startTime,
          lastChecked: Date.now(),
        }
      }

      // Attempt minimal inference
      await this.generate({
        prompt: 'health',
        options: { maxTokens: 1, temperature: 0 },
      })

      return {
        healthy: true,
        latency: Date.now() - startTime,
        lastChecked: Date.now(),
      }
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        lastChecked: Date.now(),
      }
    }
  }

  /**
   * Get detailed runtime health information
   */
  async getDetailedHealth(): Promise<RuntimeHealth> {
    const basicHealth = await this.healthCheck()
    
    return {
      healthy: basicHealth.healthy,
      modelLoaded: this.isLoaded,
      availableMemory: undefined, // Implement in concrete runtime
      device: this.config.device,
      latency: basicHealth.latency,
      runtimeVersion: this.config.runtimeType,
      modelVersion: this.config.modelVersion,
      lastChecked: Date.now(),
    }
  }

  /**
   * Get the model identifier
   */
  getModelId(): string {
    return this.config.modelId
  }

  /**
   * Get the runtime configuration
   */
  getConfig(): ModelConfig {
    return { ...this.config }
  }

  /**
   * Check if the runtime supports streaming
   */
  supportsStreaming(): boolean {
    return this.config.streaming
  }

  /**
   * Check if the runtime supports embeddings
   */
  supportsEmbeddings(): boolean {
    return false // Override in implementations that support embeddings
  }

  /**
   * Get model metadata
   */
  async metadata(): Promise<ModelMetadata> {
    return {
      name: this.config.modelId,
      version: this.config.modelVersion,
      languages: ['en', 'sw'], // Override in concrete implementation
      contextWindow: this.config.contextLength,
      capabilities: {
        textGeneration: true,
        structuredOutput: false,
        toolCalling: false,
        embeddings: this.supportsEmbeddings(),
        streaming: this.supportsStreaming(),
      },
    }
  }

  /**
   * Check if model is loaded
   */
  isModelLoaded(): boolean {
    return this.isLoaded
  }

  /**
   * Check if model is currently loading
   */
  isModelLoading(): boolean {
    return this.isLoading
  }

  /**
   * Validate generation request
   */
  protected validateRequest(request: ModelGenerateRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty')
    }

    // Validate token limits
    const estimatedTokens = this.estimateTokens(request.prompt)
    if (estimatedTokens > this.config.contextLength) {
      throw new Error(`Prompt exceeds context length limit of ${this.config.contextLength} tokens`)
    }

    // Validate max tokens
    const maxTokens = request.options?.maxTokens ?? this.config.maxTokens
    if (estimatedTokens + maxTokens > this.config.contextLength) {
      throw new Error('Prompt + maxTokens exceeds context length')
    }
  }

  /**
   * Estimate token count from text
   * This is a rough approximation - concrete implementations may use better estimators
   */
  protected estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English/Swahili
    return Math.ceil(text.length / 4)
  }

  /**
   * Apply generation config to request
   */
  protected applyGenerationConfig(request: ModelGenerateRequest): GenerationConfig {
    return {
      temperature: request.options?.temperature ?? this.config.temperature,
      maxTokens: request.options?.maxTokens ?? this.config.maxTokens,
      stopSequences: request.options?.stopSequences,
      topP: this.config.topP,
      topK: this.config.topK,
      repetitionPenalty: this.config.repetitionPenalty,
      stream: request.options?.stream ?? this.config.streaming,
    }
  }

  /**
   * Handle request timeout
   */
  protected withTimeout<T>(promise: Promise<T>, timeoutMs?: number): Promise<T> {
    const timeout = timeoutMs ?? this.config.timeoutMs
    
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
      ),
    ])
  }
}

/**
 * Factory function to create local model runtime instances
 * 
 * In production, this would initialize the appropriate backend
 * based on configuration and available hardware.
 */
export function createLocalModelRuntime(config: Partial<ModelConfig> = {}): LocalModelRuntime {
  const runtimeType = config.runtimeType ?? 'mock'

  switch (runtimeType) {
    case 'mock':
      // Import mock runtime dynamically to avoid circular dependencies
      return new MockLocalModelRuntime(config)
    
    case 'llama-cpp':
      throw new Error('llama-cpp runtime not yet implemented - see deployment/requirements.md')
    
    case 'vllm':
      throw new Error('vLLM runtime not yet implemented - see deployment/requirements.md')
    
    case 'ollama':
      throw new Error('Ollama runtime not yet implemented - see deployment/requirements.md')
    
    case 'custom':
      throw new Error('Custom runtime must be provided explicitly')
    
    default:
      throw new Error(`Unknown runtime type: ${runtimeType}`)
  }
}

/**
 * Mock local model runtime for development and testing
 * 
 * Simulates a local model without requiring actual model weights.
 * Useful for testing the AI Core architecture and integration.
 */
export class MockLocalModelRuntime extends LocalModelRuntime {
  private mockResponses: Map<string, string> = new Map()
  private simulatedLatency: number = 100

  constructor(config: Partial<ModelConfig> = {}) {
    super(config)
    this.isLoaded = true // Mock is always loaded
    this.setupDefaultResponses()
  }

  private setupDefaultResponses(): void {
    // Default mock responses for common scenarios
    this.mockResponses.set('greeting', 'Hello! How can I help you today?')
    this.mockResponses.set('product_search', 'I found several products matching your search.')
    this.mockResponses.set('shop_search', 'I found some shops in your area.')
    this.mockResponses.set('order_status', 'Let me check your order status.')
    this.mockResponses.set('recommendation', 'Based on your preferences, I recommend...')
  }

  /**
   * Set custom mock response for a prompt pattern
   */
  setMockResponse(pattern: string, response: string): void {
    this.mockResponses.set(pattern, response)
  }

  /**
   * Set simulated latency for testing
   */
  setSimulatedLatency(latencyMs: number): void {
    this.simulatedLatency = latencyMs
  }

  async load(): Promise<void> {
    // Mock loads instantly
    this.isLoaded = true
  }

  async unload(): Promise<void> {
    this.isLoaded = false
  }

  async generate(request: ModelGenerateRequest): Promise<ModelGenerateResponse> {
    this.validateRequest(request)

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, this.simulatedLatency))

    // Find matching mock response
    let content = 'I understand your request. How can I assist you further?'
    
    for (const [pattern, response] of this.mockResponses.entries()) {
      if (request.prompt.toLowerCase().includes(pattern.toLowerCase())) {
        content = response
        break
      }
    }

    const promptTokens = this.estimateTokens(request.prompt)
    const completionTokens = this.estimateTokens(content)

    return {
      content,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      metadata: {
        model: this.config.modelId,
        provider: 'mock',
        mock: true,
      },
    }
  }

  override async *stream(request: ModelGenerateRequest): AsyncIterableIterator<string> {
    const response = await this.generate(request)

    // Stream word by word for simulation
    const words = response.content.split(' ')
    for (let i = 0; i < words.length; i += 3) {
      yield words.slice(i, i + 3).join(' ') + ' '
      await new Promise(resolve => setTimeout(resolve, 30))
    }
  }

  override supportsStreaming(): boolean {
    return true
  }

  override async metadata(): Promise<ModelMetadata> {
    return {
      name: this.config.modelId,
      version: this.config.modelVersion,
      languages: ['en', 'sw', 'fr', 'de', 'pt', 'ar'],
      contextWindow: this.config.contextLength,
      parameterCount: 'mock',
      license: 'MIT',
      capabilities: {
        textGeneration: true,
        structuredOutput: true,
        toolCalling: true,
        embeddings: false,
        streaming: true,
      },
    }
  }
}
