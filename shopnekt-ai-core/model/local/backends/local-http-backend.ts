/**
 * ShopNekt AI - Local HTTP Inference Backend
 * 
 * A concrete implementation of ModelRuntime that communicates with
 * a local inference server (Ollama, llama.cpp, vLLM, etc.) via HTTP.
 * 
 * SECURITY: Strictly validates that the endpoint is local/private.
 */

import type {
  ModelRuntime,
  ModelGenerateRequest,
  ModelGenerateResponse,
  ModelEmbedRequest,
  ModelEmbedResponse,
  ModelHealthStatus,
} from '../../core/ai-types.js';

export interface LocalBackendConfig {
  baseUrl: string;
  modelId: string;
  contextLength: number;
  maxTokens: number;
  temperature: number;
  topP: number;
  timeoutMs: number;
  allowPrivateNetwork: boolean;
}

export class LocalHttpBackend implements ModelRuntime {
  private config: LocalBackendConfig;
  private loaded: boolean = false;

  constructor(config: LocalBackendConfig) {
    this.config = config;
    this.validateEndpoint(config.baseUrl);
  }

  /**
   * SECURITY: Validate that the endpoint is local or private.
   * Prevents accidental connection to public external APIs.
   */
  private validateEndpoint(url: string): void {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
      const isPrivateIp = this.isPrivateIP(hostname);
      const isLocalDomain = hostname.endsWith('.local') || hostname.endsWith('.internal');

      if (!isLocalhost && !isPrivateIp && !isLocalDomain) {
        if (!this.config.allowPrivateNetwork) {
          throw new Error(
            `SECURITY VIOLATION: Endpoint "${url}" is not a local address. ` +
            `LocalHttpBackend only allows localhost, private IPs, or .local domains. ` +
            `Set allowPrivateNetwork=true ONLY for trusted private network deployments.`
          );
        }
      }

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(`Invalid protocol: ${parsed.protocol}. Use http or https.`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('SECURITY')) {
        throw error;
      }
      throw new Error(`Invalid endpoint URL: ${url}. ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isPrivateIP(hostname: string): boolean {
    // Simple IPv4 private range check
    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Pattern);
    
    if (match) {
      const [, a, b] = match.map(Number);
      // 10.x.x.x, 172.16-31.x.x, 192.168.x.x
      if (a === 10) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
      if (a === 127) return true; // Loopback
    }
    
    // IPv6 loopback
    if (hostname === '::1' || hostname === 'fe80::1') return true;

    return false;
  }

  async load(): Promise<void> {
    // For remote local servers, "loading" is just verifying connectivity
    const health = await this.healthCheck();
    if (!health.healthy) {
      throw new Error(`Failed to load model: ${health.error || 'Unknown error'}`);
    }
    this.loaded = true;
    console.log(`[LocalHttpBackend] Connected to model "${this.config.modelId}" at ${this.config.baseUrl}`);
  }

  async unload(): Promise<void> {
    this.loaded = false;
    console.log('[LocalHttpBackend] Model unloaded (connection closed)');
  }

  async generate(request: ModelGenerateRequest): Promise<ModelGenerateResponse> {
    if (!this.loaded) {
      await this.load();
    }

    const payload = this.buildGenerationPayload(request);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Inference failed (${response.status}): ${errorText}`);
      }

      const result: any = await response.json();
      return this.parseGenerationResponse(result);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeoutMs}ms`);
      }
      throw error;
    }
  }

  async *stream(request: ModelGenerateRequest): AsyncIterableIterator<string> {
    if (!this.loaded) {
      await this.load();
    }

    const payload = { ...this.buildGenerationPayload(request), stream: true };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Streaming failed (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value);
        // Handle newline-delimited JSON (common in local runtimes)
        const lines = chunkText.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const parsed: any = JSON.parse(line);
            yield parsed.response || parsed.content || '';
          } catch (_e) {
            // Skip malformed JSON lines
            console.warn('[LocalHttpBackend] Skipping malformed stream chunk');
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Stream timeout after ${this.config.timeoutMs}ms`);
      }
      throw error;
    }
  }

  async embed(_request: ModelEmbedRequest): Promise<ModelEmbedResponse> {
    // Optional: Implement if the backend supports embeddings
    // For now, throw not implemented to keep scope focused on generation
    throw new Error('Embeddings not implemented for this backend yet');
  }

  async healthCheck(): Promise<ModelHealthStatus> {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000); // 5s timeout for health check

      // Try standard ollama/llama.cpp health endpoint
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null);

      let modelFound = false;
      let version = 'unknown';

      if (response && response.ok) {
        const data: any = await response.json();
        // Check if our target model is in the list
        if (data.models && Array.isArray(data.models)) {
          modelFound = data.models.some((m: any) => m.name === this.config.modelId || m.name.includes(this.config.modelId));
        } else {
          // If no models list but endpoint works, assume ok for generic servers
          modelFound = true; 
        }
        version = data.version || 'unknown';
      }

      // Fallback: simple connectivity ping if /api/tags fails
      if (!response) {
         const ping = await fetch(`${this.config.baseUrl}/`, { method: 'GET', signal: controller.signal }).catch(() => null);
         if (ping && ping.ok) {
           modelFound = true; // Assume healthy if root responds
         }
      }

      return {
        healthy: modelFound,
        latency: 0, // Could measure properly
        version: version,
        lastChecked: Date.now(),
      };
    } catch (error) {
      return {
        healthy: false,
        latency: 0,
        version: 'unknown',
        lastChecked: Date.now(),
      };
    }
  }

  getModelId(): string {
    return this.config.modelId;
  }

  supportsStreaming(): boolean {
    return true;
  }

  supportsEmbeddings(): boolean {
    return false;
  }

  private buildGenerationPayload(request: ModelGenerateRequest): any {
    // Generic payload structure compatible with Ollama/vLLM
    // Adjustments can be made via config if specific backend quirks are needed
    return {
      model: this.config.modelId,
      prompt: request.prompt,
      options: {
        temperature: request.options?.temperature ?? this.config.temperature,
        top_p: request.options?.topP ?? this.config.topP,
        num_predict: request.options?.maxTokens ?? this.config.maxTokens,
      },
      stream: false,
    };
  }

  private parseGenerationResponse(result: any): ModelGenerateResponse {
    return {
      content: result.response || result.content || '',
      usage: {
        promptTokens: result.prompt_eval_count || 0,
        completionTokens: result.eval_count || 0,
        totalTokens: (result.prompt_eval_count || 0) + (result.eval_count || 0),
      },
      metadata: {
        modelId: this.config.modelId,
        timestamp: Date.now(),
      },
    };
  }
}
