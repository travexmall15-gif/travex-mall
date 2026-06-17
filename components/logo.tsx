import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  onDark = true,
  size = 'md',
}: {
  className?: string
  onDark?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const dimensions = {
    sm: { w: 28, h: 28, text: 'text-base' },
    md: { w: 36, h: 36, text: 'text-xl'  },
    lg: { w: 48, h: 48, text: 'text-2xl' },
  }[size]

  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2.5 no-underline', className)}
    >
      <Image
        src="/tdg-logo.png"
        alt="Travex Digital Group"
        width={dimensions.w}
        height={dimensions.h}
        className="object-contain"
        priority
      />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-extrabold tracking-tight',
            dimensions.text,
            onDark ? 'text-white' : 'text-[#0D1B3E]',
          )}
        >
          TRAVEX
        </span>
        <span
          className="text-[10px] font-bold tracking-[0.15em] uppercase"
          style={{ color: '#C9A84C' }}
        >
          MALL
        </span>
      </div>
    </Link>
  )
}
