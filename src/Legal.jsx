import { Logo, X } from './icons.jsx'
import { TERMINOS, PRIVACIDAD, VIGENCIA } from './lib/legal.js'

// Muestra los Términos y la Política de Privacidad. Se abre desde el inicio y
// desde el registro de conductores/comercios.
export default function Legal({ onCerrar }) {
  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <button className="rol-chip" onClick={onCerrar}><X size={14} /> Cerrar</button>
      </header>
      <div className="legal">
        <h1>Términos y Condiciones</h1>
        {TERMINOS.map((s) => (
          <section key={s.h}>
            <h3>{s.h}</h3>
            {s.p.map((x, i) => <p key={i}>{x}</p>)}
          </section>
        ))}

        <h1 style={{ marginTop: 28 }}>Política de Privacidad</h1>
        {PRIVACIDAD.map((s) => (
          <section key={s.h}>
            <h3>{s.h}</h3>
            {s.p.map((x, i) => <p key={i}>{x}</p>)}
          </section>
        ))}

        <p className="legal-nota">Vigencia: {VIGENCIA}. Versión base; será revisada por un abogado antes del lanzamiento público.</p>
      </div>
    </div>
  )
}
