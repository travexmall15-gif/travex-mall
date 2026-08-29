// ═══════════════════════════════════════════════════════════
// SHOPNEKT — Navigation Module Exports
// ═══════════════════════════════════════════════════════════

export {
  getNavigationManager,
  cleanupNavigationManager,
  useNavigationManager,
  type NavigationManagerType,
  type NavigationState,
} from './navigation-manager'

export {
  getPrefetchManager,
  cleanupPrefetchManager,
  usePrefetch,
  PrefetchLink,
  type PrefetchPriority,
  type PrefetchOptions,
} from './prefetch-manager'
