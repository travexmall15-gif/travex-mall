'use client'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'

export function SiteFooter() {
  const { t } = useTranslation()
  return (
    <footer style={{
      background: '#060B18',
      padding: '2rem 5%',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: '600px', margin: '0 auto',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '1.25rem',
      }}>
        {/* 3 buttons */}
        <div style={{
          display: 'flex', gap: '0.75rem',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { label: 'ShopNekt Move',    href: '/move/index.html' },
            { label: 'ShopNekt Stay',    href: '#'                },
            { label: 'QNEX360', href: 'https://travex-mall.vercel.app' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.65)',
              borderRadius: '999px',
              padding: '0.45rem 1.1rem',
              fontSize: '0.78rem', fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap' as const,
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.12)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.30)'
              ;(e.currentTarget as HTMLElement).style.color = '#C9A84C'
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)'
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <p style={{
          fontSize: '0.72rem',
          color: 'rgba(255,255,255,0.22)',
          margin: 0, textAlign: 'center',
        }}>
          © {new Date().getFullYear()} QNEX360 · Global, Tanzania
        </p>
      </div>
    </footer>
  )
}
