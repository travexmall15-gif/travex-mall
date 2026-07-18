import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  onDark = true,
}: {
  className?: string
  onDark?: boolean
}) {
  return (
    <Link
      href="/"
      className={cn(
        'font-heading text-xl font-extrabold tracking-tight md:text-2xl',
        className,
      )}
    >
      <span className={onDark ? 'text-white' : 'text-navy'}>SHOP</span>{' '}
      <span className="text-gold">MALL</span>
    </Link>
  )
}
