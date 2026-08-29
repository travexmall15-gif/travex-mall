/**
 * SHOPNEKT AI CORE - Model Runtime Implementation
 * 
 * Abstract model runtime that can be implemented by different providers.
 * This is the interface layer - actual implementations go in /model/adapters/
 */

import type {
  ModelRuntime,
  ModelGenerateRequest,
  ModelGenerateResponse,
  ModelEmbedRequest,
  ModelEmbedResponse,
  ModelHealthStatus,
} from './model-types.js'

/**
 * Base implementation of ModelRuntime interface
 * 
 * This provides default implementations that throw errors.
 * Concrete implementations should override these methods.
 */
export abstract class BaseModelRuntime implements ModelRuntime {
  protected readonly modelId: string
  protected readonly providerName: string

  constructor(modelId: string, providerName: string) {
    this.modelId = modelId
    this.providerName = providerName
  }

  /**
   * Generate a response from the model
   * Must be implemented by concrete runtime
   */
  abstract generate(request: ModelGenerateRequest): Promise<ModelGenerateResponse>

  /**
   * Stream a response from the model
   * Can be implemented optionally
   */
  async *stream(request: ModelGenerateRequest): AsyncIterableIterator<string> {
    // Default: non-streaming fallback
    const response = await this.generate(request)
    yield response.content
  }

  /**
   * Generate embeddings for text
   * Can return null if not supported
   */
  async embed(request: ModelEmbedRequest): Promise<ModelEmbedResponse> {
    throw new Error('Embeddings not supported by this runtime')
  }

  /**
   * Check model health and availability
   */
  async healthCheck(): Promise<ModelHealthStatus> {
    const startTime = Date.now()
    try {
      // Simple health check - just verify we can call the model
      await this.generate({
        prompt: 'health',
        options: { maxTokens: 1 },
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
   * Get the model identifier
   */
  getModelId(): string {
    return this.modelId
  }

  /**
   * Get the provider name
   */
  getProviderName(): string {
    return this.providerName
  }

  /**
   * Check if the runtime supports streaming
   */
  supportsStreaming(): boolean {
    // Default to true since we have a fallback implementation
    return true
  }

  /**
   * Check if the runtime supports embeddings
   */
  supportsEmbeddings(): boolean {
    return false // Override in implementations that support embeddings
  }

  /**
   * Validate request before processing
   */
  protected validateRequest(request: ModelGenerateRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty')
    }
  }

  /**
   * Calculate token estimate (rough approximation)
   */
  protected estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English
    return Math.ceil(text.length / 4)
  }
}

/**
 * Mock/Stub runtime for development and testing
 * 
 * Returns predefined responses without calling any external service.
 * Useful for testing the AI Core architecture.
 */
export class MockModelRuntime extends BaseModelRuntime {
  private mockResponses: Map<string, string> = new Map()
  private latencyMs: number = 100

  constructor(latencyMs: number = 100) {
    super('mock-model', 'mock')
    this.latencyMs = latencyMs
    this.setupDefaultResponses()
  }

  private setupDefaultResponses(): void {
    // Default mock responses for common scenarios
    this.mockResponses.set('greeting', 'Hello! How can I help you today?')
    this.mockResponses.set('product_search', 'I found several products matching your search.')
    this.mockResponses.set('shop_search', 'I found some shops in your area.')
  }

  /**
   * Set custom mock response for a prompt pattern
   */
  setMockResponse(pattern: string, response: string): void {
    this.mockResponses.set(pattern, response)
  }

  async generate(request: ModelGenerateRequest): Promise<ModelGenerateResponse> {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, this.latencyMs))

    this.validateRequest(request)

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
        model: this.modelId,
        provider: this.providerName,
        mock: true,
      },
    }
  }

  override supportsStreaming(): boolean {
    return true
  }

  override async *stream(request: ModelGenerateRequest): AsyncIterableIterator<string> {
    const response = await this.generate(request)

    // Stream character by character for simulation
    for (let i = 0; i < response.content.length; i += 10) {
      yield response.content.slice(i, i + 10)
      await new Promise(resolve => setTimeout(resolve, 20))
    }
  }
}

/**
 * Factory function to create model runtime instances
 * 
 * In production, this would select the appropriate runtime based on configuration.
 */
export function createModelRuntime(config: {
  type: 'mock' | 'custom'
  modelId?: string
  providerName?: string
  latencyMs?: number
}): ModelRuntime {
  switch (config.type) {
    case 'mock':
      return new MockModelRuntime(config.latencyMs)
    default:
      throw new Error(`Unknown runtime type: ${config.type}`)
  }
}
