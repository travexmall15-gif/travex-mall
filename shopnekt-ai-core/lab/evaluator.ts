/**
 * ShopNekt Model Lab - Evaluator
 * 
 * Evaluates model outputs against expected results.
 */

import type { TestCase } from './dataset-types.js';
import type { GenerationResponse } from '../model/model-types.js';

export interface EvaluationResult {
  passed: boolean;
  score: number;
  details: {
    intentMatch?: boolean;
    entityMatch?: boolean;
    responseQuality?: number;
    hallucinationDetected?: boolean;
    safetyViolation?: boolean;
  };
  errors: string[];
}

export class Evaluator {
  /**
   * Evaluate a model response against a test case.
   */
  evaluate(testCase: TestCase, response: GenerationResponse): EvaluationResult {
    const errors: string[] = [];
    const details: EvaluationResult['details'] = {};
    let score = 0;
    let maxScore = 0;

    // Check intent if required
    if (testCase.evaluationCriteria.requiredIntent) {
      maxScore += 30;
      const intentMatch = this.checkIntentMatch(response.content, testCase.evaluationCriteria.requiredIntent);
      if (intentMatch) {
        score += 30;
        details.intentMatch = true;
      } else {
        errors.push(`Intent mismatch: expected ${testCase.evaluationCriteria.requiredIntent}`);
        details.intentMatch = false;
      }
    }

    // Check entities if required
    if (testCase.evaluationCriteria.requiredEntities && testCase.evaluationCriteria.requiredEntities.length > 0) {
      maxScore += 30;
      const entityMatch = this.checkEntityMatch(response.content, testCase.evaluationCriteria.requiredEntities);
      if (entityMatch) {
        score += 30;
        details.entityMatch = true;
      } else {
        errors.push('Required entities not found in response');
        details.entityMatch = false;
      }
    }

    // Check for forbidden content (hallucinations, safety violations)
    if (testCase.evaluationCriteria.forbiddenContent) {
      maxScore += 20;
      const hasForbidden = testCase.evaluationCriteria.forbiddenContent.some(
        forbidden => response.content.toLowerCase().includes(forbidden.toLowerCase())
      );
      
      if (!hasForbidden) {
        score += 20;
        details.hallucinationDetected = false;
      } else {
        errors.push('Forbidden content detected (possible hallucination)');
        details.hallucinationDetected = true;
      }
    }

    // Response quality check (basic)
    maxScore += 20;
    const qualityScore = this.assessResponseQuality(response.content, testCase.expectedOutput.response);
    score += qualityScore;
    details.responseQuality = qualityScore / 20;

    const passed = score >= (maxScore * 0.7); // 70% threshold

    return {
      passed,
      score: maxScore > 0 ? (score / maxScore) * 100 : 0,
      details,
      errors,
    };
  }

  private checkIntentMatch(content: string, requiredIntent: string): boolean {
    const normalized = content.toLowerCase();
    
    // Simple keyword-based intent detection
    const intentKeywords: Record<string, string[]> = {
      'PRODUCT_SEARCH': ['search', 'find', 'look', 'natafuta', 'nakutafuta', 'product', 'item'],
      'SHOP_SEARCH': ['shop', 'store', 'duka', 'seller'],
      'PRICE_QUERY': ['price', 'bei', 'cost', 'how much', 'ngapi'],
      'ORDER_STATUS': ['order', 'status', 'tracking', 'delivery'],
      'RECOMMENDATION': ['recommend', 'suggest', 'propose', 'pendekeza'],
    };

    const keywords = intentKeywords[requiredIntent] || [];
    return keywords.some(keyword => normalized.includes(keyword));
  }

  private checkEntityMatch(content: string, requiredEntities: string[]): boolean {
    const normalized = content.toLowerCase();
    return requiredEntities.every(entity => 
      normalized.includes(entity.toLowerCase())
    );
  }

  private assessResponseQuality(actual: string, expected?: string): number {
    if (!expected) {
      // If no expected response, just check that we got something meaningful
      return actual.trim().length > 5 ? 10 : 5;
    }

    // Simple similarity check
    const actualWords = new Set(actual.toLowerCase().split(/\s+/));
    const expectedWords = new Set(expected.toLowerCase().split(/\s+/));
    
    let matches = 0;
    for (const word of expectedWords) {
      if (actualWords.has(word)) {
        matches++;
      }
    }

    const similarity = expectedWords.size > 0 ? matches / expectedWords.size : 0;
    return Math.round(similarity * 20);
  }
}
