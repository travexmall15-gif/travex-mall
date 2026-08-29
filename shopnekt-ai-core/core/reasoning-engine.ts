/**
 * SHOPNEKT AI CORE - Reasoning Engine Implementation
 * 
 * Applies safety rules, authorization checks, and reasoning logic.
 * Ensures AI actions are safe, authorized, and compliant with policies.
 */

import type {
  ReasoningEngine,
  AIRequest,
  ConversationContext,
  ToolDefinition,
  SafetyRule,
} from './ai-types.js'

const DEFAULT_SAFETY_RULES: SafetyRule[] = [
  {
    id: 'privacy_user_data',
    name: 'User Data Privacy',
    description: 'Never reveal another user\'s private data',
    category: 'privacy',
    severity: 'critical',
    action: 'block',
    handler: 'blockUserDataAccess',
  },
  {
    id: 'auth_required_actions',
    name: 'Authentication Required',
    description: 'Certain actions require authenticated user',
    category: 'authorization',
    severity: 'high',
    action: 'block',
    handler: 'requireAuthentication',
  },
  {
    id: 'no_hallucination_prices',
    name: 'No Price Hallucination',
    description: 'Never invent or guess product prices',
    category: 'hallucination',
    severity: 'high',
    action: 'warn',
    handler: 'verifyPriceData',
  },
  {
    id: 'no_hallucination_products',
    name: 'No Product Hallucination',
    description: 'Never invent products that don\'t exist',
    category: 'hallucination',
    severity: 'high',
    action: 'block',
    handler: 'verifyProductExists',
  },
  {
    id: 'financial_info_protection',
    name: 'Financial Information Protection',
    description: 'Never expose payment details or financial data',
    category: 'financial',
    severity: 'critical',
    action: 'block',
    handler: 'blockFinancialData',
  },
  {
    id: 'account_access_control',
    name: 'Account Access Control',
    description: 'Users can only access their own account information',
    category: 'account',
    severity: 'critical',
    action: 'block',
    handler: 'validateAccountAccess',
  },
  {
    id: 'admin_action_restriction',
    name: 'Admin Action Restriction',
    description: 'AI cannot perform admin-level actions',
    category: 'admin',
    severity: 'critical',
    action: 'block',
    handler: 'blockAdminActions',
  },
  {
    id: 'seller_data_isolation',
    name: 'Seller Data Isolation',
    description: 'Sellers can only see their own shop data',
    category: 'authorization',
    severity: 'high',
    action: 'block',
    handler: 'validateSellerAccess',
  },
]

export class ReasoningEngineImpl implements ReasoningEngine {
  private rules = new Map<string, SafetyRule>()

  constructor() {
    // Load default safety rules
    DEFAULT_SAFETY_RULES.forEach(rule => {
      this.rules.set(rule.id, rule)
    })
  }

  /**
   * Apply reasoning rules to a request
   */
  applyRules(input: AIRequest, context: ConversationContext): { allowed: boolean; reasons: string[] } {
    const reasons: string[] = []
    let allowed = true

    // Check for privacy violations
    if (this.containsPrivacyViolation(input, context)) {
      reasons.push('Potential privacy violation detected')
      allowed = false
    }

    // Check for unauthorized data access patterns
    if (this.containsUnauthorizedAccess(input, context)) {
      reasons.push('Unauthorized data access attempt')
      allowed = false
    }

    // Check for hallucination risk patterns
    if (this.hasHallucinationRisk(input)) {
      reasons.push('Response may contain unverified information')
      // Warning only, doesn't block
    }

    return { allowed, reasons }
  }

  /**
   * Validate tool execution permissions
   */
  validateToolExecution(tool: ToolDefinition, userId?: string): { allowed: boolean; reasons: string[] } {
    const reasons: string[] = []
    let allowed = true

    // Check authentication requirement
    if (tool.requiresAuth && !userId) {
      reasons.push(`Tool '${tool.name}' requires authentication`)
      allowed = false
    }

    // Check authorization requirement
    if (tool.requiresAuthorization && !userId) {
      reasons.push(`Tool '${tool.name}' requires authorization`)
      allowed = false
    }

    // Check risk level restrictions
    if (tool.riskLevel === 'critical' && !userId) {
      reasons.push(`Tool '${tool.name}' has critical risk level and requires authentication`)
      allowed = false
    }

    // Check specific safety rules
    const applicableRules = this.getApplicableRulesForTool(tool)
    for (const rule of applicableRules) {
      if (rule.action === 'block') {
        reasons.push(`Blocked by safety rule: ${rule.name}`)
        allowed = false
      } else if (rule.action === 'warn') {
        reasons.push(`Warning from safety rule: ${rule.name}`)
      }
    }

    return { allowed, reasons }
  }

  /**
   * Register a new safety rule
   */
  registerSafetyRule(rule: SafetyRule): void {
    this.rules.set(rule.id, rule)
  }

  /**
   * Get all safety rules
   */
  getAllSafetyRules(): SafetyRule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Get a specific safety rule by ID
   */
  getSafetyRule(id: string): SafetyRule | null {
    return this.rules.get(id) || null
  }

  // ───────────────────────────────────────────────────────────
  // Private methods
  // ───────────────────────────────────────────────────────────

  private containsPrivacyViolation(input: AIRequest, context: ConversationContext): boolean {
    // Check if request attempts to access other users' data
    const suspiciousPatterns = [
      /other\s+users?/i,
      /everyone'?s/i,
      /all\s+(orders|shops|products)/i,
      /admin\s+(access|data|info)/i,
      /database/i,
      /raw\s+data/i,
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input.message)) {
        return true
      }
    }

    return false
  }

  private containsUnauthorizedAccess(input: AIRequest, context: ConversationContext): boolean {
    // Check for attempts to bypass authentication
    const bypassPatterns = [
      /skip\s+auth/i,
      /bypass/i,
      /admin\s+mode/i,
      /service\s+role/i,
      /root\s+access/i,
    ]

    for (const pattern of bypassPatterns) {
      if (pattern.test(input.message)) {
        return true
      }
    }

    return false
  }

  private hasHallucinationRisk(input: AIRequest): boolean {
    // Check for queries that might tempt the AI to invent information
    const riskPatterns = [
      /what\s+is\s+the\s+(exact|precise)\s+price/i,
      /tell\s+me\s+everything\s+about/i,
      /list\s+all\s+/i,
      /give\s+me\s+details\s+of\s+every/i,
    ]

    for (const pattern of riskPatterns) {
      if (pattern.test(input.message)) {
        return true
      }
    }

    return false
  }

  private getApplicableRulesForTool(tool: ToolDefinition): SafetyRule[] {
    const applicable: SafetyRule[] = []

    // Authorization rules apply to tools requiring auth
    if (tool.requiresAuth || tool.requiresAuthorization) {
      const authRules = Array.from(this.rules.values()).filter(r => r.category === 'authorization')
      applicable.push(...authRules)
    }

    // Financial tools need financial protection
    if (tool.name.toLowerCase().includes('payment') || tool.name.toLowerCase().includes('order')) {
      const financialRules = Array.from(this.rules.values()).filter(r => r.category === 'financial')
      applicable.push(...financialRules)
    }

    // Account-related tools need account access control
    if (tool.name.toLowerCase().includes('account') || tool.name.toLowerCase().includes('user')) {
      const accountRules = Array.from(this.rules.values()).filter(r => r.category === 'account')
      applicable.push(...accountRules)
    }

    return applicable
  }

  /**
   * Check if a message contains sensitive data patterns
   */
  containsSensitiveData(message: string): boolean {
    const sensitivePatterns = [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone
      /\b(password|passwd|pwd)\s*[=:]\s*\S+/i, // Password
      /\b(api[_-]?key|apikey)\s*[=:]\s*\S+/i, // API key
      /\b(secret[_-]?key|secretkey)\s*[=:]\s*\S+/i, // Secret key
    ]

    for (const pattern of sensitivePatterns) {
      if (pattern.test(message)) {
        return true
      }
    }

    return false
  }

  /**
   * Sanitize output to remove potentially sensitive data
   */
  sanitizeOutput(output: string): string {
    let sanitized = output

    // Mask potential credit card numbers
    sanitized = sanitized.replace(/\b(\d{4})[-\s]?\d{4}[-\s]?\d{4}[-\s]?(\d{4})\b/g, '$1-****-****-$2')

    // Mask potential passwords
    sanitized = sanitized.replace(/\b(password|passwd|pwd)\s*[=:]\s*\S+/gi, '$1=[REDACTED]')

    // Mask potential API keys
    sanitized = sanitized.replace(/\b(api[_-]?key|apikey)\s*[=:]\s*\S+/gi, '$1=[REDACTED]')

    return sanitized
  }
}
