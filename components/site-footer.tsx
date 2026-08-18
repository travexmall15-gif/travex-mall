'use client'

export function SiteFooter() {
  return (
    <footer style={{
      background: 'var(--sn-bg)',
      borderTop: '1px solid #F1F5F9',
      padding: '1.5rem 5%',
      textAlign: 'center',
    }}>
      {/* Footer links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
      }}>
        <a
          href="/Travex_Mall.apk"
          download
          style={{
            fontSize: '0.75rem',
            color: 'var(--sn-text)',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--sn-primary)'}
          onMouseOut={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--sn-text)'}
        >
          Download App
        </a>
        <span style={{ color: '#E2E8F0' }}>•</span>
        <a
          href="/auth"
          style={{
            fontSize: '0.75rem',
            color: 'var(--sn-text)',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--sn-primary)'}
          onMouseOut={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--sn-text)'}
        >
          Login
        </a>
        <span style={{ color: '#E2E8F0' }}>•</span>
        <a
          href="/vybe"
          style={{
            fontSize: '0.75rem',
            color: 'var(--sn-text)',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--sn-primary)'}
          onMouseOut={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--sn-text)'}
        >
          Social Vybe
        </a>
      </div>
      
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
