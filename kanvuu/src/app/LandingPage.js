import Link from 'next/link'

export const metadata = {
  title: 'Kanvuu — Tus proyectos, siempre claros',
  description: 'Gestión de proyectos simple y visual. Organiza tus tareas en columnas y ten siempre una vista macro de todo tu trabajo.',
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --brand: #166534; --brand-light: #dcfce7; --muted: #888; --border: #ebebeb; --section: #fafafa; }
        body { font-family: 'SF Pro Text','Helvetica Neue',Arial,sans-serif; color: #111; background: #fff; line-height: 1.6; -webkit-font-smoothing: antialiased; }
        nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 14px 24px; display: flex; align-items: center; gap: 12px; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo span { font-weight: 800; font-size: 16px; letter-spacing: -0.5px; color: var(--brand); }
        .nav-right { margin-left: auto; }
        .cta-small { background: var(--brand); color: #fff; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 600; text-decoration: none; display: inline-block; }
        .hero { padding: 80px 24px 72px; text-align: center; max-width: 680px; margin: 0 auto; }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--brand-light); color: var(--brand); border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 600; margin-bottom: 24px; }
        .hero h1 { font-size: clamp(32px,6vw,56px); font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 20px; }
        .hero h1 em { color: var(--brand); font-style: normal; }
        .hero p { font-size: clamp(15px,2vw,18px); color: var(--muted); margin-bottom: 36px; }
        .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn-primary { background: var(--brand); color: #fff; border-radius: 10px; padding: 14px 28px; font-size: 15px; font-weight: 700; text-decoration: none; display: inline-block; }
        .btn-primary:hover { opacity: 0.85; }
        .btn-secondary { background: #f5f5f5; color: #555; border-radius: 10px; padding: 14px 28px; font-size: 15px; font-weight: 600; text-decoration: none; display: inline-block; }
        .preview { max-width: 860px; margin: 0 auto 80px; padding: 0 24px; }
        .preview-window { border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08); }
        .preview-bar { background: #fff; border-bottom: 2px solid var(--brand); padding: 10px 16px; display: flex; align-items: center; gap: 12px; }
        .preview-bar-logo { display: flex; align-items: center; gap: 7px; }
        .preview-bar-logo span { font-weight: 800; font-size: 13px; color: var(--brand); }
        .preview-stats { display: flex; gap: 14px; margin-left: 8px; }
        .pstat { display: flex; align-items: baseline; gap: 3px; }
        .pstat strong { font-size: 13px; }
        .pstat small { font-size: 10px; color: #bbb; }
        .preview-project { border-bottom: 1px solid #f0f0f0; }
        .preview-proj-row { padding: 10px 16px; display: flex; align-items: center; gap: 10px; }
        .proj-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .proj-name { font-weight: 600; font-size: 12px; flex: 1; }
        .pbar-wrap { display: flex; align-items: center; gap: 6px; }
        .pbar { width: 60px; height: 2px; background: #eee; border-radius: 2px; overflow: hidden; }
        .pbar-fill { height: 100%; border-radius: 2px; }
        .ppct { font-size: 10px; color: #bbb; }
        .preview-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; border-top: 1px solid #f4f4f4; }
        .preview-col { padding: 8px 10px; border-right: 1px solid #f4f4f4; }
        .preview-col:last-child { border-right: none; }
        .pcol-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
        .ptask { display: flex; align-items: center; gap: 5px; padding: 3px; margin-bottom: 2px; }
        .ptask-today { font-size: 8px; font-weight: 700; border-radius: 3px; padding: 1px 4px; flex-shrink: 0; }
        .ptask-text { font-size: 11px; color: #333; }
        .ptask-text.done { text-decoration: line-through; color: #bbb; }
        .section { padding: 72px 24px; }
        .section-inner { max-width: 860px; margin: 0 auto; }
        .sec-label { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--brand); margin-bottom: 12px; }
        .sec-title { font-size: clamp(24px,4vw,36px); font-weight: 800; letter-spacing: -0.8px; margin-bottom: 48px; }
        .steps { display: grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap: 32px; }
        .step { display: flex; flex-direction: column; gap: 12px; }
        .step-num { width: 36px; height: 36px; border-radius: 10px; background: var(--brand); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; }
        .step h3 { font-size: 15px; font-weight: 700; }
        .step p { font-size: 13px; color: var(--muted); line-height: 1.6; }
        .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); gap: 20px; }
        .benefit { background: var(--section); border-radius: 12px; padding: 24px; border: 1px solid var(--border); }
        .benefit-icon { font-size: 24px; margin-bottom: 12px; }
        .benefit h3 { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
        .benefit p { font-size: 13px; color: var(--muted); line-height: 1.5; }
        .cta-sec { padding: 80px 24px; background: var(--brand); text-align: center; }
        .cta-sec h2 { font-size: clamp(24px,4vw,40px); font-weight: 800; letter-spacing: -1px; color: #fff; margin-bottom: 16px; }
        .cta-sec p { color: rgba(255,255,255,0.7); margin-bottom: 32px; font-size: 15px; }
        .btn-white { background: #fff; color: var(--brand); border-radius: 10px; padding: 14px 32px; font-size: 15px; font-weight: 700; text-decoration: none; display: inline-block; }
        footer { padding: 24px; text-align: center; border-top: 1px solid var(--border); font-size: 12px; color: #bbb; }
        footer strong { color: var(--brand); }
        @media (max-width: 600px) {
          .preview-cols { grid-template-columns: 1fr; }
          .preview-col { border-right: none; border-bottom: 1px solid #f4f4f4; }
          .preview-col:last-child { border-bottom: none; }
          .preview-stats { display: none; }
        }
      `}</style>

      <nav>
        <Link href="/" className="nav-logo">
          <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="11" fill="#166534"/>
            <rect x="13" y="10" width="5" height="28" rx="2.5" fill="#fff"/>
            <path d="M18 24 L35 10" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
            <path d="M18 24 L35 38" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span>Kanvuu</span>
        </Link>
        <div className="nav-right">
          <Link href="/app" className="cta-small">Entrar</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge"><span>✦</span><span>Gestión de proyectos simple</span></div>
        <h1>Tus proyectos,<br/><em>siempre claros.</em></h1>
        <p>Kanvuu te da una vista macro de todos tus proyectos con sus tareas organizadas en columnas. Sin complicaciones, sin ruido.</p>
        <div className="hero-cta">
          <Link href="/app" className="btn-primary">Crear cuenta gratis</Link>
          <a href="#how" className="btn-secondary">Cómo funciona</a>
        </div>
      </section>

      <div className="preview">
        <div className="preview-window">
          <div className="preview-bar">
            <div className="preview-bar-logo">
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="11" fill="#166534"/>
                <rect x="13" y="10" width="5" height="28" rx="2.5" fill="#fff"/>
                <path d="M18 24 L35 10" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
                <path d="M18 24 L35 38" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
              </svg>
              <span>Kanvuu</span>
            </div>
            <div className="preview-stats">
              <div className="pstat"><strong style={{color:'#166534'}}>3</strong><small>Hoy</small></div>
              <div className="pstat"><strong>5</strong><small>Por hacer</small></div>
              <div className="pstat"><strong style={{color:'#ea580c'}}>3</strong><small>En curso</small></div>
              <div className="pstat"><strong style={{color:'#16a34a'}}>4</strong><small>Completado</small></div>
            </div>
          </div>
          <div>
            <div className="preview-project">
              <div className="preview-proj-row">
                <span style={{fontSize:'9px',color:'#ccc'}}>▼</span>
                <div className="proj-dot" style={{background:'#2563eb'}}></div>
                <span className="proj-name">Rediseño web</span>
                <div className="pbar-wrap">
                  <div className="pbar"><div className="pbar-fill" style={{width:'60%',background:'#2563eb'}}></div></div>
                  <span className="ppct">60%</span>
                </div>
              </div>
              <div className="preview-cols">
                <div className="preview-col">
                  <div className="pcol-label" style={{color:'#555'}}>Por hacer</div>
                  <div className="ptask"><span className="ptask-today" style={{background:'#f0f0f0',color:'#ccc'}}>HOY</span><span className="ptask-text">Diseño móvil</span></div>
                  <div className="ptask"><span className="ptask-today" style={{background:'#f0f0f0',color:'#ccc'}}>HOY</span><span className="ptask-text">Copy páginas</span></div>
                </div>
                <div className="preview-col">
                  <div className="pcol-label" style={{color:'#ea580c'}}>En curso</div>
                  <div className="ptask"><span className="ptask-today" style={{background:'rgba(22,101,52,0.1)',color:'#166534'}}>HOY</span><span className="ptask-text" style={{fontWeight:600}}>Homepage</span></div>
                </div>
                <div className="preview-col">
                  <div className="pcol-label" style={{color:'#16a34a'}}>Completado</div>
                  <div className="ptask"><span className="ptask-text done">Wireframes</span></div>
                  <div className="ptask"><span className="ptask-text done">Paleta colores</span></div>
                </div>
              </div>
            </div>
            <div className="preview-project">
              <div className="preview-proj-row" style={{background:'#fafafa'}}>
                <span style={{fontSize:'9px',color:'#ccc'}}>▶</span>
                <div className="proj-dot" style={{background:'#16a34a'}}></div>
                <span className="proj-name">App móvil</span>
                <span style={{fontSize:'10px',background:'rgba(22,101,52,0.1)',color:'#166534',borderRadius:'10px',padding:'1px 7px',fontWeight:600}}>2 hoy</span>
                <span style={{fontSize:'10px',background:'#fff7ed',color:'#ea580c',borderRadius:'10px',padding:'1px 7px',marginLeft:'4px'}}>2 en curso</span>
                <div className="pbar-wrap" style={{marginLeft:'auto'}}>
                  <div className="pbar"><div className="pbar-fill" style={{width:'25%',background:'#16a34a'}}></div></div>
                  <span className="ppct">25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section" id="how" style={{background:'#fafafa'}}>
        <div className="section-inner">
          <div className="sec-label">Cómo funciona</div>
          <h2 className="sec-title">Simple desde el primer día</h2>
          <div className="steps">
            {[
              {n:1, title:'Crea tus proyectos', desc:'Agrega un proyecto con un clic. Dale un nombre y empieza a organizarlo de inmediato.'},
              {n:2, title:'Agrega tus tareas', desc:'Cada proyecto tiene tres columnas: Por hacer, En curso y Completado. Mueve las tareas conforme avanzas.'},
              {n:3, title:'Marca tus tareas de hoy', desc:'Usa el botón HOY para marcar qué vas a hacer en el día. El contador de arriba te dice cuántas tienes pendientes.'},
              {n:4, title:'Vista macro siempre', desc:'Colapsa los proyectos para ver el estado de todo de un vistazo. Abre solo el que necesitas en ese momento.'},
            ].map(s=>(
              <div key={s.n} className="step">
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="sec-label">Por qué Kanvuu</div>
          <h2 className="sec-title">Lo que necesitas, nada más</h2>
          <div className="benefits-grid">
            {[
              {icon:'🗂', title:'Todo en una pantalla', desc:'Ve todos tus proyectos y su estado sin navegar entre páginas. Una vista, toda la información.'},
              {icon:'✦', title:'Enfócate en el día', desc:"El sistema de 'Hoy' te ayuda a priorizar sin perder de vista el panorama general de tus proyectos."},
              {icon:'📱', title:'Funciona en cualquier dispositivo', desc:'Diseñado para verse perfecto en celular, tablet y computadora.'},
              {icon:'☁️', title:'Datos en la nube', desc:'Todo se guarda automáticamente. Entra desde cualquier navegador y tus proyectos te esperan.'},
              {icon:'🔒', title:'Tu cuenta, tus datos', desc:'Cada usuario ve solo sus propios proyectos. Privacidad y seguridad desde el primer día.'},
              {icon:'⚡', title:'Sin curva de aprendizaje', desc:'En 2 minutos ya sabes usar Kanvuu. Sin tutoriales, sin configuración, sin complicaciones.'},
            ].map(b=>(
              <div key={b.title} className="benefit">
                <div className="benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-sec">
        <h2>Empieza hoy, gratis.</h2>
        <p>Crea tu cuenta en segundos y organiza tus proyectos desde ahora.</p>
        <Link href="/app" className="btn-white">Crear cuenta gratis</Link>
      </section>

      <footer>
        <strong>Kanvuu</strong> · Tus proyectos, siempre claros.
      </footer>
    </>
  )
}
