export default function Loading() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--sn-page)', paddingTop:'118px', fontFamily:'var(--sn-font)' }}>
      <style>{`
        @keyframes shimmer {
          0%{background-position:-400px 0}
          100%{background-position:400px 0}
        }
        .sk{
          background:linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%);
          background-size:800px 100%;
          animation:shimmer 1.4s infinite linear;
          border-radius:8px;
        }
      `}</style>

      {/* Sell chip skeleton */}
      <div style={{background:'var(--sn-bg)',padding:'1.2rem 5%',borderBottom:'1px solid #F3F4F6'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div className="sk" style={{height:50,borderRadius:14,opacity:.3}}/>
        </div>
      </div>

      {/* 360 AI chip skeleton */}
      <div style={{background: 'var(--sn-bg),#0D1B3E)',padding:'1.2rem 5%'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div className="sk" style={{height:50,borderRadius:14,opacity:.2}}/>
        </div>
      </div>

      {/* Three Markets skeleton */}
      <section style={{padding:'3rem 5%',background:'var(--sn-page)'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'2rem'}}>
            <div className="sk" style={{height:14,width:120,margin:'0 auto 10px'}}/>
            <div className="sk" style={{height:28,width:280,margin:'0 auto'}}/>
          </div>
          <div style={{display:'flex',gap:'1.5rem',flexWrap:'wrap'}}>
            {[1,2,3].map(i=>(
              <div key={i} style={{flex:'1 1 280px',border:'2px solid #F1F5F9',borderRadius:24,padding:'2rem',minHeight:340}}>
                <div className="sk" style={{width:56,height:56,borderRadius:16,marginBottom:16}}/>
                <div className="sk" style={{height:14,width:'60%',marginBottom:10}}/>
                <div className="sk" style={{height:26,width:'80%',marginBottom:12}}/>
                <div className="sk" style={{height:14,marginBottom:8}}/>
                <div className="sk" style={{height:14,width:'90%',marginBottom:24}}/>
                <div style={{display:'flex',gap:12,marginTop:'auto'}}>
                  <div className="sk" style={{flex:1,height:40,borderRadius:999}}/>
                  <div className="sk" style={{flex:1,height:40,borderRadius:999}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
