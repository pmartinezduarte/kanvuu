'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const SUPA_URL = 'https://pyyfurstwwhvpxrysilh.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eWZ1cnN0d3dodnB4cnlzaWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTE4NDEsImV4cCI6MjA5MzQ4Nzg0MX0.xOT5DnBXmLNGS7T1XgjwCh1m0yfDj8IwN3BucbcsKaI'
const BRAND   = '#166534'
const ACCENTS = ['#2563eb','#16a34a','#dc2626','#9333ea','#ea580c','#0891b2']
const COLS    = [
  { key:'todo',  en:'To do',       es:'Por hacer',  color:'#555'    },
  { key:'doing', en:'In progress', es:'En curso',   color:'#ea580c' },
  { key:'done',  en:'Done',        es:'Completado', color:'#16a34a' },
]
const T = {
  en:{
    tagline:'Your projects, always clear.', login:'Sign in', register:'Create account', logout:'Sign out',
    email:'Email', password:'Password', confirmPassword:'Confirm password', loginBtn:'Sign in', registerBtn:'Create account',
    switchToRegister:"Don't have an account? Create one", switchToLogin:'Already have an account? Sign in',
    newGroup:'+ Group', groupName:'Group name...', newProject:'+ Project', projectName:'Project name...',
    create:'Create', addTask:'+ task', newTask:'New task...',
    hoy:'Today', todo:'To do', doing:'In progress', done:'Done',
    deleteGroup:'Delete group?', deleteGroupMsg:'This will delete all projects and tasks inside.',
    deleteProject:'Delete project?', deleteMsg1:'This will delete', deleteMsg2:'and all its tasks.',
    confirmDelete:'Delete', cancelDelete:'Cancel',
    noGroups:'Create your first group →', loading:'Loading...', errorPassMatch:'Passwords do not match.',
    todayPanel:"Today's tasks", noToday:'No tasks for today.',
  },
  es:{
    tagline:'Tus proyectos, siempre claros.', login:'Iniciar sesión', register:'Crear cuenta', logout:'Cerrar sesión',
    email:'Correo electrónico', password:'Contraseña', confirmPassword:'Confirmar contraseña', loginBtn:'Entrar', registerBtn:'Crear cuenta',
    switchToRegister:'¿No tienes cuenta? Crea una', switchToLogin:'¿Ya tienes cuenta? Inicia sesión',
    newGroup:'+ Grupo', groupName:'Nombre del grupo...', newProject:'+ Proyecto', projectName:'Nombre del proyecto...',
    create:'Crear', addTask:'+ tarea', newTask:'Nueva tarea...',
    hoy:'Hoy', todo:'Por hacer', doing:'En curso', done:'Completado',
    deleteGroup:'¿Eliminar grupo?', deleteGroupMsg:'Se eliminarán todos los proyectos y tareas dentro.',
    deleteProject:'¿Eliminar proyecto?', deleteMsg1:'Se eliminará', deleteMsg2:'y todas sus tareas.',
    confirmDelete:'Eliminar', cancelDelete:'Cancelar',
    noGroups:'Crea tu primer grupo →', loading:'Cargando...', errorPassMatch:'Las contraseñas no coinciden.',
    todayPanel:'Tareas de hoy', noToday:'No hay tareas para hoy.',
  }
}

async function supaFetch(path, options={}, token=null) {
  const headers = { 'Content-Type':'application/json', 'apikey':SUPA_KEY, 'Authorization':`Bearer ${token||SUPA_KEY}`, ...(options.headers||{}) }
  const res  = await fetch(`${SUPA_URL}${path}`, {...options, headers})
  const text = await res.text()
  const json = text ? JSON.parse(text) : {}
  if (!res.ok) throw json
  return json
}
const db = {
  select: (t,q='',tok) => supaFetch(`/rest/v1/${t}?${q}`, {headers:{'Prefer':'return=representation'}}, tok),
  insert: (t,d,tok)    => supaFetch(`/rest/v1/${t}`,  {method:'POST', body:JSON.stringify(d), headers:{'Prefer':'return=representation'}}, tok),
  update: (t,m,d,tok)  => supaFetch(`/rest/v1/${t}?${m}`, {method:'PATCH', body:JSON.stringify(d), headers:{'Prefer':'return=representation'}}, tok),
  delete: (t,m,tok)    => supaFetch(`/rest/v1/${t}?${m}`, {method:'DELETE'}, tok),
}

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => { const c=()=>setM(window.innerWidth<700); c(); window.addEventListener('resize',c); return ()=>window.removeEventListener('resize',c) }, [])
  return m
}

function Logo({ size=28, white=false }) {
  const bg=white?'#fff':BRAND, fg=white?BRAND:'#fff'
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="11" fill={bg}/><rect x="13" y="10" width="5" height="28" rx="2.5" fill={fg}/><path d="M18 24 L35 10" stroke={fg} strokeWidth="5" strokeLinecap="round"/><path d="M18 24 L35 38" stroke={fg} strokeWidth="5" strokeLinecap="round"/></svg>
}
function Badge({ label, bg, color }) {
  return <span style={{fontSize:'10px',background:bg,color,borderRadius:'10px',padding:'1px 7px',fontWeight:500}}>{label}</span>
}

// ── Auth ──────────────────────────────────────────────────────
function AuthScreen({ t, onLogin, lang, setLang }) {
  const [mode,setMode]=useState('login'), [email,setEmail]=useState(''), [pass,setPass]=useState(''), [pass2,setPass2]=useState(''), [error,setError]=useState(''), [loading,setLoading]=useState(false)
  const submit = async () => {
    setError(''); setLoading(true)
    try {
      if (mode==='register') {
        if (pass!==pass2) { setError(t.errorPassMatch); setLoading(false); return }
        const r = await supaFetch('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password:pass})})
        if (r.access_token) { onLogin(r); setLoading(false); return }
        onLogin(await supaFetch('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password:pass})}))
      } else {
        onLogin(await supaFetch('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password:pass})}))
      }
    } catch(e) { setError(e.error_description||e.message||'Error. Intenta de nuevo.') }
    setLoading(false)
  }
  const inp = {width:'100%',border:'1px solid #e5e5e5',borderRadius:'10px',padding:'13px 14px',fontSize:'16px',outline:'none',marginBottom:'12px',boxSizing:'border-box',fontFamily:'inherit',WebkitAppearance:'none'}
  return (
    <div style={{minHeight:'100vh',background:'#fff',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:"'SF Pro Text','Helvetica Neue',sans-serif",padding:'24px'}}>
      <div style={{position:'fixed',top:16,right:16}}>
        <button onClick={()=>setLang(l=>l==='es'?'en':'es')} style={{background:'#f5f5f5',border:'none',borderRadius:'6px',padding:'6px 12px',fontSize:'12px',cursor:'pointer',fontWeight:600,color:'#555'}}>{lang==='es'?'EN':'ES'}</button>
      </div>
      <div style={{marginBottom:'36px',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:'14px'}}>
        <Logo size={60}/>
        <div><div style={{fontSize:'32px',fontWeight:'800',letterSpacing:'-1px',color:BRAND}}>Kanvuu</div><div style={{fontSize:'14px',color:'#aaa',marginTop:'4px'}}>{t.tagline}</div></div>
      </div>
      <div style={{width:'100%',maxWidth:'380px'}}>
        <div style={{marginBottom:'18px',fontSize:'15px',fontWeight:'600',color:'#111'}}>{mode==='login'?t.login:t.register}</div>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'10px',padding:'12px 14px',fontSize:'13px',color:'#dc2626',marginBottom:'16px'}}>{error}</div>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.email} type="email" style={inp}/>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder={t.password} type="password" onKeyDown={e=>{if(e.key==='Enter'&&mode==='login')submit()}} style={inp}/>
        {mode==='register' && <input value={pass2} onChange={e=>setPass2(e.target.value)} placeholder={t.confirmPassword} type="password" onKeyDown={e=>{if(e.key==='Enter')submit()}} style={inp}/>}
        <button onClick={submit} disabled={loading} style={{width:'100%',background:BRAND,color:'#fff',border:'none',borderRadius:'10px',padding:'14px',fontSize:'15px',fontWeight:'700',cursor:'pointer',opacity:loading?0.7:1,marginTop:'4px'}}>{loading?t.loading:(mode==='login'?t.loginBtn:t.registerBtn)}</button>
        <button onClick={()=>{setMode(m=>m==='login'?'register':'login');setError('')}} style={{width:'100%',background:'none',border:'none',color:'#888',fontSize:'13px',cursor:'pointer',marginTop:'16px',textDecoration:'underline',padding:'8px'}}>{mode==='login'?t.switchToRegister:t.switchToLogin}</button>
      </div>
    </div>
  )
}

// ── Task Card ─────────────────────────────────────────────────
function TaskCard({ task, accent, onMove, onDelete, onToday, onEdit, alwaysShow, dragHandlers }) {
  const [hov,setHov]=useState(false), [editing,setEditing]=useState(false), [val,setVal]=useState(task.text)
  const isDone=task.status==='done', isToday=task.today&&!isDone, show=hov||alwaysShow
  const commit=()=>{ if(val.trim()) onEdit(val.trim()); setEditing(false) }
  return (
    <div {...(dragHandlers||{})} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 4px',borderRadius:'7px',background:hov?'#f7f7f7':'transparent',transition:'background 0.1s',cursor:'grab'}}>
      <span style={{color:'#ccc',fontSize:'11px',flexShrink:0,lineHeight:1}}>⠿</span>
      {show&&!isDone&&(
        <div style={{display:'flex',gap:'1px',flexShrink:0}}>
          {task.status!=='todo'&&<button onClick={()=>onMove(task.status==='doing'?'todo':'doing')} style={{background:'none',border:'none',color:'#bbb',cursor:'pointer',fontSize:'11px',padding:'1px 3px'}}>←</button>}
          {task.status!=='done'&&<button onClick={()=>onMove(task.status==='todo'?'doing':'done')} style={{background:'none',border:'none',color:accent,cursor:'pointer',fontSize:'11px',padding:'1px 3px'}}>→</button>}
        </div>
      )}
      {!isDone&&<button onClick={onToday} style={{flexShrink:0,cursor:'pointer',border:'none',borderRadius:'4px',padding:'2px 5px',fontSize:'9px',fontWeight:700,background:isToday?`${BRAND}18`:'#f0f0f0',color:isToday?BRAND:'#ccc',lineHeight:'16px'}}>HOY</button>}
      {editing ? (
        <input autoFocus value={val} onChange={e=>setVal(e.target.value)} onBlur={commit} onClick={e=>e.stopPropagation()}
          onKeyDown={e=>{if(e.key==='Enter')commit();if(e.key==='Escape'){setVal(task.text);setEditing(false)}}}
          style={{flex:1,border:'none',borderBottom:`1px solid ${accent}`,outline:'none',fontSize:'12px',padding:'2px',background:'transparent'}}/>
      ) : (
        <span onDoubleClick={()=>{if(!isDone){setEditing(true);setVal(task.text)}}}
          style={{flex:1,fontSize:'12px',lineHeight:'1.4',color:isDone?'#bbb':'#222',textDecoration:isDone?'line-through':'none',fontWeight:isToday?600:400,cursor:'text'}}>
          {task.text}
        </span>
      )}
      {show&&<button onClick={onDelete} style={{background:'none',border:'none',color:'#ddd',cursor:'pointer',fontSize:'11px',padding:'1px 3px',flexShrink:0}}>✕</button>}
    </div>
  )
}

// ── Today Panel ───────────────────────────────────────────────
function TodayPanel({ groups, projects, tasks, t, onClose, onToggleToday, onMoveTask }) {
  const todayTasks = tasks.filter(t=>t.today&&t.status!=='done')
  const [order, setOrder] = useState(todayTasks.map(t=>t.id))
  const dragId = useRef(null)
  const [dragOver, setDragOver] = useState(null)

  const sorted = [...todayTasks].sort((a,b)=>{
    const ia=order.indexOf(a.id), ib=order.indexOf(b.id)
    if(ia===-1&&ib===-1) return 0; if(ia===-1) return 1; if(ib===-1) return -1; return ia-ib
  })

  const getProj  = pid => projects.find(p=>p.id===pid)
  const getGroup = gid => groups.find(g=>g.id===gid)

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.2)',zIndex:999,display:'flex',alignItems:'flex-start',justifyContent:'flex-end',padding:'56px 16px 16px'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:'14px',boxShadow:'0 8px 40px rgba(0,0,0,0.15)',width:'100%',maxWidth:'400px',overflow:'hidden'}}>
        <div style={{padding:'16px 20px 12px',borderBottom:'1px solid #f0f0f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div><div style={{fontWeight:700,fontSize:'15px'}}>{t.todayPanel}</div><div style={{fontSize:'11px',color:'#aaa',marginTop:'2px'}}>{sorted.length} tareas · arrastra ⠿ para reordenar</div></div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#bbb',cursor:'pointer',fontSize:'18px'}}>✕</button>
        </div>
        <div style={{maxHeight:'65vh',overflowY:'auto',padding:'12px 16px'}}>
          {sorted.length===0&&<div style={{color:'#ccc',fontSize:'13px',padding:'20px 0',textAlign:'center'}}>{t.noToday}</div>}
          {sorted.map((task,i)=>{
            const proj  = getProj(task.project_id)
            const group = proj ? getGroup(proj.group_id) : null
            const acc   = proj ? ACCENTS[proj.color_idx%ACCENTS.length] : BRAND
            const isOver = dragOver===task.id
            return (
              <div key={task.id}
                draggable
                onDragStart={()=>{ dragId.current=task.id }}
                onDragOver={e=>{ e.preventDefault(); if(dragId.current&&dragId.current!==task.id) setDragOver(task.id) }}
                onDrop={e=>{ e.preventDefault(); if(!dragId.current||dragId.current===task.id){setDragOver(null);return}
                  const full=[...new Set([...order,...sorted.map(t=>t.id)])]
                  const fi=full.indexOf(dragId.current), ti=full.indexOf(task.id)
                  if(fi===-1||ti===-1){setDragOver(null);return}
                  const next=[...full]; next.splice(fi,1); next.splice(ti,0,dragId.current)
                  setOrder(next); dragId.current=null; setDragOver(null)
                }}
                style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'10px',
                  background:'#fafafa',marginBottom:'6px',cursor:'grab',
                  borderTop:isOver?`2px solid ${acc}`:'1px solid #f0f0f0',border:'1px solid #f0f0f0',transition:'border 0.1s'}}>
                <div style={{width:24,height:24,borderRadius:'7px',background:`${acc}15`,color:acc,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:800,flexShrink:0}}>{i+1}</div>
                <span style={{color:'#ccc',fontSize:'13px',flexShrink:0}}>⠿</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',gap:'4px',marginBottom:'2px',alignItems:'center',flexWrap:'wrap'}}>
                    {group&&<span style={{fontSize:'9px',color:'#bbb',fontWeight:600,textTransform:'uppercase'}}>{group.name}</span>}
                    {group&&proj&&<span style={{fontSize:'9px',color:'#ccc'}}>›</span>}
                    {proj&&<span style={{fontSize:'9px',color:acc,fontWeight:600}}>{proj.name}</span>}
                  </div>
                  <div style={{fontSize:'13px',color:'#222',fontWeight:600}}>{task.text}</div>
                  <div style={{fontSize:'10px',color:COLS.find(c=>c.key===task.status)?.color,marginTop:'2px',fontWeight:500}}>{COLS.find(c=>c.key===task.status)?.label}</div>
                </div>
                <div style={{display:'flex',gap:'4px',flexShrink:0}}>
                  {task.status!=='done'&&<button onClick={()=>onMoveTask(task.id,task.status==='todo'?'doing':'done')} style={{background:`${acc}15`,border:'none',borderRadius:'5px',color:acc,cursor:'pointer',fontSize:'11px',padding:'3px 8px',fontWeight:600}}>→</button>}
                  <button onClick={()=>onToggleToday(task.id)} style={{background:`${BRAND}12`,border:'none',borderRadius:'5px',color:BRAND,cursor:'pointer',fontSize:'9px',fontWeight:700,padding:'3px 7px'}}>HOY</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Mobile Project Card ───────────────────────────────────────
function MobileProjectCard({ proj, tasks, t, lang, accent, isFirst, isLast, onToggle, onDelete, onMoveUp, onMoveDown, editProj, editVal, setEditVal, onEditStart, onEditSave, onEditCancel, adding, setAdding, newText, setNewText, onAddTask, onMoveTask, onDelTask, onTodayTask, onEditTask }) {
  const [activeCol, setActiveCol] = useState('todo')
  const pTasks=tasks.filter(tk=>tk.project_id===proj.id)
  const todayN=pTasks.filter(t=>t.today&&t.status!=='done').length
  const doneN=pTasks.filter(t=>t.status==='done').length
  const doingN=pTasks.filter(t=>t.status==='doing').length
  const todoN=pTasks.filter(t=>t.status==='todo').length
  const pct=pTasks.length?Math.round(doneN/pTasks.length*100):0
  return (
    <div style={{background:'#fff',border:'1px solid #e8e8e8',borderLeft:`3px solid ${accent}`,borderRadius:'12px',overflow:'hidden',marginBottom:'12px'}}>
      <div style={{padding:'12px 14px',display:'flex',alignItems:'center',gap:'8px'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'3px',flexShrink:0}}>
          <button onClick={onMoveUp} disabled={isFirst} style={{background:'none',border:'1px solid #eee',borderRadius:'4px',color:isFirst?'#eee':'#999',cursor:isFirst?'default':'pointer',fontSize:'10px',padding:'1px 6px',lineHeight:1.5}}>↑</button>
          <button onClick={onMoveDown} disabled={isLast} style={{background:'none',border:'1px solid #eee',borderRadius:'4px',color:isLast?'#eee':'#999',cursor:isLast?'default':'pointer',fontSize:'10px',padding:'1px 6px',lineHeight:1.5}}>↓</button>
        </div>
        <div onClick={onToggle} style={{display:'flex',alignItems:'center',gap:'7px',flex:1,cursor:'pointer',userSelect:'none',minWidth:0}}>
          <span style={{fontSize:'10px',color:'#ccc',flexShrink:0}}>{proj.open?'▼':'▶'}</span>
          {editProj===proj.id?(
            <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onClick={e=>e.stopPropagation()} onBlur={()=>onEditSave(proj.id)} onKeyDown={e=>{if(e.key==='Enter')onEditSave(proj.id);if(e.key==='Escape')onEditCancel()}} style={{border:'none',borderBottom:`1.5px solid ${accent}`,outline:'none',fontSize:'14px',fontWeight:700,background:'transparent',flex:1,minWidth:0}}/>
          ):(
            <span onDoubleClick={e=>{e.stopPropagation();onEditStart(proj)}} style={{fontWeight:700,fontSize:'14px',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{proj.name}</span>
          )}
        </div>
        {todayN>0&&<Badge label={`${todayN} hoy`} bg={`${BRAND}12`} color={BRAND}/>}
        <button onClick={onDelete} style={{background:'none',border:'1px solid #eee',borderRadius:'5px',color:'#bbb',cursor:'pointer',fontSize:'12px',padding:'2px 7px',lineHeight:1.6,flexShrink:0}}>✕</button>
      </div>
      <div style={{padding:'0 14px 10px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{flex:1,height:3,background:'#eee',borderRadius:3,overflow:'hidden'}}><div style={{width:`${pct}%`,height:'100%',background:BRAND,transition:'width 0.3s'}}/></div>
          <span style={{fontSize:'11px',color:'#aaa'}}>{pct}%</span>
        </div>
        <div style={{display:'flex',gap:'6px',marginTop:'6px',flexWrap:'wrap'}}>
          {todoN>0&&<Badge label={`${todoN} por hacer`} bg="#f5f5f5" color="#777"/>}
          {doingN>0&&<Badge label={`${doingN} en curso`} bg="#fff7ed" color="#ea580c"/>}
          {doneN>0&&<Badge label={`${doneN} listo`} bg="#f0fdf4" color="#16a34a"/>}
        </div>
      </div>
      {proj.open&&(
        <div style={{borderTop:'1px solid #f4f4f4'}}>
          <div style={{display:'flex',borderBottom:'1px solid #f4f4f4'}}>
            {COLS.map(col=>(
              <button key={col.key} onClick={()=>setActiveCol(col.key)} style={{flex:1,padding:'9px 4px',border:'none',cursor:'pointer',background:activeCol===col.key?'#fff':'#fafafa',borderBottom:activeCol===col.key?`2px solid ${col.color}`:'2px solid transparent',fontSize:'10px',fontWeight:600,textTransform:'uppercase',letterSpacing:'1px',color:activeCol===col.key?col.color:'#bbb'}}>
                {lang==='es'?col.es:col.en}{pTasks.filter(tk=>tk.status===col.key).length>0?` (${pTasks.filter(tk=>tk.status===col.key).length})`:''}
              </button>
            ))}
          </div>
          <div style={{padding:'10px 14px 12px'}}>
            {pTasks.filter(tk=>tk.status===activeCol).map(task=>(
              <TaskCard key={task.id} task={task} accent={accent} alwaysShow={true}
                onMove={s=>onMoveTask(task.id,s)} onDelete={()=>onDelTask(task.id)}
                onToday={()=>onTodayTask(task.id,task.today)} onEdit={text=>onEditTask(task.id,text)}/>
            ))}
            {pTasks.filter(tk=>tk.status===activeCol).length===0&&<div style={{color:'#ddd',fontSize:'12px',padding:'8px 0'}}>Sin tareas</div>}
            {adding.pid===proj.id&&adding.col===activeCol?(
              <div style={{display:'flex',gap:'8px',marginTop:'8px'}}>
                <input autoFocus value={newText} onChange={e=>setNewText(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter')onAddTask(proj.id,activeCol);if(e.key==='Escape'){setAdding({});setNewText('')}}}
                  placeholder="Nueva tarea…" style={{flex:1,border:'none',borderBottom:`1.5px solid ${accent}`,outline:'none',fontSize:'14px',padding:'6px 2px',background:'transparent'}}/>
                <button onClick={()=>onAddTask(proj.id,activeCol)} style={{background:BRAND,color:'#fff',border:'none',borderRadius:'6px',padding:'6px 14px',cursor:'pointer',fontSize:'16px',fontWeight:'bold'}}>+</button>
              </div>
            ):(
              <button onClick={()=>{setAdding({pid:proj.id,col:activeCol});setNewText('')}} style={{marginTop:'8px',background:'none',border:'1px dashed #e5e5e5',borderRadius:'7px',color:'#bbb',cursor:'pointer',fontSize:'12px',padding:'7px 12px',width:'100%',textAlign:'left'}}>+ tarea</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────
function KanvuuMain({ session, t, lang, setLang, onLogout }) {
  const token=session.access_token, userId=session.user?.id, mobile=useIsMobile()
  const [groups,setGroups]=useState([])
  const [projects,setProjects]=useState([])
  const [tasks,setTasks]=useState([])
  const [loading,setLoading]=useState(true)
  const [showToday,setShowToday]=useState(false)
  const [addingGroup,setAddingGroup]=useState(false)
  const [groupName,setGroupName]=useState('')
  const [addingProj,setAddingProj]=useState(null)
  const [projName,setProjName]=useState('')
  const [addingTask,setAddingTask]=useState({})
  const [newText,setNewText]=useState('')
  const [editingProj,setEditingProj]=useState(null)
  const [editingGroup,setEditingGroup]=useState(null)
  const [editVal,setEditVal]=useState('')
  const [confirmDel,setConfirmDel]=useState(null)
  const [menuOpen,setMenuOpen]=useState(false)
  const dragRef=useRef(null)
  const [dragOver,setDragOver]=useState(null)

  const load = useCallback(async()=>{
    setLoading(true)
    try {
      const [gs,ps,ts] = await Promise.all([
        db.select('groups','order=position.asc,created_at.asc',token),
        db.select('projects','order=position.asc,created_at.asc',token),
        db.select('tasks','order=position.asc,created_at.asc',token),
      ])
      setGroups(Array.isArray(gs)?gs:[])
      setProjects(Array.isArray(ps)?ps:[])
      setTasks(Array.isArray(ts)?ts:[])
    } catch(e){console.error(e)}
    setLoading(false)
  },[token])
  useEffect(()=>{load()},[load])

  // ── Group ops ──
  const addGroup = async()=>{
    if(!groupName.trim()) return
    try { const res=await db.insert('groups',{user_id:userId,name:groupName.trim(),position:groups.length,open:true},token); const g=Array.isArray(res)?res[0]:res; if(g) setGroups(gs=>[...gs,g]) } catch(e){console.error(e)}
    setGroupName(''); setAddingGroup(false)
  }
  const toggleGroup = async(gid)=>{ const g=groups.find(g=>g.id===gid); setGroups(gs=>gs.map(g=>g.id===gid?{...g,open:!g.open}:g)); await db.update('groups',`id=eq.${gid}`,{open:!g.open},token).catch(console.error) }
  const deleteGroup = async()=>{
    const gid=confirmDel.id
    await db.delete('groups',`id=eq.${gid}`,token).catch(console.error)
    setGroups(gs=>gs.filter(g=>g.id!==gid))
    const pids=projects.filter(p=>p.group_id===gid).map(p=>p.id)
    setProjects(ps=>ps.filter(p=>p.group_id!==gid))
    setTasks(ts=>ts.filter(t=>!pids.includes(t.project_id)))
    setConfirmDel(null)
  }
  const saveEditGroup = async(gid)=>{ if(!editVal.trim()){setEditingGroup(null);return}; setGroups(gs=>gs.map(g=>g.id===gid?{...g,name:editVal.trim()}:g)); await db.update('groups',`id=eq.${gid}`,{name:editVal.trim()},token).catch(console.error); setEditingGroup(null) }

  // ── Project ops ──
  const addProject = async(gid)=>{
    if(!projName.trim()) return
    const ps=projects.filter(p=>p.group_id===gid)
    try { const res=await db.insert('projects',{user_id:userId,group_id:gid,name:projName.trim(),color_idx:ps.length%ACCENTS.length,position:ps.length,open:true},token); const p=Array.isArray(res)?res[0]:res; if(p) setProjects(ps=>[...ps,p]) } catch(e){console.error(e)}
    setProjName(''); setAddingProj(null)
  }
  const toggleProject = async(pid)=>{ const p=projects.find(p=>p.id===pid); setProjects(ps=>ps.map(p=>p.id===pid?{...p,open:!p.open}:p)); await db.update('projects',`id=eq.${pid}`,{open:!p.open},token).catch(console.error) }
  const deleteProject = async()=>{
    const pid=confirmDel.id
    await db.delete('projects',`id=eq.${pid}`,token).catch(console.error)
    setProjects(ps=>ps.filter(p=>p.id!==pid)); setTasks(ts=>ts.filter(t=>t.project_id!==pid)); setConfirmDel(null)
  }
  const saveEditProj = async(pid)=>{ if(!editVal.trim()){setEditingProj(null);return}; setProjects(ps=>ps.map(p=>p.id===pid?{...p,name:editVal.trim()}:p)); await db.update('projects',`id=eq.${pid}`,{name:editVal.trim()},token).catch(console.error); setEditingProj(null) }
  const moveProjUp = async(pid)=>{
    const gid=projects.find(p=>p.id===pid)?.group_id
    const gps=projects.filter(p=>p.group_id===gid); const idx=gps.findIndex(p=>p.id===pid); if(idx<=0) return
    const np=[...gps]; [np[idx-1],np[idx]]=[np[idx],np[idx-1]]
    setProjects(ps=>ps.map(p=>{ const f=np.find(n=>n.id===p.id); return f?{...p,position:np.indexOf(f)}:p }))
    await Promise.all([db.update('projects',`id=eq.${np[idx-1].id}`,{position:idx-1},token),db.update('projects',`id=eq.${np[idx].id}`,{position:idx},token)]).catch(console.error)
  }
  const moveProjDown = async(pid)=>{
    const gid=projects.find(p=>p.id===pid)?.group_id
    const gps=projects.filter(p=>p.group_id===gid); const idx=gps.findIndex(p=>p.id===pid); if(idx>=gps.length-1) return
    const np=[...gps]; [np[idx],np[idx+1]]=[np[idx+1],np[idx]]
    setProjects(ps=>ps.map(p=>{ const f=np.find(n=>n.id===p.id); return f?{...p,position:np.indexOf(f)}:p }))
    await Promise.all([db.update('projects',`id=eq.${np[idx].id}`,{position:idx},token),db.update('projects',`id=eq.${np[idx+1].id}`,{position:idx+1},token)]).catch(console.error)
  }

  // ── Task ops ──
  const addTask = async(pid,col)=>{
    if(!newText.trim()) return
    try { const res=await db.insert('tasks',{user_id:userId,project_id:pid,text:newText.trim(),status:col,today:false,position:tasks.filter(t=>t.project_id===pid&&t.status===col).length},token); const tk=Array.isArray(res)?res[0]:res; if(tk) setTasks(ts=>[...ts,tk]) } catch(e){console.error(e)}
    setNewText(''); setAddingTask({})
  }
  const moveTask = async(tid,s)=>{
    const upd=s==='done'?{status:s,today:false}:{status:s}
    setTasks(ts=>ts.map(t=>t.id===tid?{...t,...upd}:t)); await db.update('tasks',`id=eq.${tid}`,upd,token).catch(console.error)
  }
  const delTask = async(tid)=>{ setTasks(ts=>ts.filter(t=>t.id!==tid)); await db.delete('tasks',`id=eq.${tid}`,token).catch(console.error) }
  const todayTask = async(tid,cur)=>{
    const nv=!cur
    setTasks(ts=>{ const tk=ts.find(t=>t.id===tid); if(!tk) return ts
      if(nv){ const rest=ts.filter(t=>t.id!==tid); const before=rest.filter(t=>!(t.project_id===tk.project_id&&t.status===tk.status)); const same=rest.filter(t=>t.project_id===tk.project_id&&t.status===tk.status); return [...before,{...tk,today:nv},...same] }
      return ts.map(t=>t.id===tid?{...t,today:nv}:t) })
    await db.update('tasks',`id=eq.${tid}`,{today:nv},token).catch(console.error)
  }
  const editTask = async(tid,text)=>{ setTasks(ts=>ts.map(t=>t.id===tid?{...t,text}:t)); await db.update('tasks',`id=eq.${tid}`,{text},token).catch(console.error) }

  // Today panel helpers
  const findTask = tid => tasks.find(t=>t.id===tid)
  const toggleTodayById = tid=>{ const t=findTask(tid); if(t) todayTask(tid,t.today) }
  const moveTodayById   = (tid,s)=>moveTask(tid,s)

  // ── Drag & Drop ──
  const handleDragStart=(tid,pid,status)=>{ dragRef.current={tid,pid,status} }
  const handleDragOverTask=(targetId,tPid,tStatus)=>{ if(!dragRef.current||dragRef.current.tid===targetId) return; setDragOver(targetId) }
  const handleDragOverCol=(col,pid)=>{ if(!dragRef.current) return; setDragOver(`col:${pid}:${col}`) }
  const handleDropOnTask=(targetId,tPid,tStatus)=>{
    setDragOver(null); if(!dragRef.current) return
    const {tid,pid,status}=dragRef.current; dragRef.current=null
    if(pid===tPid){
      if(status===tStatus){
        setTasks(ts=>{ const arr=[...ts]; const fi=arr.findIndex(t=>t.id===tid); const ti=arr.findIndex(t=>t.id===targetId); if(fi===-1||ti===-1) return ts; const [m]=arr.splice(fi,1); arr.splice(ti,0,m); return arr })
      } else { moveTask(tid,tStatus) }
    }
  }
  const handleDropOnCol=(col,pid)=>{
    setDragOver(null); if(!dragRef.current) return
    const {tid}=dragRef.current; dragRef.current=null
    moveTask(tid,col)
  }

  const handleLogout=async()=>{ await supaFetch('/auth/v1/logout',{method:'POST'},token).catch(()=>{}); onLogout() }

  const allTasks=tasks, gToday=allTasks.filter(t=>t.today&&t.status!=='done').length
  const gTodo=allTasks.filter(t=>t.status==='todo').length, gDoing=allTasks.filter(t=>t.status==='doing').length, gDone=allTasks.filter(t=>t.status==='done').length

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:"'SF Pro Text','Helvetica Neue',sans-serif",color:'#aaa',fontSize:'13px'}}>{t.loading}</div>

  return (
    <div style={{minHeight:'100vh',background:mobile?'#f5f5f5':'#fff',fontFamily:"'SF Pro Text','Helvetica Neue',sans-serif",color:'#111',fontSize:'13px'}}>

      {showToday&&<TodayPanel groups={groups} projects={projects} tasks={tasks} t={t} onClose={()=>setShowToday(false)} onToggleToday={toggleTodayById} onMoveTask={moveTodayById}/>}

      {/* Confirm delete */}
      {confirmDel&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',zIndex:998,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:'#fff',borderRadius:'14px',padding:'24px',boxShadow:'0 8px 32px rgba(0,0,0,0.15)',maxWidth:'320px',width:'100%'}}>
            <div style={{fontWeight:700,marginBottom:'8px',fontSize:'15px'}}>{confirmDel.type==='group'?t.deleteGroup:t.deleteProject}</div>
            <div style={{color:'#888',fontSize:'13px',marginBottom:'20px',lineHeight:'1.5'}}>
              {confirmDel.type==='group'?t.deleteGroupMsg:<>{t.deleteMsg1} <strong>"{confirmDel.name}"</strong> {t.deleteMsg2}</>}
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={()=>setConfirmDel(null)} style={{flex:1,background:'#f5f5f5',border:'none',borderRadius:'8px',padding:'11px',fontSize:'13px',cursor:'pointer',color:'#555',fontWeight:600}}>{t.cancelDelete}</button>
              <button onClick={confirmDel.type==='group'?deleteGroup:deleteProject} style={{flex:1,background:'#dc2626',border:'none',borderRadius:'8px',padding:'11px',fontSize:'13px',cursor:'pointer',color:'#fff',fontWeight:700}}>{t.confirmDelete}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{padding:mobile?'12px 16px':'12px 24px',borderBottom:`2px solid ${BRAND}`,display:'flex',alignItems:'center',gap:'12px',background:'#fff',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
          <Logo size={mobile?22:26}/><span style={{fontWeight:800,fontSize:mobile?'13px':'15px',letterSpacing:'-0.5px',color:BRAND}}>Kanvuu</span>
        </div>
        <div style={{display:'flex',gap:mobile?'10px':'16px',overflowX:'auto',flex:1,scrollbarWidth:'none'}}>
          <button onClick={()=>setShowToday(true)} style={{display:'flex',alignItems:'baseline',gap:'3px',background:'none',border:'none',cursor:'pointer',padding:0,flexShrink:0}}>
            <span style={{fontWeight:700,fontSize:'14px',color:BRAND}}>{gToday}</span>
            <span style={{color:BRAND,fontSize:'10px',textDecoration:'underline',textDecorationColor:`${BRAND}66`,whiteSpace:'nowrap'}}>{t.hoy}</span>
          </button>
          {[{l:t.todo,v:gTodo},{l:t.doing,v:gDoing},{l:t.done,v:gDone}].map(x=>(
            <div key={x.l} style={{display:'flex',alignItems:'baseline',gap:'3px',flexShrink:0}}>
              <span style={{fontWeight:500,fontSize:'13px'}}>{x.v}</span><span style={{color:'#aaa',fontSize:'10px',whiteSpace:'nowrap'}}>{x.l}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:'6px',flexShrink:0}}>
          <button onClick={()=>setLang(l=>l==='es'?'en':'es')} style={{background:'#f5f5f5',border:'none',borderRadius:'6px',padding:'5px 9px',fontSize:'11px',cursor:'pointer',fontWeight:600,color:'#555'}}>{lang==='es'?'EN':'ES'}</button>
          {mobile?(
            <div style={{position:'relative',display:'flex',gap:'4px'}}>
              <button onClick={()=>setAddingGroup(true)} style={{background:BRAND,color:'#fff',border:'none',borderRadius:'6px',padding:'6px 12px',fontSize:'16px',cursor:'pointer',lineHeight:1,fontWeight:'bold'}}>+</button>
              <button onClick={()=>setMenuOpen(m=>!m)} style={{background:'#f5f5f5',border:'none',borderRadius:'6px',padding:'6px 10px',fontSize:'14px',cursor:'pointer'}}>⋮</button>
              {menuOpen&&<div style={{position:'fixed',top:'56px',right:'16px',background:'#fff',border:'1px solid #eee',borderRadius:'10px',boxShadow:'0 4px 20px rgba(0,0,0,0.12)',padding:'4px',zIndex:200,minWidth:'160px'}}>
                <button onClick={()=>{handleLogout();setMenuOpen(false)}} style={{width:'100%',background:'none',border:'none',padding:'10px 14px',fontSize:'13px',cursor:'pointer',color:'#555',textAlign:'left',borderRadius:'7px'}}>{t.logout}</button>
              </div>}
            </div>
          ):(
            <>
              <button onClick={()=>setAddingGroup(true)} style={{background:BRAND,color:'#fff',border:'none',borderRadius:'6px',padding:'6px 13px',fontSize:'12px',cursor:'pointer',fontWeight:600}}>{t.newGroup}</button>
              <button onClick={handleLogout} style={{background:'none',border:'1px solid #eee',borderRadius:'6px',padding:'5px 11px',fontSize:'11px',cursor:'pointer',color:'#888'}}>{t.logout}</button>
            </>
          )}
        </div>
      </div>

      {addingGroup&&(
        <div style={{padding:mobile?'12px 16px':'10px 24px',borderBottom:'1px solid #f0f0f0',display:'flex',gap:'8px',background:'#fff'}}>
          <input autoFocus value={groupName} onChange={e=>setGroupName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addGroup();if(e.key==='Escape')setAddingGroup(false)}} placeholder={t.groupName} style={{flex:1,border:`1px solid ${BRAND}44`,borderRadius:'8px',padding:'9px 12px',fontSize:'14px',outline:'none'}}/>
          <button onClick={addGroup} style={{background:BRAND,color:'#fff',border:'none',borderRadius:'8px',padding:'9px 14px',fontSize:'13px',cursor:'pointer',fontWeight:600}}>{t.create}</button>
          <button onClick={()=>setAddingGroup(false)} style={{background:'none',border:'none',color:'#bbb',fontSize:'18px',cursor:'pointer'}}>✕</button>
        </div>
      )}

      {/* Groups */}
      {groups.map(group=>{
        const gProjects=projects.filter(p=>p.group_id===group.id)
        const gTasks=tasks.filter(t=>gProjects.some(p=>p.id===t.project_id))
        const gTodayN=gTasks.filter(t=>t.today&&t.status!=='done').length

        return (
          <div key={group.id}>
            {/* Group header */}
            <div style={{display:'flex',alignItems:'center',padding:mobile?'10px 16px 8px':'10px 24px 8px',background:'#f8f8f8',borderBottom:'1px solid #ebebeb',borderTop:'2px solid #e8e8e8',gap:'8px'}}>
              <button onClick={()=>toggleGroup(group.id)} style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',alignItems:'center',gap:'8px',flex:1,userSelect:'none'}}>
                <span style={{fontSize:'9px',color:'#aaa'}}>{group.open?'▼':'▶'}</span>
                <svg width="15" height="13" viewBox="0 0 15 13" fill="none"><path d="M0 2a2 2 0 012-2h3.2a1 1 0 01.7.3L7 1.4H13a2 2 0 012 2v7a2 2 0 01-2 2H2a2 2 0 01-2-2V2z" fill={BRAND} opacity="0.25"/><path d="M0 4h15v6a2 2 0 01-2 2H2a2 2 0 01-2-2V4z" fill={BRAND} opacity="0.55"/></svg>
                {editingGroup===group.id?(
                  <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onClick={e=>e.stopPropagation()} onBlur={()=>saveEditGroup(group.id)} onKeyDown={e=>{if(e.key==='Enter')saveEditGroup(group.id);if(e.key==='Escape')setEditingGroup(null)}} style={{border:'none',borderBottom:`1.5px solid ${BRAND}`,outline:'none',fontSize:'13px',fontWeight:700,background:'transparent'}}/>
                ):(
                  <span onDoubleClick={e=>{e.stopPropagation();setEditingGroup(group.id);setEditVal(group.name)}} style={{fontWeight:700,fontSize:'13px',color:'#333'}}>{group.name}</span>
                )}
                <span style={{fontSize:'11px',color:'#bbb',marginLeft:'2px'}}>{gProjects.length} proyecto{gProjects.length!==1?'s':''}</span>
                {gTodayN>0&&<Badge label={`${gTodayN} hoy`} bg={`${BRAND}12`} color={BRAND}/>}
              </button>
              {!mobile&&<button onClick={()=>{setAddingProj(group.id);setProjName('')}} style={{background:'none',border:'1px solid #ddd',borderRadius:'5px',color:'#888',cursor:'pointer',fontSize:'11px',padding:'2px 9px',lineHeight:1.6}}>{t.newProject}</button>}
              <button onClick={()=>setConfirmDel({type:'group',id:group.id,name:group.name})} style={{background:'none',border:'none',color:'#ccc',cursor:'pointer',fontSize:'13px',padding:'0 4px'}}>✕</button>
            </div>

            {addingProj===group.id&&(
              <div style={{padding:mobile?'8px 16px':'8px 24px 8px 40px',borderBottom:'1px solid #f0f0f0',display:'flex',gap:'8px',background:'#fafafa'}}>
                <input autoFocus value={projName} onChange={e=>setProjName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addProject(group.id);if(e.key==='Escape')setAddingProj(null)}} placeholder={t.projectName} style={{border:'1px solid #ddd',borderRadius:'6px',padding:'5px 9px',fontSize:'12px',outline:'none',width:'200px'}}/>
                <button onClick={()=>addProject(group.id)} style={{background:BRAND,color:'#fff',border:'none',borderRadius:'6px',padding:'5px 12px',fontSize:'12px',cursor:'pointer'}}>{t.create}</button>
                <button onClick={()=>setAddingProj(null)} style={{background:'none',border:'none',color:'#bbb',fontSize:'15px',cursor:'pointer'}}>✕</button>
              </div>
            )}

            {group.open&&(
              <div style={{padding:mobile?'12px 16px 4px':'0'}}>
                {mobile&&(
                  <button onClick={()=>{setAddingProj(group.id);setProjName('')}} style={{width:'100%',background:'none',border:'1px dashed #ddd',borderRadius:'8px',color:'#aaa',cursor:'pointer',fontSize:'12px',padding:'8px',marginBottom:'8px',textAlign:'left'}}>{t.newProject}</button>
                )}
                {gProjects.map((proj,pi)=>{
                  const accent=ACCENTS[proj.color_idx%ACCENTS.length]
                  const pTasks=tasks.filter(t=>t.project_id===proj.id)
                  const todayN=pTasks.filter(t=>t.today&&t.status!=='done').length
                  const doneN=pTasks.filter(t=>t.status==='done').length
                  const doingN=pTasks.filter(t=>t.status==='doing').length
                  const todoN=pTasks.filter(t=>t.status==='todo').length
                  const pct=pTasks.length?Math.round(doneN/pTasks.length*100):0
                  const isFirst=pi===0, isLast=pi===gProjects.length-1

                  if(mobile) return (
                    <MobileProjectCard key={proj.id} proj={proj} tasks={tasks} t={t} lang={lang} accent={accent}
                      isFirst={isFirst} isLast={isLast}
                      onToggle={()=>toggleProject(proj.id)}
                      onDelete={()=>setConfirmDel({type:'project',id:proj.id,name:proj.name})}
                      onMoveUp={()=>moveProjUp(proj.id)} onMoveDown={()=>moveProjDown(proj.id)}
                      editProj={editingProj} editVal={editVal} setEditVal={setEditVal}
                      onEditStart={p=>{setEditingProj(p.id);setEditVal(p.name)}}
                      onEditSave={saveEditProj} onEditCancel={()=>setEditingProj(null)}
                      adding={addingTask} setAdding={setAddingTask}
                      newText={newText} setNewText={setNewText}
                      onAddTask={addTask} onMoveTask={moveTask} onDelTask={delTask}
                      onTodayTask={(tid,cur)=>todayTask(tid,cur)} onEditTask={editTask}
                    />
                  )

                  return (
                    <div key={proj.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                      <div style={{display:'flex',alignItems:'center',background:pi%2===0?'#fff':'#fafafa'}}>
                        <div style={{width:3,alignSelf:'stretch',background:`${accent}30`,flexShrink:0,marginLeft:24}}/>
                        <div style={{display:'flex',flexDirection:'column',gap:'2px',padding:'0 8px',flexShrink:0}}>
                          <button onClick={()=>moveProjUp(proj.id)} disabled={isFirst} style={{background:'none',border:'1px solid #eee',borderRadius:'4px',color:isFirst?'#eee':'#aaa',cursor:isFirst?'default':'pointer',fontSize:'10px',padding:'1px 5px',lineHeight:1.4}}>↑</button>
                          <button onClick={()=>moveProjDown(proj.id)} disabled={isLast} style={{background:'none',border:'1px solid #eee',borderRadius:'4px',color:isLast?'#eee':'#aaa',cursor:isLast?'default':'pointer',fontSize:'10px',padding:'1px 5px',lineHeight:1.4}}>↓</button>
                        </div>
                        <div onClick={()=>toggleProject(proj.id)} style={{flex:1,padding:'10px 0',display:'flex',alignItems:'center',gap:'9px',cursor:'pointer',userSelect:'none',minWidth:0}}>
                          <span style={{fontSize:'9px',color:'#ccc'}}>{proj.open?'▼':'▶'}</span>
                          <div style={{width:7,height:7,borderRadius:'50%',background:accent,flexShrink:0}}/>
                          {editingProj===proj.id?(
                            <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onClick={e=>e.stopPropagation()} onBlur={()=>saveEditProj(proj.id)} onKeyDown={e=>{if(e.key==='Enter')saveEditProj(proj.id);if(e.key==='Escape')setEditingProj(null)}} style={{border:'none',borderBottom:`1.5px solid ${accent}`,outline:'none',fontSize:'13px',fontWeight:600,background:'transparent'}}/>
                          ):(
                            <span onDoubleClick={e=>{e.stopPropagation();setEditingProj(proj.id);setEditVal(proj.name)}} style={{fontWeight:600,fontSize:'13px'}}>{proj.name}</span>
                          )}
                          {!proj.open&&(
                            <div style={{display:'flex',gap:'5px',marginLeft:'4px'}}>
                              {todayN>0&&<Badge label={`${todayN} ${t.hoy.toLowerCase()}`} bg={`${BRAND}12`} color={BRAND}/>}
                              {todoN>0&&<Badge label={`${todoN} ${t.todo.toLowerCase()}`} bg="#f5f5f5" color="#777"/>}
                              {doingN>0&&<Badge label={`${doingN} ${t.doing.toLowerCase()}`} bg="#fff7ed" color="#ea580c"/>}
                              {doneN>0&&<Badge label={`${doneN} ${t.done.toLowerCase()}`} bg="#f0fdf4" color="#16a34a"/>}
                            </div>
                          )}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'0 20px 0 12px',flexShrink:0}}>
                          <div style={{width:60,height:2,background:'#eee',borderRadius:2,overflow:'hidden'}}><div style={{width:`${pct}%`,height:'100%',background:accent,transition:'width 0.3s'}}/></div>
                          <span style={{fontSize:'11px',color:'#aaa',minWidth:'24px'}}>{pct}%</span>
                          <button onClick={()=>setConfirmDel({type:'project',id:proj.id,name:proj.name})} style={{background:'none',border:'1px solid #eee',borderRadius:'5px',color:'#bbb',cursor:'pointer',fontSize:'12px',padding:'2px 8px',lineHeight:1.6}}>✕</button>
                        </div>
                      </div>
                      {proj.open&&(
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',borderTop:'1px solid #f4f4f4',marginLeft:27}}>
                          {COLS.map((col,ci)=>{
                            const colTasks=pTasks.filter(t=>t.status===col.key)
                            const isAdd=addingTask.pid===proj.id&&addingTask.col===col.key
                            const colId=`col:${proj.id}:${col.key}`
                            const isColOver=dragOver===colId
                            return (
                              <div key={col.key}
                                onDragOver={e=>{e.preventDefault();handleDragOverCol(col.key,proj.id)}}
                                onDrop={e=>{e.preventDefault();handleDropOnCol(col.key,proj.id)}}
                                style={{borderRight:ci<2?'1px solid #f4f4f4':'none',padding:'8px 12px 10px',background:isColOver?`${col.color}08`:'transparent',transition:'background 0.15s'}}>
                                <div style={{display:'flex',gap:'5px',alignItems:'center',marginBottom:'6px'}}>
                                  <span style={{fontSize:'10px',fontWeight:600,textTransform:'uppercase',letterSpacing:'1.5px',color:col.color}}>{lang==='es'?col.es:col.en}</span>
                                  <span style={{fontSize:'11px',color:'#ccc'}}>{colTasks.length}</span>
                                </div>
                                {colTasks.map(task=>(
                                  <TaskCard key={task.id} task={task} accent={accent} alwaysShow={false}
                                    dragHandlers={{
                                      draggable:true,
                                      onDragStart:()=>handleDragStart(task.id,proj.id,task.status),
                                      onDragOver:e=>{e.preventDefault();handleDragOverTask(task.id,proj.id,task.status)},
                                      onDrop:e=>{e.preventDefault();handleDropOnTask(task.id,proj.id,task.status)},
                                      style:{opacity:dragRef.current?.tid===task.id?0.35:1,borderTop:dragOver===task.id?`2px solid ${accent}`:'2px solid transparent',transition:'border 0.1s'}
                                    }}
                                    onMove={s=>moveTask(task.id,s)} onDelete={()=>delTask(task.id)}
                                    onToday={()=>todayTask(task.id,task.today)} onEdit={text=>editTask(task.id,text)}
                                  />
                                ))}
                                {isAdd?(
                                  <div style={{display:'flex',gap:'4px',marginTop:'4px'}}>
                                    <input autoFocus value={newText} onChange={e=>setNewText(e.target.value)}
                                      onKeyDown={e=>{if(e.key==='Enter')addTask(proj.id,col.key);if(e.key==='Escape'){setAddingTask({});setNewText('')}}}
                                      placeholder={t.newTask} style={{flex:1,border:'none',borderBottom:`1px solid ${accent}`,outline:'none',fontSize:'12px',padding:'4px 2px',background:'transparent'}}/>
                                    <button onClick={()=>addTask(proj.id,col.key)} style={{background:'none',border:'none',color:accent,fontWeight:700,cursor:'pointer',fontSize:'14px'}}>+</button>
                                  </div>
                                ):(
                                  <button onClick={()=>{setAddingTask({pid:proj.id,col:col.key});setNewText('')}} style={{background:'none',border:'none',color:'#ccc',cursor:'pointer',fontSize:'11px',padding:'3px 0',textAlign:'left',width:'100%'}}>{t.addTask}</button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {groups.length===0&&!loading&&<div style={{textAlign:'center',color:'#ccc',marginTop:'80px',fontSize:'14px',padding:'24px'}}>{t.noGroups}</div>}
    </div>
  )
}

export default function KanvuuApp() {
  const [session,setSession]=useState(null), [lang,setLang]=useState('es')
  const t=T[lang]
  return session
    ? <KanvuuMain session={session} t={t} lang={lang} setLang={setLang} onLogout={()=>setSession(null)}/>
    : <AuthScreen t={t} lang={lang} setLang={setLang} onLogin={setSession}/>
}
