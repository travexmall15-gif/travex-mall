/**
 * ShopNekt Model Lab - Dataset Types
 * 
 * Defines the structure for benchmark datasets and test cases.
 */

export type TestCategory = 
  | 'swahili'
  | 'english'
  | 'mixed-language'
  | 'intent'
  | 'entity'
  | 'context'
  | 'commerce'
  | 'tool-calling'
  | 'reasoning'
  | 'hallucination'
  | 'safety';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
}

export interface TestCase {
  id: string;
  name: string;
  category: TestCategory;
  input: string;
  context?: Message[];
  knowledgeContext?: string;
  expectedOutput: {
    intent?: string;
    entities?: Record<string, any>;
    response?: string;
    structuredOutput?: any;
  };
  evaluationCriteria: {
    requiredIntent?: string;
    requiredEntities?: string[];
    forbiddenContent?: string[];
    minConfidence?: number;
  };
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

export interface BenchmarkDataset {
  id: string;
  name: string;
  version: string;
  description: string;
  createdAt: number;
  testCases: TestCase[];
  metadata: {
    languageDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
    totalCases: number;
  };
}

export interface BenchmarkRun {
  runId: string;
  modelId: string;
  datasetVersion: string;
  mode: 'smoke' | 'full';
  startTime: number;
  endTime: number;
  totalDurationMs: number;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  successRate: number;
  averageLatencyMs: number;
  categoryScores: Record<string, { passed: number; total: number; score: number }>;
  results: any[];
  config: any;
}
