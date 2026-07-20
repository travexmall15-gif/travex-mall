import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In or Create Account',
  description: 'Sign in to your ShopNekt account or create a new one. Access your orders, messages, and seller dashboard.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://shopnekt.vercel.app/auth' },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
