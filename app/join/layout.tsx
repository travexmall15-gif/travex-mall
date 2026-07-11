import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Join Travex Mall, Open Your Store in Tanzania',
  description: 'Travex Mall is Tanzania\'s digital marketplace. Open your store today.',
}
export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
