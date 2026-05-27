'use client'
import { useState, useEffect } from 'react'

const SUPA_URL = 'https://pyyfurstwwhvpxrysilh.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eWZ1cnN0d3dodnB4cnlzaWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTE4NDEsImV4cCI6MjA5MzQ4Nzg0MX0.xOT5DnBXmLNGS7T1XgjwCh1m0yfDj8IwN3BucbcsKaI'
const BRAND = '#166534'

async function supaFetch(path, options={}, token=null) {
  const headers = { 'Content-Type':'application/json', 'apikey':SUPA_KEY, 'Authorization':`Bearer ${token||SUPA_KEY}`, ...(options.headers||{}) }
  const res  = await fetch(`${SUPA_URL}${path}`, {...options, headers})
  const text = await res.text()
  const json = text ? JSON.parse(text) : {}
  if (!res.ok) throw json
  return json
}

export default function QuickCapture() {
  const [session, setSession]   = useState(null)
  const [email, setEmail]       = useState('')
  const [pass, setPass]         = useState('')
  const [authErr, setAuthErr]   = useState('')
  const [authLoad, setAuthLoad] = useState(false)
  const [text, setText]         = useState('')
  const [saved, setSaved]       = useState(false)
  const [saving, setSaving]     = useState(false)
  const [count, setCount]       = useState(0)

  // Try to restore session from localStorage
  useEffect(() => {
    const s = localStorage.getItem('kanvuu_quick_session')
    if (s) { try { setSession(JSON.parse(s)) } catch {} }
  }, [])

  const login = async () => {
    setAuthErr(''); setAuthLoad(true)
    try {
      const data = await supaFetch('/auth/v1/token?grant_type=password', { method:'POST', body:JSON.stringify({ email, password:pass }) })
      localStorage.setItem('kanvuu_quick_session', JSON.stringify(data))
      setSession(data)
    } catch(e) { setAuthErr('Correo o contraseña incorrectos.') }
    setAuthLoad(false)
  }

  const save = async () => {
    if (!text.trim() || !session) return
    setSaving(true)
    try {
      await supaFetch('/rest/v1/tasks', {
        method:'POST',
        body: JSON.stringify({ user_id: session.user.id, text: text.trim(), status:'todo', today:false, position:0, project_id: null }),
        headers:{ 'Prefer':'return=representation' }
      }, session.access_token)
      setText('')
      setSaved(true)
      setCount(c => c+1)
      setTimeout(() => setSaved(false), 2000)
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  const logout = () => { localStorage.removeItem('kanvuu_quick_session'); setSession(null) }

  const inp16 = { fontSize:'16px', WebkitAppearance:'none' }

  if (!session) return (
    <div style={{ minHeight:'100vh', background:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', fontFamily:"'SF Pro Text','Helvetica Neue',sans-serif" }}>
      <div style={{ marginBottom:'32px', textAlign:'center' }}>
        <svg width="52" height="52" viewBox="0 0 48 48" fill="none" style={{ marginBottom:'12px' }}>
          <rect width="48" height="48" rx="11" fill={BRAND}/>
          <rect x="13" y="10" width="5" height="28" rx="2.5" fill="#fff"/>
          <path d="M18 24 L35 10" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
          <path d="M18 24 L35 38" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
        </svg>
        <div style={{ fontSize:'22px', fontWeight:800, color:BRAND, letterSpacing:'-0.5px' }}>Kanvuu</div>
        <div style={{ fontSize:'13px', color:'#aaa', marginTop:'4px' }}>Captura rápida</div>
      </div>

      <div style={{ width:'100%', maxWidth:'340px' }}>
        {authErr && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:'#dc2626', marginBottom:'14px' }}>{authErr}</div>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Correo electrónico" type="email"
          style={{ width:'100%', border:'1px solid #e5e5e5', borderRadius:'10px', padding:'13px 14px', marginBottom:'10px', boxSizing:'border-box', outline:'none', ...inp16 }}/>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Contraseña" type="password"
          onKeyDown={e=>{ if(e.key==='Enter') login() }}
          style={{ width:'100%', border:'1px solid #e5e5e5', borderRadius:'10px', padding:'13px 14px', marginBottom:'14px', boxSizing:'border-box', outline:'none', ...inp16 }}/>
        <button onClick={login} disabled={authLoad}
          style={{ width:'100%', background:BRAND, color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'16px', fontWeight:700, cursor:'pointer', opacity:authLoad?0.7:1 }}>
          {authLoad ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fff', display:'flex', flexDirection:'column', fontFamily:"'SF Pro Text','Helvetica Neue',sans-serif" }}>

      {/* Header */}
      <div style={{ padding:'16px 20px', borderBottom:`2px solid ${BRAND}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="11" fill={BRAND}/>
            <rect x="13" y="10" width="5" height="28" rx="2.5" fill="#fff"/>
            <path d="M18 24 L35 10" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
            <path d="M18 24 L35 38" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontWeight:800, fontSize:'15px', color:BRAND }}>Captura rápida</span>
        </div>
        <button onClick={logout} style={{ background:'none', border:'none', color:'#aaa', fontSize:'12px', cursor:'pointer' }}>Salir</button>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'32px 24px', maxWidth:'480px', width:'100%', margin:'0 auto', boxSizing:'border-box' }}>

        {/* Success */}
        {saved && (
          <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'20px' }}>✓</span>
            <span style={{ fontSize:'14px', color:'#16a34a', fontWeight:600 }}>¡Guardado! Puedes agregar otro.</span>
          </div>
        )}

        <div style={{ marginBottom:'12px', fontSize:'13px', color:'#aaa' }}>
          ¿Qué tienes en mente?
        </div>

        <textarea value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)) save() }}
          placeholder="Escribe tu pendiente aquí..."
          autoFocus
          rows={4}
          style={{ width:'100%', border:`2px solid ${text.trim()?BRAND:'#e5e5e5'}`, borderRadius:'12px', padding:'14px', fontSize:'16px', outline:'none', resize:'none', fontFamily:'inherit', boxSizing:'border-box', transition:'border 0.2s', lineHeight:'1.5' }}
        />

        <button onClick={save} disabled={!text.trim()||saving}
          style={{ marginTop:'14px', width:'100%', background:text.trim()?BRAND:'#e5e5e5', color:text.trim()?'#fff':'#aaa', border:'none', borderRadius:'12px', padding:'16px', fontSize:'17px', fontWeight:700, cursor:text.trim()?'pointer':'default', transition:'all 0.2s' }}>
          {saving ? 'Guardando...' : '+ Guardar pendiente'}
        </button>

        {count > 0 && (
          <div style={{ marginTop:'20px', textAlign:'center', color:'#aaa', fontSize:'12px' }}>
            {count} pendiente{count!==1?'s':''} guardado{count!==1?'s':''} esta sesión
          </div>
        )}

        <div style={{ marginTop:'32px', padding:'16px', background:'#fafafa', borderRadius:'10px', fontSize:'12px', color:'#bbb', lineHeight:'1.6' }}>
          💡 Los pendientes se guardan sin proyecto asignado. Puedes asignarlos después desde <strong style={{ color:'#888' }}>kanvuu.com/app</strong>
        </div>

        <a href="/app" style={{ display:'block', marginTop:'16px', textAlign:'center', color:BRAND, fontSize:'13px', textDecoration:'none', fontWeight:600 }}>
          → Ir al app completo
        </a>
      </div>
    </div>
  )
}
