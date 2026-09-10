import FashionTemplate01 from '@/components/webstore-templates/fashion-01'
import FashionTemplate02 from '@/components/webstore-templates/fashion-02'
import FashionTemplate03 from '@/components/webstore-templates/fashion-03'
import FashionTemplate04 from '@/components/webstore-templates/fashion-04'
import FashionTemplate05 from '@/components/webstore-templates/fashion-05'
import VehicleTemplate01 from '@/components/webstore-templates/vehicle-01'
import VehicleTemplate02 from '@/components/webstore-templates/vehicle-02'
import VehicleTemplate03 from '@/components/webstore-templates/vehicle-03'
import VehicleTemplate04 from '@/components/webstore-templates/vehicle-04'
import VehicleTemplate05 from '@/components/webstore-templates/vehicle-05'
import ElectronicsTemplate01 from '@/components/webstore-templates/electronics-01'
import ElectronicsTemplate02 from '@/components/webstore-templates/electronics-02'
import ElectronicsTemplate03 from '@/components/webstore-templates/electronics-03'
import ElectronicsTemplate04 from '@/components/webstore-templates/electronics-04'
import ElectronicsTemplate05 from '@/components/webstore-templates/electronics-05'

// ═══════════════════════════════════════════════════════════
// This is the ONLY place a selected_template id is mapped to a real
// component. Phase 2 added 9 templates (4 more per marketplace) to
// reach 5 per market total — adding another means one new entry here
// (plus a row in webstore_templates) — nothing else in the app needs
// to change, per the "scale to thousands of WebStores without
// generating per-seller files" requirement.
// ═══════════════════════════════════════════════════════════

export const WEBSTORE_TEMPLATE_REGISTRY: Record<string, React.ComponentType<any>> = {
  'fashion-01': FashionTemplate01,
  'fashion-02': FashionTemplate02,
  'fashion-03': FashionTemplate03,
  'fashion-04': FashionTemplate04,
  'fashion-05': FashionTemplate05,
  'vehicle-01': VehicleTemplate01,
  'vehicle-02': VehicleTemplate02,
  'vehicle-03': VehicleTemplate03,
  'vehicle-04': VehicleTemplate04,
  'vehicle-05': VehicleTemplate05,
  'electronics-01': ElectronicsTemplate01,
  'electronics-02': ElectronicsTemplate02,
  'electronics-03': ElectronicsTemplate03,
  'electronics-04': ElectronicsTemplate04,
  'electronics-05': ElectronicsTemplate05,
}

export function getWebstoreTemplateComponent(templateId: string | null | undefined) {
  if (!templateId) {return null}
  return WEBSTORE_TEMPLATE_REGISTRY[templateId] || null
}
