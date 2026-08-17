'use client'

export function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
    }}>
      <div style={{
        width: '36px', height: '36px',
        border: '3px solid #E2E8F0',
        borderTop: '3px solid #0D1B3E',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px', padding: '16px',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', background: 'var(--sn-page)' }}>
          <div className="skeleton" style={{ height: '160px', width: '100%' }} />
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton" style={{ height: '14px', width: '70%' }} />
            <div className="skeleton" style={{ height: '12px', width: '40%' }} />
            <div className="skeleton" style={{ height: '18px', width: '55%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
