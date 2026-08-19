'use client'
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer style={{
      background: 'var(--sn-bg)',
      borderTop: '1px solid var(--sn-border)',
      padding: '1rem 5%',
    }}>
      {/* Footer links */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        marginBottom: '0.6rem',
        flexWrap: 'wrap',
      }}>
        <Link
          href="/join"
          style={{ fontSize: '0.72rem', color: 'var(--sn-muted)', textDecoration: 'none', fontWeight: 600 }}
        >
          Download App
        </Link>
        <Link
          href="/auth"
          style={{ fontSize: '0.72rem', color: 'var(--sn-muted)', textDecoration: 'none', fontWeight: 600 }}
        >
          Login
        </Link>
        <Link
          href="/vybe"
          style={{ fontSize: '0.72rem', color: 'var(--sn-muted)', textDecoration: 'none', fontWeight: 600 }}
        >
          Social Vybe
        </Link>
      </div>
      {/* Brand */}
      <p style={{
        fontSize: '0.65rem',
        color: 'var(--sn-subtle)',
        margin: 0,
        textAlign: 'center',
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}>
        from QNEX360
      </p>
    </footer>
  )
}
