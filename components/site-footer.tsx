'use client'

export function SiteFooter() {
  return (
    <footer style={{
      background: 'var(--sn-bg)',
      borderTop: '1px solid #F1F5F9',
      padding: '0.75rem 5%',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '0.68rem',
        color: 'var(--sn-subtle)',
        margin: 0,
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}>
        from QNEX360
      </p>
    </footer>
  )
}
