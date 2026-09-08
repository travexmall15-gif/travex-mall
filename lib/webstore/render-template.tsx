import FashionTemplate01 from '@/components/webstore-templates/fashion-01'
import VehicleTemplate01 from '@/components/webstore-templates/vehicle-01'
import ElectronicsTemplate01 from '@/components/webstore-templates/electronics-01'

// ═══════════════════════════════════════════════════════════
// This is the ONLY place a selected_template id is mapped to a real
// component. Adding a template in Phase 2 means adding one entry here
// (plus a row in webstore_templates) — nothing else in the app needs
// to change, per the "scale to thousands of WebStores without
// generating per-seller files" requirement.
// ═══════════════════════════════════════════════════════════

export const WEBSTORE_TEMPLATE_REGISTRY: Record<string, React.ComponentType<any>> = {
  'fashion-01': FashionTemplate01,
  'vehicle-01': VehicleTemplate01,
  'electronics-01': ElectronicsTemplate01,
}

export function getWebstoreTemplateComponent(templateId: string | null | undefined) {
  if (!templateId) {return null}
  return WEBSTORE_TEMPLATE_REGISTRY[templateId] || null
}
