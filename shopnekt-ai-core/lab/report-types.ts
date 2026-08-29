/**
 * ShopNekt Model Lab - Report Types
 * 
 * Defines the structure for benchmark reports and scorecards.
 */

export interface CategoryScore {
  category: string;
  score: number;
  passed: number;
  total: number;
  details?: string;
}

export interface PerformanceMetrics {
  averageLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  tokensPerSecond?: number;
  requestsPerSecond?: number;
}

export interface SafetyMetrics {
  hallucinationCount: number;
  hallucinationRate: number;
  safetyViolations: number;
  privacyViolations: number;
}

export interface ModelInfo {
  modelId: string;
  version: string;
  provider: string;
  contextLength: number;
  license?: string;
  commercialUse?: boolean;
}

export interface BenchmarkReport {
  runId: string;
  timestamp: number;
  model: ModelInfo;
  dataset: {
    id: string;
    name: string;
    version: string;
  };
  summary: {
    overallScore: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
  };
  categoryScores: CategoryScore[];
  performance: PerformanceMetrics;
  safety: SafetyMetrics;
  failures: {
    testCaseId: string;
    category: string;
    input: string;
    expectedOutput: any;
    actualOutput: string;
    error?: string;
  }[];
  configuration: {
    temperature: number;
    topP: number;
    maxTokens: number;
    timeoutMs: number;
  };
  hardware?: {
    cpu?: string;
    gpu?: string;
    memory?: string;
    platform?: string;
  };
  recommendations: string[];
}

export interface ScorecardEntry {
  modelId: string;
  overallScore: number;
  swahiliScore: number;
  englishScore: number;
  mixedLanguageScore: number;
  intentScore: number;
  entityScore: number;
  contextScore: number;
  commerceScore: number;
  toolCallingScore: number;
  safetyScore: number;
  hallucinationRate: number;
  averageLatencyMs: number;
  timestamp: number;
}

export interface ComparisonReport {
  generatedAt: number;
  models: ScorecardEntry[];
  winner?: string;
  comparisonTable: string;
  analysis: string;
}
