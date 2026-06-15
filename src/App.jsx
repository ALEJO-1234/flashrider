import { useRef, useState } from 'react'
import PasajeroApp from './PasajeroApp.jsx'
import ConductorApp from './ConductorApp.jsx'
import ComercioApp from './ComercioApp.jsx'
import AdminApp from './AdminApp.jsx'
import Legal from './Legal.jsx'
import { Flash, Bike, User, Store, ChevronRight, Logo } from './icons.jsx'

// Selector de rol. El rol se guarda POR PESTAÑA (sessionStorage), así puedes
// abrir pasajero, conductor y admin en pestañas distintas a la vez.
export default function App() {
  const [rol, setRol] = useState(() => {
    if (typeof location !== 'undefined' && /[?&#]admin/.test(location.search + location.hash)) return 'admin'
    return sessionStorage.getItem('upa_rol') || ''
  })

  function elegir(r) { sessionStorage.setItem('upa_rol', r); setRol(r) }
  function cambiar() { sessionStorage.removeItem('upa_rol'); setRol('') }

  // Acceso secreto al panel admin: tocar el logo 5 veces seguidas (solo el dueño).
  const taps = useRef(0)
  const tapTimer = useRef(null)
  function tocarLogo() {
    taps.current += 1
    clearTimeout(tapTimer.current)
    tapTimer.current = setTimeout(() => { taps.current = 0 }, 1200)
    if (taps.current >= 5) { taps.current = 0; elegir('admin') }
  }

  if (rol === 'pasajero') return <PasajeroApp onCambiarRol={cambiar} />
  if (rol === 'conductor') return <ConductorApp onCambiarRol={cambiar} />
  if (rol === 'comercio') return <ComercioApp onCambiarRol={cambiar} />
  if (rol === 'admin') return <AdminApp onCambiarRol={cambiar} />
  if (rol === 'legal') return <Legal onCerrar={cambiar} />

  return (
    <div className="app">
      <header className="topbar">
        <span onClick={tocarLogo} style={{ cursor: 'default' }}><Logo /></span>
        <span className="tagline">Pídela, súbete, llegaste.</span>
      </header>
      <div className="gate">
        <div className="gate-hero">
          <div className="mark"><Flash size={36} /></div>
          <h1>Bienvenido a Flashrider</h1>
          <p className="sub center">Tu mototaxi en Upata, al instante. Elige cómo vas a entrar.</p>
        </div>

        <button className="gate-btn primary" onClick={() => elegir('pasajero')}>
          <span className="g-ico"><User size={24} /></span>
          <span className="g-txt"><span className="g-title">Soy pasajero</span><span className="g-sub">Pedir mi moto</span></span>
          <ChevronRight size={20} className="chev" />
        </button>
        <button className="gate-btn" onClick={() => elegir('conductor')}>
          <span className="g-ico"><Bike size={24} /></span>
          <span className="g-txt"><span className="g-title">Soy conductor</span><span className="g-sub">Recibir y atender carreras</span></span>
          <ChevronRight size={20} className="chev" />
        </button>
        <button className="gate-btn" onClick={() => elegir('comercio')}>
          <span className="g-ico"><Store size={24} /></span>
          <span className="g-txt"><span className="g-title">Soy comercio</span><span className="g-sub">Restaurantes y tiendas — vender con delivery</span></span>
          <ChevronRight size={20} className="chev" />
        </button>

        <button className="btn btn-ghost" onClick={() => elegir('legal')}>
          Términos y Política de Privacidad
        </button>
      </div>
    </div>
  )
}
