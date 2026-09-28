/**
 * ShopNekt AI - Backend Types
 * 
 * Common types for local inference backends.
 */

import type { GenerationRequest, GenerationResponse } from '../../model-types.js';

export interface BackendConfig {
  baseUrl: string;
  modelId: string;
  timeoutMs: number;
  allowPrivateNetwork?: boolean;
}

export interface BackendHealth {
  healthy: boolean;
  modelLoaded: boolean;
  latencyMs: number;
  version: string;
  error?: string;
}

export interface BackendMetadata {
  provider: string;
  version: string;
  capabilities: string[];
}

export abstract class InferenceBackend {
  abstract load(): Promise<void>;
  abstract unload(): Promise<void>;
  abstract generate(request: GenerationRequest): Promise<GenerationResponse>;
  abstract stream(request: GenerationRequest): AsyncGenerator<any>;
  abstract healthCheck(): Promise<BackendHealth>;
  abstract metadata(): BackendMetadata;
}
