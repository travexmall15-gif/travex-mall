/**
 * ShopNekt Model Lab - Benchmark Runner
 * 
 * Executes benchmark test cases against a local model runtime.
 * Records results, latency, and generates reports.
 */

import type { ModelRuntime } from '../core/ai-types.js';
import type { GenerationResponse } from '../model/model-types.js';
import type { BenchmarkDataset, TestCase } from './dataset-types.js';
import { Evaluator } from './evaluator.js';
import type { BenchmarkRun } from './dataset-types.js';

export interface BenchmarkConfig {
  modelId: string;
  datasetVersion: string;
  generationParams: {
    temperature: number;
    topP: number;
    maxTokens: number;
  };
  timeoutMs: number;
}

export class BenchmarkRunner {
  private runtime: ModelRuntime;
  private evaluator: Evaluator;
  private config: BenchmarkConfig;

  constructor(runtime: ModelRuntime, evaluator: Evaluator, config: BenchmarkConfig) {
    this.runtime = runtime;
    this.evaluator = evaluator;
    this.config = config;
  }

  /**
   * Run a smoke benchmark (subset of tests) to verify basic functionality.
   */
  async runSmokeTest(dataset: BenchmarkDataset): Promise<BenchmarkRun> {
    console.log('[BenchmarkRunner] Starting smoke test...');
    
    // Select high-priority cases and a random subset for smoke test
    const smokeCases = dataset.testCases.filter(tc => {
      return tc.priority === 'high' || Math.random() < 0.3;
    }).slice(0, 45); // Minimum 45 cases as specified

    return this.executeTests(smokeCases, 'smoke');
  }

  /**
   * Run the full benchmark suite.
   */
  async runFullBenchmark(dataset: BenchmarkDataset): Promise<BenchmarkRun> {
    console.log('[BenchmarkRunner] Starting full benchmark...');
    return this.executeTests(dataset.testCases, 'full');
  }

  private async executeTests(testCases: TestCase[], mode: 'smoke' | 'full'): Promise<BenchmarkRun> {
    const startTime = Date.now();
    const results: any[] = [];
    let passed = 0;
    let failed = 0;
    let totalLatency = 0;

    for (const testCase of testCases) {
      try {
        const caseStart = Date.now();
        
        // Build prompt with context
        const prompt = this.buildPrompt(testCase);
        
        // Generate response from model using core types
        const response = await this.runtime.generate({
          prompt: prompt,
          options: {
            temperature: this.config.generationParams.temperature,
            maxTokens: this.config.generationParams.maxTokens,
          },
        });

        const latency = Date.now() - caseStart;
        totalLatency += latency;

        // Convert core response to lab response format for evaluation
        const labResponse: GenerationResponse = {
          content: response.content,
          usage: response.usage,
          metadata: response.metadata,
        };

        // Evaluate the response
        const evaluation = this.evaluator.evaluate(testCase, labResponse);

        const result = {
          testCaseId: testCase.id,
          category: testCase.category,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: response.content,
          evaluation,
          latency,
          tokensUsed: response.usage?.totalTokens || 0,
          timestamp: Date.now(),
        };

        results.push(result);

        if (evaluation.passed) {
          passed++;
        } else {
          failed++;
        }

        console.log(`[${passed + failed}/${testCases.length}] ${testCase.category}: ${evaluation.passed ? 'PASS' : 'FAIL'}`);
      } catch (error) {
        const errorResult = {
          testCaseId: testCase.id,
          category: testCase.category,
          input: testCase.input,
          error: error instanceof Error ? error.message : 'Unknown error',
          latency: 0,
          timestamp: Date.now(),
        };
        results.push(errorResult);
        failed++;
        console.error(`[${passed + failed}/${testCases.length}] ${testCase.category}: ERROR - ${errorResult.error}`);
      }
    }

    const totalTime = Date.now() - startTime;
    const avgLatency = results.length > 0 ? totalLatency / results.length : 0;

    // Calculate category scores
    const categoryScores: Record<string, { passed: number; total: number; score: number }> = {};
    for (const result of results) {
      if (!categoryScores[result.category]) {
        categoryScores[result.category] = { passed: 0, total: 0, score: 0 };
      }
      categoryScores[result.category].total++;
      if ((result as any).evaluation?.passed) {
        categoryScores[result.category].passed++;
      }
    }

    for (const cat of Object.keys(categoryScores)) {
      const data = categoryScores[cat];
      data.score = data.total > 0 ? (data.passed / data.total) * 100 : 0;
    }

    return {
      runId: `run-${Date.now()}`,
      modelId: this.config.modelId,
      datasetVersion: this.config.datasetVersion,
      mode,
      startTime,
      endTime: Date.now(),
      totalDurationMs: totalTime,
      totalCases: testCases.length,
      passedCases: passed,
      failedCases: failed,
      successRate: testCases.length > 0 ? (passed / testCases.length) * 100 : 0,
      averageLatencyMs: avgLatency,
      categoryScores,
      results,
      config: this.config,
    };
  }

  private buildPrompt(testCase: TestCase): string {
    // Build context-aware prompt
    let prompt = '';

    if (testCase.context && testCase.context.length > 0) {
      prompt += 'Conversation History:\n';
      for (const msg of testCase.context) {
        prompt += `${msg.role}: ${msg.content}\n`;
      }
      prompt += '\n';
    }

    if (testCase.knowledgeContext) {
      prompt += 'Relevant Information:\n';
      prompt += testCase.knowledgeContext + '\n\n';
    }

    prompt += `User: ${testCase.input}\n`;
    prompt += 'Assistant:';

    return prompt;
  }
}
