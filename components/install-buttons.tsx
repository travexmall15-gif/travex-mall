'use client'
export function InstallButtons() {
  return (
    <div style={{ display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center',alignItems:'center' }}>
      <a href="/ShopNekt.apk" download="ShopNekt.apk" style={{ display:'inline-flex',alignItems:'center',gap:'10px',background:'var(--sn-bg)',color:'var(--sn-text)',border:'none',borderRadius:'14px',padding:'13px 22px',textDecoration:'none',fontFamily:'inherit',boxShadow:'0 4px 14px rgba(13,27,62,0.25)',minWidth:'165px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M3.18 23.82a2 2 0 0 1-.95-1.74V1.92A2 2 0 0 1 3.18.18l11.9 11.82L3.18 23.82zm14.45-8.05L5.01 22.15l10.3-10.22 2.32 3.84zM20.5 11.3l-2.72-1.57-2.6 2.27 2.6 2.28 2.74-1.58a1.05 1.05 0 0 0 0-1.4zM5.01 1.85l12.62 6.38-2.32 3.84L5.01 1.85z"/></svg>
        <div style={{ textAlign:'left' }}>
          <div style={{ fontSize:'9px',color:'var(--sn-muted)',lineHeight:1,marginBottom:'2px' }}>DIRECT DOWNLOAD</div>
          <div style={{ fontSize:'15px',fontWeight:700,lineHeight:1 }}>Android APK</div>
        </div>
      </a>
      <button onClick={() => alert('To install on iPhone/iOS:\n\n1. Open shopnekt.vercel.app in Safari\n2. Tap Share (□↑) at the bottom\n3. Tap "Add to Home Screen"\n4. Tap Add, Done! ✅')} style={{ display:'inline-flex',alignItems:'center',gap:'10px',background:'var(--sn-bg)',color:'var(--sn-text)',border:'none',borderRadius:'14px',padding:'13px 22px',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 14px rgba(13,27,62,0.25)',minWidth:'165px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
        <div style={{ textAlign:'left' }}>
          <div style={{ fontSize:'9px',color:'var(--sn-muted)',lineHeight:1,marginBottom:'2px' }}>INSTALL ON</div>
          <div style={{ fontSize:'15px',fontWeight:700,lineHeight:1 }}>iPhone / iOS</div>
        </div>
      </button>
    </div>
  )
}
