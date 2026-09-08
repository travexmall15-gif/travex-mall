// ═══════════════════════════════════════════════════════════
// WEBSTORE NOTIFICATIONS — free wa.me click-to-chat, NOT the paid
// WhatsApp Business API.
// ═══════════════════════════════════════════════════════════
// HONEST SCOPE NOTE: WhatsApp's official Business API charges per
// message (utility-category messages like these approval/rejection
// notices are not free, since ShopNekt — not the seller — initiates
// them). This app has no such paid integration, and per explicit
// instruction, this Phase 1 build does not add one.
//
// What this DOES do, which is completely real and free: generates a
// standard "click to chat" wa.me link
// (https://wa.me/<number>?text=<message>) using the seller's own
// shop_whatsapp number, exactly like the WhatsApp CTA buttons already
// used elsewhere in this app (e.g. storefront contact buttons). An
// admin reviewing an application clicks this link, WhatsApp opens
// with the message pre-filled, and the admin sends it manually — a
// real notification mechanism, just not an automated/paid one.
//
// Notification EVENTS are still modeled as a proper type (per the
// spec's "notification architecture, not hardcoded messages"
// requirement) so a future automated/paid integration can be dropped
// in later without touching the admin UI that calls this.

export type WebstoreNotificationEvent = 'WEBSTORE_APPROVED' | 'WEBSTORE_REJECTED'

export type WebstoreNotificationInput = {
  event: WebstoreNotificationEvent
  ownerName: string
  businessName: string
  whatsappNumber: string
  rejectionReason?: string | null
}

function buildMessage(input: WebstoreNotificationInput): string {
  switch (input.event) {
    case 'WEBSTORE_APPROVED':
      return `Habari ${input.ownerName}, hongera! WebStore yako ya ${input.businessName} imeidhinishwa na ShopNekt. Ingia kwenye ShopNekt na ubofye Publish ili kuweka WebStore yako live.`
    case 'WEBSTORE_REJECTED':
      return `Habari ${input.ownerName}, maombi ya WebStore yako ya ${input.businessName} yamepitiwa. Kuna baadhi ya marekebisho yanahitajika${input.rejectionReason ? `: ${input.rejectionReason}` : '.'} Tafadhali ingia ShopNekt kuona maelezo na kufanya marekebisho.`
  }
}

/** Normalizes a locally-formatted TZ number (e.g. "0712345678") into the international format wa.me requires. */
function normalizeToInternational(rawNumber: string): string {
  const digits = rawNumber.replace(/\D/g, '')
  if (digits.startsWith('255')) {return digits}
  if (digits.startsWith('0')) {return '255' + digits.slice(1)}
  return digits
}

/** Builds the real wa.me click-to-chat URL for a given notification event. Returns null if no WhatsApp number is on file — never silently fails or fakes delivery. */
export function buildWebstoreNotificationLink(input: WebstoreNotificationInput): string | null {
  if (!input.whatsappNumber?.trim()) {return null}
  const number = normalizeToInternational(input.whatsappNumber)
  const message = buildMessage(input)
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
