// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Performance Module Exports
// ═══════════════════════════════════════════════════════════

export {
  deduplicateRequest,
  clearRequestCache,
} from './request-deduplication'

export {
  usePrefersReducedMotion,
  useDebounce,
  throttle,
  getConnectionInfo,
  useLazyImageObserver,
  useVisibilityChange,
  getCriticalRoutes,
  measurePerformance,
} from './performance-utils'
