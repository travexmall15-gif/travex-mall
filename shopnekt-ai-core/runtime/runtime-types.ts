/**
 * SHOPNEKT AI CORE - Runtime Types
 * 
 * Type definitions for the local model runtime system.
 */

import type { ModelRuntime } from '../core/ai-types.js'
import type { ModelConfig } from '../model/model-config.js'

/**
 * Available runtime types
 */
export type RuntimeType = 'llama-cpp' | 'vllm' | 'ollama' | 'mock' | 'custom'

/**
 * Runtime status enumeration
 */
export type RuntimeStatus = 'initializing' | 'loading' | 'ready' | 'error' | 'unloaded'

/**
 * Runtime configuration for manager
 */
export interface RuntimeManagerConfig {
  /** Default runtime type */
  defaultRuntime: RuntimeType
  
  /** Model configurations by runtime type */
  modelConfigs: Partial<Record<RuntimeType, Partial<ModelConfig>>>
  
  /** Auto-load default model on initialization */
  autoLoad: boolean
  
  /** Maximum concurrent requests */
  maxConcurrentRequests: number
  
  /** Health check interval in milliseconds */
  healthCheckInterval: number
  
  /** Enable request logging */
  enableLogging: boolean
}

/**
 * Runtime instance wrapper
 */
export interface RuntimeInstance {
  /** Runtime identifier */
  id: string
  
  /** Runtime type */
  type: RuntimeType
  
  /** The actual runtime instance */
  runtime: ModelRuntime
  
  /** Current status */
  status: RuntimeStatus
  
  /** Configuration used */
  config: ModelConfig
  
  /** When this runtime was created */
  createdAt: number
  
  /** When this runtime was last used */
  lastUsedAt: number
  
  /** Number of requests processed */
  requestCount: number
  
  /** Last error message if any */
  lastError?: string
}

/**
 * Request routing result
 */
export interface RoutingResult {
  /** Selected runtime ID */
  runtimeId: string
  
  /** Reason for selection */
  reason: string
  
  /** Alternative runtime IDs */
  alternatives: string[]
  
  /** Estimated latency in ms */
  estimatedLatency: number
}

/**
 * Load balancer strategy
 */
export type LoadBalancerStrategy = 'round-robin' | 'least-loaded' | 'latency-based' | 'sticky-session'

/**
 * Load balancer configuration
 */
export interface LoadBalancerConfig {
  /** Strategy to use */
  strategy: LoadBalancerStrategy
  
  /** Sticky session TTL in seconds */
  stickySessionTTL: number
  
  /** Health check threshold */
  healthThreshold: number
  
  /** Maximum queue size per runtime */
  maxQueueSize: number
}

/**
 * Runtime metrics
 */
export interface RuntimeMetrics {
  /** Total requests processed */
  totalRequests: number
  
  /** Successful requests */
  successfulRequests: number
  
  /** Failed requests */
  failedRequests: number
  
  /** Average latency in ms */
  averageLatency: number
  
  /** P95 latency in ms */
  p95Latency: number
  
  /** P99 latency in ms */
  p99Latency: number
  
  /** Tokens generated total */
  totalTokensGenerated: number
  
  /** Current queue depth */
  currentQueueDepth: number
  
  /** Uptime percentage */
  uptimePercentage: number
}

/**
 * Structured output schema for model responses
 */
export interface StructuredOutputSchema {
  /** Schema type */
  type: 'object' | 'array' | 'string' | 'number' | 'boolean'
  
  /** Schema properties (for object type) */
  properties?: Record<string, StructuredOutputProperty>
  
  /** Required fields */
  required?: string[]
  
  /** Description */
  description?: string
}

export interface StructuredOutputProperty {
  type: string
  description?: string
  enum?: string[]
  items?: StructuredOutputSchema
}

/**
 * ShopNekt AI structured response format
 */
export interface ShopNektStructuredResponse {
  /** Detected intent */
  intent: string
  
  /** Extracted entities */
  entities: Record<string, unknown>
  
  /** Tool calls to execute */
  toolCalls: Array<{
    name: string
    arguments: Record<string, unknown>
  }>
  
  /** Natural language response */
  response: string
  
  /** Confidence score (0-1) */
  confidence: number
  
  /** Citations/sources */
  citations?: Array<{
    source: string
    key: string
  }>
}

/**
 * Validation result for structured output
 */
export interface ValidationResult {
  /** Is the output valid */
  valid: boolean
  
  /** Parsed data if valid */
  data?: ShopNektStructuredResponse
  
  /** Validation errors */
  errors: string[]
  
  /** Raw output that was validated */
  rawOutput: string
}

/**
 * Default runtime manager configuration
 */
export const DEFAULT_RUNTIME_MANAGER_CONFIG: RuntimeManagerConfig = {
  defaultRuntime: 'mock',
  modelConfigs: {
    mock: {
      modelId: 'shopnekt-mock-0.1',
      runtimeType: 'mock',
    },
  },
  autoLoad: true,
  maxConcurrentRequests: 10,
  healthCheckInterval: 30000,
  enableLogging: false,
}

/**
 * Default load balancer configuration
 */
export const DEFAULT_LOAD_BALANCER_CONFIG: LoadBalancerConfig = {
  strategy: 'round-robin',
  stickySessionTTL: 3600,
  healthThreshold: 0.8,
  maxQueueSize: 100,
}
