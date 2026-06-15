import { useEffect, useRef, useState } from 'react'
import MapaViaje from './components/MapaViaje.jsx'
import { UPATA_CENTER } from './lib/config.js'
import { ubicacionActual } from './lib/geo.js'
import { formatoBs } from './lib/fare.js'
import { guardarComercio, actualizarComercio, actualizarViaje } from './lib/backend.js'
import { useViajes, useComercios } from './lib/useDatos.js'
import { pedirPermisoNotif, notificar } from './lib/notificaciones.js'
import Legal from './Legal.jsx'
import { Logo, Store, Power, Check, X, Bag } from './icons.jsx'

const TIPOS = ['Restaurante', 'Comida casera', 'Abasto / bodega', 'Farmacia', 'Otro']

export default function ComercioApp({ onCambiarRol }) {
  const [miId, setMiId] = useState(() => localStorage.getItem('upa_mi_comercio_id') || '')
  const comercios = useComercios()
  const viajes = useViajes()
  const yo = comercios.find((c) => c.id === miId)

  const pendientes = viajes.filter((v) => v.comercio_id === miId && v.estado === 'pendiente_comercio')
  const activos = viajes.filter((v) => v.comercio_id === miId && ['buscando', 'en_camino', 'llego', 'en_curso'].includes(v.estado))

  // Notificación cuando entra un pedido nuevo.
  useEffect(() => { pedirPermisoNotif() }, [])
  const vistosRef = useRef(new Set())
  useEffect(() => {
    for (const v of pendientes) {
      if (!vistosRef.current.has(v.id)) {
        vistosRef.current.add(v.id)
        if (vistosRef.current.size > 1 || pendientes.length) notificar('🛍️ Nuevo pedido de delivery', v.nota || 'Tienes un pedido nuevo')
      }
    }
  }, [pendientes.map((p) => p.id).join(',')]) // eslint-disable-line

  if (!miId || !yo) return <Registro onListo={(id) => { setMiId(id); localStorage.setItem('upa_mi_comercio_id', id) }} onCambiarRol={onCambiarRol} />

  function aceptar(id) { actualizarViaje(id, { estado: 'buscando' }) }
  function rechazar(id) { actualizarViaje(id, { estado: 'cancelado' }) }
  function abrirCerrar() { actualizarComercio(miId, { abierto: !yo.abierto }) }

  const estadoTxt = (e) => ({ buscando: 'Buscando motorizado…', en_camino: 'Motorizado en camino al local', llego: 'Motorizado en tu local', en_curso: 'En camino al cliente' }[e] || e)

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <button className="rol-chip" onClick={onCambiarRol}><Store size={14} /> Comercio</button>
      </header>

      <div className="map-wrap">
        <MapaViaje origen={yo.ubicacion} destino={activos[0]?.destino} moto={activos[0]?.moto} center={yo.ubicacion || UPATA_CENTER} />
      </div>

      <div className="sheet">
        <div className="driver">
          <div className="avatar"><Store size={24} /></div>
          <div>
            <div className="name">{yo.nombre}</div>
            <div className="meta">{yo.tipo}{yo.vende ? ` · ${yo.vende}` : ''}</div>
          </div>
          <span className={'badge ' + (yo.abierto ? 'verde' : 'rojo')}>{yo.abierto ? 'abierto' : 'cerrado'}</span>
        </div>

        {/* Pedidos entrantes */}
        {pendientes.length > 0 && (
          <>
            <span className="status-pill"><span className="dot" />{pendientes.length} {pendientes.length === 1 ? 'pedido nuevo' : 'pedidos nuevos'}</span>
            <div className="lista-pedidos">
              {pendientes.map((v) => (
                <div className="pedido" key={v.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div className="pedido-top"><Bag size={16} /> Pedido de delivery</div>
                  {v.nota && <div className="nota" style={{ margin: '8px 0' }}>{v.nota}</div>}
                  <div className="fare-detail">Delivery: {formatoBs(v.tarifa.bs)} — lo paga el cliente al motorizado. La comida la cobras tú.</div>
                  <div className="btn-row">
                    <button className="btn btn-sec" onClick={() => rechazar(v.id)}><X size={16} /> Rechazar</button>
                    <button className="btn btn-primary" onClick={() => aceptar(v.id)}><Check size={16} /> Aceptar y enviar moto</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pedidos en curso */}
        {activos.length > 0 && (
          <div style={{ marginTop: pendientes.length ? 14 : 0 }}>
            {activos.map((v) => (
              <div className="nota" key={v.id} style={{ marginBottom: 8 }}>
                <span className="dot" style={{ marginRight: 6 }} /> {estadoTxt(v.estado)} · {v.nota || 'pedido'}
              </div>
            ))}
          </div>
        )}

        {pendientes.length === 0 && activos.length === 0 && (
          <p className="sub center" style={{ margin: '8px 0 16px' }}>
            {yo.abierto ? 'Esperando pedidos de delivery…' : 'Estás cerrado. Ábrete para recibir pedidos.'}
          </p>
        )}

        <button className={'btn ' + (yo.abierto ? 'btn-sec' : 'btn-primary')} onClick={abrirCerrar}>
          <Power size={18} /> {yo.abierto ? 'Cerrar (no recibir pedidos)' : 'Abrir para recibir pedidos'}
        </button>
      </div>
    </div>
  )
}

function Registro({ onListo, onCambiarRol }) {
  const [f, setF] = useState({ nombre: '', tipo: 'Restaurante', telefono: '', vende: '' })
  const [acepto, setAcepto] = useState(false)
  const [verLegal, setVerLegal] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  if (verLegal) return <Legal onCerrar={() => setVerLegal(false)} />

  async function registrar(e) {
    e.preventDefault()
    let ubic = UPATA_CENTER
    try { ubic = await ubicacionActual() } catch { /* centro */ }
    const c = guardarComercio({ ...f, verificado: true, abierto: true, ubicacion: ubic, creado_en: Date.now() })
    onListo(c.id)
  }

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <button className="rol-chip" onClick={onCambiarRol}><Store size={14} /> Comercio</button>
      </header>
      <form className="sheet" onSubmit={registrar} style={{ marginTop: 'auto' }}>
        <h2>Afilia tu comercio</h2>
        <p className="sub">Gratis. Te llevamos clientes y reparto sin cobrarte comisión de tu comida.</p>
        <input className="campo" placeholder="Nombre del comercio" required value={f.nombre} onChange={set('nombre')} />
        <select className="campo" value={f.tipo} onChange={set('tipo')}>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input className="campo" placeholder="Teléfono / Pago Móvil (para cobrar tu comida)" required value={f.telefono} onChange={set('telefono')} />
        <input className="campo" placeholder="¿Qué vendes? (ej. pizzas, hamburguesas, postres)" value={f.vende} onChange={set('vende')} />
        <label className="acepto">
          <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
          <span>Acepto los <a onClick={(e) => { e.preventDefault(); setVerLegal(true) }}>Términos y la Política de Privacidad</a></span>
        </label>
        <button className="btn btn-primary" type="submit" disabled={!acepto}><Store size={18} /> Afiliarme gratis</button>
      </form>
    </div>
  )
}
