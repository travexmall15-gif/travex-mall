import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Join ShopNekt, Open Your Store in Tanzania',
  description: 'ShopNekt is Tanzania\'s digital marketplace. Open your store today.',
}
export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
