'use client'
import { useLang } from '@/lib/lang-context'
import { useTranslation } from '@/hooks/useTranslation'

export function LangSwitcher() {
  const { lang, setLang } = useLang()
  const { t } = useTranslation()
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'2px', background:'rgba(255,255,255,0.08)', borderRadius:'999px', padding:'3px', border:'1px solid rgba(255,255,255,0.14)' }}>
      {(['en','sw'] as const).map(code => (
        <button key={code} onClick={() => setLang(code)} style={{
          display:'inline-flex', alignItems:'center', gap:'4px',
          padding:'4px 10px', borderRadius:'999px', border:'none',
          background: lang===code ? '#C9A84C' : 'transparent',
          color: lang===code ? '#0F172A' : 'rgba(255,255,255,0.65)',
          fontSize:'0.72rem', fontWeight: lang===code ? 700 : 500,
          cursor:'pointer', transition:'all 0.2s',
          fontFamily:"'Inter',sans-serif", whiteSpace:'nowrap',
        }}>
          <span style={{ fontSize:'0.82rem' }}>{code==='en'?'🇬🇧':'🇹🇿'}</span>
          {code==='en' ? 'English' : 'Kiswahili'}
        </button>
      ))}
    </div>
  )
}
