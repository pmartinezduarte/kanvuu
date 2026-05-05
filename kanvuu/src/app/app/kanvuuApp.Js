'use client'
import { useState, useEffect, useCallback } from 'react'

const SUPA_URL = 'https://pyyfurstwwhvpxrysilh.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eWZ1cnN0d3dodnB4cnlzaWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTE4NDEsImV4cCI6MjA5MzQ4Nzg0MX0.xOT5DnBXmLNGS7T1XgjwCh1m0yfDj8IwN3BucbcsKaI'

const BRAND   = '#166534'
const ACCENTS = ['#2563eb','#16a34a','#dc2626','#9333ea','#ea580c','#0891b2']
const COLS = [
  { key:'todo',  en:'To do',       es:'Por hacer',  color:'#555'    },
  { key:'doing', en:'In progress', es:'En curso',   color:'#ea580c' },
  { key:'done',  en:'Done',        es:'Completado', color:'#16a34a' },
]

const T = {
  en: {
    tagline:'Your projects, always clear.',
    login:'Sign in', register:'Create account', logout:'Sign out',
    email:'Email', password:'Password', confirmPassword:'Confirm password',
    loginBtn:'Sign in', registerBtn:'Create account',
    switchToRegister:"Don't have an account? Create one",
    switchToLogin:'Already have an account? Sign in',
    newProject:'+ Project', projectName:'Project name...',
    create:'Create', addTask:'+ task', newTask:'New task...',
    hoy:'Today', todo:'To do', doing:'In progress', done:'Done',
    deleteProject:'Delete project?',
    deleteMsg1:'This will delete', deleteMsg2:'and all its tasks.',
    confirmDelete:'Delete', cancelDelete:'Cancel',
    noProjects:'Create your first project →',
    loading:'Loading...', errorPassMatch:'Passwords do not match.',
  },
  es: {
    tagline:'Tus proyectos, siempre claros.',
    login:'Iniciar sesión', register:'Crear cuenta', logout:'Cerrar sesión',
    email:'Correo electrónico', password:'Contraseña', confirmPassword:'Confirmar contraseña',
    loginBtn:'Entrar', registerBtn:'Crear cuenta',
    switchToRegister:'¿No tienes cuenta? Crea una',
    switchToLogin:'¿Ya tienes cuenta? Inicia sesión',
    newProject:'+ Proyecto', projectName:'Nombre del proyecto...',
    create:'Crear', addTask:'+ tarea', newTask:'Nueva tarea...',
    hoy:'Hoy', todo:'Por hacer', doing:'En curso', done:'Completado',
    deleteProject:'¿Eliminar proyecto?',
    deleteMsg1:'Se eliminará', deleteMsg2:'y todas sus tareas.',
    confirmDelete:'Eliminar', cancelDelete:'Cancelar',
    noProjects:'Crea tu primer proyecto →',
    loading:'Cargando...', errorPassMatch:'Las contraseñas no coinciden.',
  }
}

async function supaFetch(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPA_KEY,
    'Authorization': `Bearer ${token || SUPA_KEY}`,
    ...(options.headers || {}),
  }
  const res = await fetch(`${SUPA_URL}${path}`, { ...options, headers })
  const text = await res.text()
  const json = text ? JSON.parse(text) : {}
  if (!res.ok) throw json
  return json
}

const db = {
  select: (table, query='', token) =>
    supaFetch(`/rest/v1/${table}?${query}`, { headers:{ 'Prefer':'return=representation' } }, token),
  insert: (table, data, token) =>
    supaFetch(`/rest/v1/${table}`, { method:'POST', body:JSON.stringify(data), headers:{ 'Prefer':'return=representation' } }, token),
  update: (table, match, data, token) =>
    supaFetch(`/rest/v1/${table}?${match}`, { method:'PATCH', body:JSON.stringify(data), headers:{ 'Prefer':'return=representation' } }, token),
  delete: (table, match, token) =>
    supaFetch(`/rest/v1/${table}?${match}`, { method:'DELETE' }, token),
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return mobile
}

function Logo({ size=32, white=false }) {
  const bg = white ? '#fff' : BRAND
  const fg = white ? BRAND : '#fff'
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="11" fill={bg}/>
      <rect x="13" y="10" width="5" height="28" rx="2.5" fill={fg}/>
      <path d="M18 24 L35 10" stroke={fg} strokeWidth="5" strokeLinecap="round"/>
      <path d="M18 24 L35 38" stroke={fg} strokeWidth="5" strokeLinecap="round"/>
    </svg>
  )
}

// ── Auth Screen ───────────────────────────────────────────────
function AuthScreen({ t, onLogin, lang, setLang }) {
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [pass2, setPass2]     = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      if (mode === 'register') {
        if (pass !== pass2) { setError(t.errorPassMatch); setLoading(false); return }
        const res = await supaFetch('/auth/v1/signup', { method:'POST', body:JSON.stringify({ email, password:pass }) })
        if (res.access_token) { onLogin(res); setLoading(false); return }
        const res2 = await supaFetch('/auth/v1/token?grant_type=password', { method:'POST', body:JSON.stringify({ email, password:pass }) })
        onLogin(res2)
      } else {
        const data = await supaFetch('/auth/v1/token?grant_type=password', { method:'POST', body:JSON.stringify({ email, password:pass }) })
        onLogin(data)
      }
    } catch(e) {
      setError(e.error_description || e.message || e.msg || 'Error. Intenta de nuevo.')
    }
    setLoading(false)
  }

  const inp = {
    width:'100%', border:'1px solid #e5e5e5', borderRadius:'10px',
    padding:'13px 14px', fontSize:'16px', outline:'none',
    marginBottom:'12px', boxSizing:'border-box', fontFamily:'inherit',
    WebkitAppearance:'none',
  }

  return (
    <div style={{ minHeight:'100vh', background:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'SF Pro Text','Helvetica Neue',sans-serif", padding:'24px' }}>
      <div style={{ position:'fixed', top:16, right:16 }}>
        <button onClick={()=>setLang(l=>l==='es'?'en':'es')}
          style={{ background:'#f5f5f5', border:'none', borderRadius:'6px', padding:'6px 12px', fontSize:'12px', cursor:'pointer', fontWeight:600, color:'#555' }}>
          {lang==='es'?'EN':'ES'}
        </button>
      </div>

      <div style={{ marginBottom:'36px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px' }}>
        <Logo size={60} />
        <div>
          <div style={{ fontSize:'32px', fontWeight:'800', letterSpacing:'-1px', color:BRAND }}>Kanvuu</div>
          <div style={{ fontSize:'14px', color:'#aaa', marginTop:'4px' }}>{t.tagline}</div>
        </div>
      </div>

      <div style={{ width:'100%', maxWidth:'380px' }}>
        <div style={{ marginBottom:'18px', fontSize:'15px', fontWeight:'600', color:'#111' }}>
          {mode==='login' ? t.login : t.register}
        </div>

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'12px 14px', fontSize:'13px', color:'#dc2626', marginBottom:'16px' }}>
            {error}
          </div>
        )}

        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.email} type="email" style={inp} />
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder={t.password} type="password"
          onKeyDown={e=>{ if(e.key==='Enter'&&mode==='login') submit() }} style={inp} />
        {mode==='register' && (
          <input value={pass2} onChange={e=>setPass2(e.target.value)} placeholder={t.confirmPassword} type="password"
            onKeyDown={e=>{ if(e.key==='Enter') submit() }} style={inp} />
        )}

        <button onClick={submit} disabled={loading}
          style={{ width:'100%', background:BRAND, color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:'700', cursor:'pointer', opacity:loading?0.7:1, marginTop:'4px' }}>
          {loading ? t.loading : (mode==='login' ? t.loginBtn : t.registerBtn)}
        </button>

        <button onClick={()=>{ setMode(m=>m==='login'?'register':'login'); setError('') }}
          style={{ width:'100%', background:'none', border:'none', color:'#888', fontSize:'13px', cursor:'pointer', marginTop:'16px', textDecoration:'underline', padding:'8px' }}>
          {mode==='login' ? t.switchToRegister : t.switchToLogin}
        </button>
      </div>
    </div>
  )
}

function Badge({ label, bg, color }) {
  return <span style={{ fontSize:'10px', background:bg, color, borderRadius:'10px', padding:'1px 7px', fontWeight:500 }}>{label}</span>
}

function Btn({ label, onClick, color }) {
  return (
    <button onClick={onClick}
      style={{ background:'none', border:'none', color, cursor:'pointer', fontSize:'13px', padding:'4px 6px', lineHeight:1, minWidth:'28px', minHeight:'28px' }}>
      {label}
    </button>
  )
}

function TaskRow({ task, accent, onMove, onDelete, onToday, mobile }) {
  const [hov, setHov] = useState(false)
  const isDone  = task.status === 'done'
  const isToday = !!task.today && !isDone
  return (
    <div
      onMouseEnter={()=>!mobile&&setHov(true)}
      onMouseLeave={()=>!mobile&&setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:'7px', padding:'6px 4px', borderRadius:'7px', background:hov?'#f7f7f7':'transparent', transition:'background 0.1s' }}>
      {!isDone && (
        <button onClick={onToday}
          style={{
            flexShrink:0, cursor:'pointer', border:'none', borderRadius:'4px',
            padding:'2px 6px', fontSize:'9px', fontWeight:700, letterSpacing:'0.5px',
            background: isToday ? `${BRAND}18` : '#f0f0f0',
            color: isToday ? BRAND : '#ccc',
            transition:'all 0.15s', lineHeight:'16px', minHeight:'20px',
          }}>
          HOY
        </button>
      )}
      <span style={{ flex:1, fontSize:'13px', lineHeight:'1.4', color:isDone?'#bbb':'#222', textDecoration:isDone?'line-through':'none', fontWeight:isToday?600:400 }}>{task.text}</span>
      {/* On mobile show arrows always, on desktop show on hover */}
      {(hov || mobile) && (
        <div style={{ display:'flex', gap:'2px', flexShrink:0 }}>
          {task.status!=='todo'  && <Btn label="←" onClick={()=>onMove(task.status==='doing'?'todo':'doing')} color="#bbb" />}
          {task.status!=='done'  && <Btn label="→" onClick={()=>onMove(task.status==='todo'?'doing':'done')}  color={accent} />}
          <Btn label="✕" onClick={onDelete} color="#ddd" />
        </div>
      )}
    </div>
  )
}

// ── Mobile Project Card ───────────────────────────────────────
function MobileProjectCard({ proj, tasks, t, lang, accent, onToggle, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onEditStart, editProj, editVal, setEditVal, onEditSave, onEditCancel, adding, setAdding, newText, setNewText, onAddTask, onMoveTask, onDelTask, onTodayTask }) {
  const pTasks = tasks.filter(t=>t.project_id===proj.id)
  const todayN = pTasks.filter(t=>t.today&&t.status!=='done').length
  const doneN  = pTasks.filter(t=>t.status==='done').length
  const doingN = pTasks.filter(t=>t.status==='doing').length
  const todoN  = pTasks.filter(t=>t.status==='todo').length
  const pct    = pTasks.length ? Math.round(doneN/pTasks.length*100) : 0
  const [activeCol, setActiveCol] = useState('todo')

  return (
    <div style={{ background:'#fff', border:'1px solid #ebebeb', borderLeft:`3px solid ${accent}`, borderRadius:'12px', overflow:'hidden', marginBottom:'12px' }}>
      {/* Project header */}
      <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:'10px' }}>
        <div onClick={onToggle} style={{ display:'flex', alignItems:'center', gap:'8px', flex:1, cursor:'pointer', userSelect:'none', minWidth:0 }}>
          <span style={{ fontSize:'10px', color:'#ccc' }}>{proj.open?'▼':'▶'}</span>
          {editProj===proj.id ? (
            <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
              onClick={e=>e.stopPropagation()}
              onBlur={()=>onEditSave(proj.id)}
              onKeyDown={e=>{ if(e.key==='Enter') onEditSave(proj.id); if(e.key==='Escape') onEditCancel() }}
              style={{ border:'none', borderBottom:`1.5px solid ${accent}`, outline:'none', fontSize:'14px', fontWeight:700, background:'transparent', flex:1 }}
            />
          ) : (
            <span onDoubleClick={e=>{ e.stopPropagation(); onEditStart(proj) }}
              style={{ fontWeight:700, fontSize:'14px', flex:1 }}>{proj.name}</span>
          )}
        </div>
        {/* Stats inline */}
        <div style={{ display:'flex', gap:'5px', flexShrink:0 }}>
          {todayN>0 && <Badge label={`${todayN} hoy`} bg={`${BRAND}12`} color={BRAND} />}
        </div>
        <div style={{display:'flex',gap:'3px',flexShrink:0}}>
          <button onClick={onMoveUp} disabled={isFirst}
            style={{background:'none',border:'1px solid #eee',borderRadius:'5px',color:isFirst?'#ddd':'#999',cursor:isFirst?'default':'pointer',fontSize:'11px',padding:'2px 7px',lineHeight:1.6}}>↑</button>
          <button onClick={onMoveDown} disabled={isLast}
            style={{background:'none',border:'1px solid #eee',borderRadius:'5px',color:isLast?'#ddd':'#999',cursor:isLast?'default':'pointer',fontSize:'11px',padding:'2px 7px',lineHeight:1.6}}>↓</button>
          <button onClick={onDelete} style={{background:'none',border:'1px solid #eee',borderRadius:'5px',color:'#bbb',cursor:'pointer',fontSize:'12px',padding:'2px 8px',lineHeight:1.6}}>✕</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding:'0 14px 10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ flex:1, height:3, background:'#eee', borderRadius:3, overflow:'hidden' }}>
            <div style={{ width:`${pct}%`, height:'100%', background:BRAND, transition:'width 0.3s' }} />
          </div>
          <span style={{ fontSize:'11px', color:'#aaa', minWidth:'28px' }}>{pct}%</span>
        </div>
        <div style={{ display:'flex', gap:'8px', marginTop:'6px' }}>
          {todoN>0  && <Badge label={`${todoN} por hacer`}  bg="#f5f5f5" color="#777" />}
          {doingN>0 && <Badge label={`${doingN} en curso`}  bg="#fff7ed" color="#ea580c" />}
          {doneN>0  && <Badge label={`${doneN} listo`}      bg="#f0fdf4" color="#16a34a" />}
        </div>
      </div>

      {/* Expanded content */}
      {proj.open && (
        <div style={{ borderTop:'1px solid #f4f4f4' }}>
          {/* Column tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid #f4f4f4' }}>
            {COLS.map(col => (
              <button key={col.key} onClick={()=>setActiveCol(col.key)}
                style={{
                  flex:1, padding:'9px 4px', border:'none', cursor:'pointer',
                  background: activeCol===col.key ? '#fff' : '#fafafa',
                  borderBottom: activeCol===col.key ? `2px solid ${col.color}` : '2px solid transparent',
                  fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px',
                  color: activeCol===col.key ? col.color : '#bbb',
                  transition:'all 0.15s',
                }}>
                {lang==='es'?col.es:col.en} {pTasks.filter(t=>t.status===col.key).length > 0 && `(${pTasks.filter(t=>t.status===col.key).length})`}
              </button>
            ))}
          </div>

          {/* Active column tasks */}
          <div style={{ padding:'10px 14px 12px' }}>
            {pTasks.filter(t=>t.status===activeCol).map(task=>(
              <TaskRow key={task.id} task={task} accent={accent} mobile={true}
                onMove={s=>onMoveTask(task.id,s)}
                onDelete={()=>onDelTask(task.id)}
                onToday={()=>onTodayTask(task.id,task.today)}
              />
            ))}
            {pTasks.filter(t=>t.status===activeCol).length===0 && (
              <div style={{ color:'#ddd', fontSize:'12px', padding:'8px 0' }}>Sin tareas</div>
            )}

            {/* Add task */}
            {adding.pid===proj.id && adding.col===activeCol ? (
              <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                <input autoFocus value={newText} onChange={e=>setNewText(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter') onAddTask(proj.id,activeCol); if(e.key==='Escape'){ setAdding({}); setNewText('') } }}
                  placeholder={t.newTask}
                  style={{ flex:1, border:'none', borderBottom:`1.5px solid ${accent}`, outline:'none', fontSize:'14px', padding:'6px 2px', background:'transparent' }}
                />
                <button onClick={()=>onAddTask(proj.id,activeCol)}
                  style={{ background:BRAND, color:'#fff', border:'none', borderRadius:'6px', padding:'6px 12px', cursor:'pointer', fontSize:'16px', fontWeight:'bold' }}>+</button>
              </div>
            ) : (
              <button onClick={()=>{ setAdding({pid:proj.id,col:activeCol}); setNewText('') }}
                style={{ marginTop:'8px', background:'none', border:'1px dashed #e5e5e5', borderRadius:'7px', color:'#bbb', cursor:'pointer', fontSize:'12px', padding:'7px 12px', width:'100%', textAlign:'left' }}>
                {t.addTask}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────
function KanvuuMain({ session, t, lang, setLang, onLogout }) {
  const token  = session.access_token
  const userId = session.user?.id
  const mobile = useIsMobile()

  const [projects, setProjects]     = useState([])
  const [tasks, setTasks]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [addProj, setAddProj]       = useState(false)
  const [projName, setProjName]     = useState('')
  const [adding, setAdding]         = useState({})
  const [newText, setNewText]       = useState('')
  const [editProj, setEditProj]     = useState(null)
  const [editVal, setEditVal]       = useState('')
  const [confirmDel, setConfirmDel] = useState(null)
  const [menuOpen, setMenuOpen]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ps, ts] = await Promise.all([
        db.select('projects','order=position.asc,created_at.asc',token),
        db.select('tasks','order=position.asc,created_at.asc',token),
      ])
      setProjects(Array.isArray(ps)?ps:[])
      setTasks(Array.isArray(ts)?ts:[])
    } catch(e) { console.error(e) }
    setLoading(false)
  }, [token])

  useEffect(()=>{ load() },[load])

  const addProject = async () => {
    if (!projName.trim()) return
    try {
      const res = await db.insert('projects',{user_id:userId,name:projName.trim(),color_idx:projects.length%ACCENTS.length,position:projects.length,open:true},token)
      const p = Array.isArray(res)?res[0]:res
      if (p) setProjects(ps=>[...ps,p])
    } catch(e) { console.error(e) }
    setProjName(''); setAddProj(false)
  }

  const toggleProject = async (pid) => {
    const p = projects.find(p=>p.id===pid)
    setProjects(ps=>ps.map(p=>p.id===pid?{...p,open:!p.open}:p))
    await db.update('projects',`id=eq.${pid}`,{open:!p.open},token).catch(console.error)
  }

  const deleteProject = async () => {
    await db.delete('projects',`id=eq.${confirmDel}`,token).catch(console.error)
    setProjects(ps=>ps.filter(p=>p.id!==confirmDel))
    setTasks(ts=>ts.filter(t=>t.project_id!==confirmDel))
    setConfirmDel(null)
  }

  const moveProjectUp = async (pid) => {
    const idx = projects.findIndex(p=>p.id===pid)
    if (idx <= 0) return
    const newProjects = [...projects]
    ;[newProjects[idx-1], newProjects[idx]] = [newProjects[idx], newProjects[idx-1]]
    setProjects(newProjects)
    await Promise.all([
      db.update('projects',`id=eq.${newProjects[idx-1].id}`,{position:idx-1},token),
      db.update('projects',`id=eq.${newProjects[idx].id}`,{position:idx},token),
    ]).catch(console.error)
  }

  const moveProjectDown = async (pid) => {
    const idx = projects.findIndex(p=>p.id===pid)
    if (idx >= projects.length-1) return
    const newProjects = [...projects]
    ;[newProjects[idx], newProjects[idx+1]] = [newProjects[idx+1], newProjects[idx]]
    setProjects(newProjects)
    await Promise.all([
      db.update('projects',`id=eq.${newProjects[idx].id}`,{position:idx},token),
      db.update('projects',`id=eq.${newProjects[idx+1].id}`,{position:idx+1},token),
    ]).catch(console.error)
  }

  const saveEditProj = async (pid) => {
    if (!editVal.trim()) { setEditProj(null); return }
    setProjects(ps=>ps.map(p=>p.id===pid?{...p,name:editVal.trim()}:p))
    await db.update('projects',`id=eq.${pid}`,{name:editVal.trim()},token).catch(console.error)
    setEditProj(null)
  }

  const addTask = async (pid, col) => {
    if (!newText.trim()) return
    const colTasks = tasks.filter(t=>t.project_id===pid&&t.status===col)
    try {
      const res = await db.insert('tasks',{user_id:userId,project_id:pid,text:newText.trim(),status:col,today:false,position:colTasks.length},token)
      const task = Array.isArray(res)?res[0]:res
      if (task) setTasks(ts=>[...ts,task])
    } catch(e) { console.error(e) }
    setNewText(''); setAdding({})
  }

  const moveTask = async (tid,s) => {
    const update = s==='done' ? {status:s,today:false} : {status:s}
    setTasks(ts=>ts.map(t=>t.id===tid?{...t,...update}:t))
    await db.update('tasks',`id=eq.${tid}`,update,token).catch(console.error)
  }
  const delTask   = async (tid)     => { setTasks(ts=>ts.filter(t=>t.id!==tid)); await db.delete('tasks',`id=eq.${tid}`,token).catch(console.error) }
  const todayTask = async (tid,cur) => {
    const newToday = !cur
    setTasks(ts => {
      const task = ts.find(t=>t.id===tid)
      const rest = ts.filter(t=>t.id!==tid)
      // If marking as today, move to top of its column within the project
      if (newToday) {
        const before = rest.filter(t=>!(t.project_id===task.project_id && t.status===task.status))
        const sameCol = rest.filter(t=>t.project_id===task.project_id && t.status===task.status)
        return [...before, {...task,today:newToday}, ...sameCol]
      }
      return ts.map(t=>t.id===tid?{...t,today:newToday}:t)
    })
    await db.update('tasks',`id=eq.${tid}`,{today:newToday},token).catch(console.error)
  }
  const handleLogout = async () => { await supaFetch('/auth/v1/logout',{method:'POST'},token).catch(()=>{}); onLogout() }

  const gToday = tasks.filter(t=>t.today&&t.status!=='done').length
  const gTodo  = tasks.filter(t=>t.status==='todo').length
  const gDoing = tasks.filter(t=>t.status==='doing').length
  const gDone  = tasks.filter(t=>t.status==='done').length
  const confirmingProj = confirmDel ? projects.find(p=>p.id===confirmDel) : null

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:"'SF Pro Text','Helvetica Neue',sans-serif", color:'#aaa', fontSize:'13px' }}>
      {t.loading}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background: mobile?'#f5f5f5':'#fff', fontFamily:"'SF Pro Text','Helvetica Neue',sans-serif", color:'#111', fontSize:'13px' }}>

      {/* Confirm delete modal */}
      {confirmDel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.25)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
          <div style={{ background:'#fff', borderRadius:'14px', padding:'24px', boxShadow:'0 8px 32px rgba(0,0,0,0.15)', maxWidth:'320px', width:'100%' }}>
            <div style={{ fontWeight:700, marginBottom:'8px', fontSize:'15px' }}>{t.deleteProject}</div>
            <div style={{ color:'#888', fontSize:'13px', marginBottom:'20px', lineHeight:'1.5' }}>
              {t.deleteMsg1} <strong>"{confirmingProj?.name}"</strong> {t.deleteMsg2}
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, background:'#f5f5f5', border:'none', borderRadius:'8px', padding:'11px', fontSize:'13px', cursor:'pointer', color:'#555', fontWeight:600 }}>{t.cancelDelete}</button>
              <button onClick={deleteProject} style={{ flex:1, background:'#dc2626', border:'none', borderRadius:'8px', padding:'11px', fontSize:'13px', cursor:'pointer', color:'#fff', fontWeight:700 }}>{t.confirmDelete}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: mobile?'12px 16px':'12px 24px', borderBottom:`2px solid ${BRAND}`, display:'flex', alignItems:'center', gap:'12px', background:'#fff', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <Logo size={mobile?24:28} />
          <span style={{ fontWeight:800, fontSize: mobile?'14px':'15px', letterSpacing:'-0.5px', color:BRAND }}>Kanvuu</span>
        </div>

        {/* Stats - scrollable on mobile */}
        <div style={{ display:'flex', gap: mobile?'12px':'16px', overflowX:'auto', flex:1, scrollbarWidth:'none' }}>
          {[{l:t.hoy,v:gToday,bold:true},{l:t.todo,v:gTodo},{l:t.doing,v:gDoing},{l:t.done,v:gDone}].map(x=>(
            <div key={x.l} style={{ display:'flex', alignItems:'baseline', gap:'3px', flexShrink:0 }}>
              <span style={{ fontWeight:x.bold?700:500, fontSize:x.bold?'14px':'13px', color:x.bold?BRAND:'#111' }}>{x.v}</span>
              <span style={{ color:'#aaa', fontSize:'10px', whiteSpace:'nowrap' }}>{x.l}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
          <button onClick={()=>setLang(l=>l==='es'?'en':'es')}
            style={{ background:'#f5f5f5', border:'none', borderRadius:'6px', padding:'5px 10px', fontSize:'11px', cursor:'pointer', fontWeight:600, color:'#555' }}>
            {lang==='es'?'EN':'ES'}
          </button>
          {mobile ? (
            <>
              <button onClick={()=>setAddProj(true)}
                style={{ background:BRAND, color:'#fff', border:'none', borderRadius:'6px', padding:'6px 12px', fontSize:'18px', cursor:'pointer', lineHeight:1, fontWeight:'bold' }}>+</button>
              <button onClick={()=>setMenuOpen(m=>!m)}
                style={{ background:'#f5f5f5', border:'none', borderRadius:'6px', padding:'6px 10px', fontSize:'14px', cursor:'pointer' }}>⋮</button>
              {menuOpen && (
                <div style={{ position:'absolute', top:'56px', right:'16px', background:'#fff', border:'1px solid #eee', borderRadius:'10px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', padding:'4px', zIndex:200, minWidth:'160px' }}>
                  <button onClick={()=>{ handleLogout(); setMenuOpen(false) }}
                    style={{ width:'100%', background:'none', border:'none', padding:'10px 14px', fontSize:'13px', cursor:'pointer', color:'#555', textAlign:'left', borderRadius:'7px' }}>
                    {t.logout}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <button onClick={()=>setAddProj(true)}
                style={{ background:BRAND, color:'#fff', border:'none', borderRadius:'6px', padding:'6px 13px', fontSize:'12px', cursor:'pointer' }}>
                {t.newProject}
              </button>
              <button onClick={handleLogout}
                style={{ background:'none', border:'1px solid #eee', borderRadius:'6px', padding:'5px 11px', fontSize:'11px', cursor:'pointer', color:'#888' }}>
                {t.logout}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add project bar */}
      {addProj && (
        <div style={{ padding: mobile?'12px 16px':'10px 24px', borderBottom:'1px solid #f0f0f0', display:'flex', gap:'8px', background:'#fff' }}>
          <input autoFocus value={projName} onChange={e=>setProjName(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') addProject(); if(e.key==='Escape') setAddProj(false) }}
            placeholder={t.projectName}
            style={{ flex:1, border:`1px solid ${BRAND}44`, borderRadius:'8px', padding:'9px 12px', fontSize:'14px', outline:'none' }}
          />
          <button onClick={addProject} style={{ background:BRAND, color:'#fff', border:'none', borderRadius:'8px', padding:'9px 16px', fontSize:'13px', cursor:'pointer', fontWeight:600 }}>{t.create}</button>
          <button onClick={()=>setAddProj(false)} style={{ background:'none', border:'none', color:'#bbb', fontSize:'18px', cursor:'pointer' }}>✕</button>
        </div>
      )}

      {/* Projects */}
      <div style={{ padding: mobile?'16px':'0' }}>
        {mobile ? (
          // Mobile: card layout
          projects.map(proj => {
            const accent = ACCENTS[proj.color_idx%ACCENTS.length]
            return (
              <MobileProjectCard key={proj.id}
                proj={proj} tasks={tasks} t={t} lang={lang} accent={accent}
                onToggle={()=>toggleProject(proj.id)}
                onDelete={()=>setConfirmDel(proj.id)}
                onMoveUp={()=>moveProjectUp(proj.id)}
                onMoveDown={()=>moveProjectDown(proj.id)}
                isFirst={pi===0} isLast={pi===projects.length-1}
                onEditStart={(p)=>{ setEditProj(p.id); setEditVal(p.name) }}
                editProj={editProj} editVal={editVal} setEditVal={setEditVal}
                onEditSave={saveEditProj}
                onEditCancel={()=>setEditProj(null)}
                adding={adding} setAdding={setAdding}
                newText={newText} setNewText={setNewText}
                onAddTask={addTask}
                onMoveTask={moveTask}
                onDelTask={delTask}
                onTodayTask={todayTask}
              />
            )
          })
        ) : (
          // Desktop: original table layout
          projects.map((proj,pi) => {
            const accent = ACCENTS[proj.color_idx%ACCENTS.length]
            const pTasks = tasks.filter(t=>t.project_id===proj.id)
            const todayN = pTasks.filter(t=>t.today&&t.status!=='done').length
            const doneN  = pTasks.filter(t=>t.status==='done').length
            const doingN = pTasks.filter(t=>t.status==='doing').length
            const todoN  = pTasks.filter(t=>t.status==='todo').length
            const pct    = pTasks.length ? Math.round(doneN/pTasks.length*100) : 0

            return (
              <div key={proj.id} style={{ borderBottom:'1px solid #ebebeb' }}>
                <div style={{ display:'flex', alignItems:'center', background:pi%2===0?'#fff':'#fafafa' }}>
                  <div onClick={()=>toggleProject(proj.id)}
                    style={{ flex:1, padding:'11px 0 11px 24px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', userSelect:'none', minWidth:0 }}>
                    <span style={{ fontSize:'9px', color:'#ccc', flexShrink:0 }}>{proj.open?'▼':'▶'}</span>
                    <div style={{ width:7, height:7, borderRadius:'50%', background:accent, flexShrink:0 }} />
                    {editProj===proj.id ? (
                      <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
                        onClick={e=>e.stopPropagation()}
                        onBlur={()=>saveEditProj(proj.id)}
                        onKeyDown={e=>{ if(e.key==='Enter') saveEditProj(proj.id); if(e.key==='Escape') setEditProj(null) }}
                        style={{ border:'none', borderBottom:`1.5px solid ${accent}`, outline:'none', fontSize:'13px', fontWeight:600, background:'transparent' }}
                      />
                    ) : (
                      <span onDoubleClick={e=>{ e.stopPropagation(); setEditProj(proj.id); setEditVal(proj.name) }}
                        style={{ fontWeight:600, fontSize:'13px' }}>{proj.name}</span>
                    )}
                    {!proj.open && (
                      <div style={{ display:'flex', gap:'6px', marginLeft:'4px' }}>
                        {todayN>0 && <Badge label={`${todayN} ${t.hoy.toLowerCase()}`} bg={`${BRAND}12`} color={BRAND} />}
                        {todoN>0  && <Badge label={`${todoN} ${t.todo.toLowerCase()}`}  bg="#f5f5f5" color="#777" />}
                        {doingN>0 && <Badge label={`${doingN} ${t.doing.toLowerCase()}`} bg="#fff7ed" color="#ea580c" />}
                        {doneN>0  && <Badge label={`${doneN} ${t.done.toLowerCase()}`}  bg="#f0fdf4" color="#16a34a" />}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'0 20px 0 12px', flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{ width:64, height:2, background:'#eee', borderRadius:2, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background:BRAND, transition:'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize:'11px', color:'#aaa', minWidth:'24px' }}>{pct}%</span>
                    </div>
                    <div style={{display:'flex',gap:'3px'}}>
                  <button onClick={()=>moveProjectUp(proj.id)} disabled={pi===0}
                    style={{background:'none',border:'1px solid #eee',borderRadius:'5px',color:pi===0?'#ddd':'#999',cursor:pi===0?'default':'pointer',fontSize:'11px',padding:'2px 7px',lineHeight:1.6}}>↑</button>
                  <button onClick={()=>moveProjectDown(proj.id)} disabled={pi===projects.length-1}
                    style={{background:'none',border:'1px solid #eee',borderRadius:'5px',color:pi===projects.length-1?'#ddd':'#999',cursor:pi===projects.length-1?'default':'pointer',fontSize:'11px',padding:'2px 7px',lineHeight:1.6}}>↓</button>
                  <button onClick={()=>setConfirmDel(proj.id)}
                    style={{background:'none',border:'1px solid #eee',borderRadius:'5px',color:'#bbb',cursor:'pointer',fontSize:'12px',padding:'2px 8px',lineHeight:1.6}}>✕</button>
                </div>
                  </div>
                </div>

                {proj.open && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'1px solid #f4f4f4' }}>
                    {COLS.map((col,ci) => {
                      const colTasks = pTasks.filter(t=>t.status===col.key)
                      const isAdd    = adding.pid===proj.id && adding.col===col.key
                      const label    = lang==='es'?col.es:col.en
                      return (
                        <div key={col.key} style={{ borderRight:ci<2?'1px solid #f4f4f4':'none', padding:'8px 12px 10px' }}>
                          <div style={{ display:'flex', gap:'5px', alignItems:'center', marginBottom:'6px' }}>
                            <span style={{ fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'1.5px', color:col.color }}>{label}</span>
                            <span style={{ fontSize:'11px', color:'#ccc' }}>{colTasks.length}</span>
                          </div>
                          {colTasks.map(task=>(
                            <TaskRow key={task.id} task={task} accent={accent} mobile={false}
                              onMove={s=>moveTask(task.id,s)}
                              onDelete={()=>delTask(task.id)}
                              onToday={()=>todayTask(task.id,task.today)}
                            />
                          ))}
                          {isAdd ? (
                            <div style={{ display:'flex', gap:'4px', marginTop:'4px' }}>
                              <input autoFocus value={newText} onChange={e=>setNewText(e.target.value)}
                                onKeyDown={e=>{ if(e.key==='Enter') addTask(proj.id,col.key); if(e.key==='Escape'){ setAdding({}); setNewText('') } }}
                                placeholder={t.newTask}
                                style={{ flex:1, border:'none', borderBottom:`1px solid ${accent}`, outline:'none', fontSize:'12px', padding:'4px 2px', background:'transparent' }}
                              />
                              <button onClick={()=>addTask(proj.id,col.key)}
                                style={{ background:'none', border:'none', color:accent, fontWeight:700, cursor:'pointer', fontSize:'14px' }}>+</button>
                            </div>
                          ) : (
                            <button onClick={()=>{ setAdding({pid:proj.id,col:col.key}); setNewText('') }}
                              style={{ background:'none', border:'none', color:'#ccc', cursor:'pointer', fontSize:'11px', padding:'3px 0', textAlign:'left', width:'100%' }}>
                              {t.addTask}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {projects.length===0 && !loading && (
        <div style={{ textAlign:'center', color:'#ccc', marginTop:'80px', fontSize:'14px', padding:'24px' }}>{t.noProjects}</div>
      )}
    </div>
  )
}

export default function KanvuuApp() {
  const [session, setSession] = useState(null)
  const [lang, setLang]       = useState('es')
  const t = T[lang]

  return session
    ? <KanvuuMain session={session} t={t} lang={lang} setLang={setLang} onLogout={()=>setSession(null)} />
    : <AuthScreen t={t} lang={lang} setLang={setLang} onLogin={setSession} />
}
