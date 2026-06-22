import { useEffect, useRef, useState } from 'react'
import MapaViaje from './components/MapaViaje.jsx'
import { UPATA_CENTER, TIPOS_SERVICIO, RADIO_PEDIDOS_KM, SALDO_BIENVENIDA, SALDO_BAJO, CUENTAS_RECARGA } from './lib/config.js'
import { ubicacionActual, distanciaKm } from './lib/geo.js'
import { obtenerRuta, largoRuta, posicionEnRuta } from './lib/ruta.js'
import { formatoUsd, formatoBs } from './lib/fare.js'
import { useTasa } from './lib/bcv.js'
import { guardarConductor, actualizarConductor, actualizarViaje, aceptarViaje, ajustarSaldo, obtenerViaje } from './lib/backend.js'
import { useViajes, useConductores } from './lib/useDatos.js'
import { pedirPermisoNotif, notificar } from './lib/notificaciones.js'
import { archivoAMiniatura } from './lib/imagen.js'
import Legal from './Legal.jsx'
import { Logo, Bike, Wallet, Star, CheckCircle, Cash, Power, Camera, TipoIco } from './icons.jsx'

const LLEGADA_KM = 0.04 // umbral para considerar "llegó"

export default function ConductorApp({ onCambiarRol }) {
  const [miId, setMiId] = useState(() => localStorage.getItem('upa_mi_conductor_id') || '')
  const [vistos, setVistos] = useState([])     // pedidos ya cerrados (resumen visto)
  const [recargando, setRecargando] = useState(false)
  const [ruta, setRuta] = useState(null)       // ruta por calles del trayecto actual
  const avance = useRef(0)

  const tasa = useTasa()
  const conductores = useConductores()
  const viajes = useViajes()
  const yo = conductores.find((c) => c.id === miId)

  const saldo = yo ? (yo.saldo || 0) : 0
  const sinSaldo = saldo <= 0

  // Pedidos en difusión (sin dueño): todos los conductores cercanos los ven.
  // El primero que acepte los bloquea para el resto (anti-robo de clientes).
  // Sin saldo no se reciben pedidos (hay que recargar la comisión).
  const pedidos = (yo?.disponible && yo?.ubicacion && !sinSaldo)
    ? viajes
        .filter((v) => v.estado === 'buscando' && !v.conductor_id)
        .map((v) => ({ v, dist: distanciaKm(yo.ubicacion, v.origen) }))
        .filter((x) => x.dist <= RADIO_PEDIDOS_KM)
        .sort((a, b) => a.dist - b.dist)
    : []

  const activo = viajes.find((v) => v.conductor_id === miId && ['en_camino', 'llego', 'en_curso'].includes(v.estado))
  const completado = viajes.find((v) => v.conductor_id === miId && v.estado === 'completado' && !vistos.includes(v.id))
  const cancelado = viajes.find((v) => v.conductor_id === miId && v.estado === 'cancelado' && v.cancelacion_fee && !vistos.includes(v.id))

  // Notificación (sonido + aviso) cuando entra un pedido nuevo.
  useEffect(() => { pedirPermisoNotif() }, [])
  const vistosPedidos = useRef(null)
  useEffect(() => {
    const ids = new Set(pedidos.map((p) => p.v.id))
    if (vistosPedidos.current === null) { vistosPedidos.current = ids; return } // primera carga: sin aviso
    for (const { v } of pedidos) {
      if (!vistosPedidos.current.has(v.id)) {
        const tp = TIPOS_SERVICIO[v.tipo]
        notificar(`Nuevo pedido — ${tp.label}`, `${formatoBs(v.tarifa.conductorBs)} para ti`)
      }
    }
    vistosPedidos.current = ids
  }, [pedidos.map((p) => p.v.id).join(',')]) // eslint-disable-line

  // --- Simulación de movimiento: la moto recorre la RUTA POR LAS CALLES ---
  useEffect(() => {
    if (!activo || !yo || (activo.estado !== 'en_camino' && activo.estado !== 'en_curso')) { setRuta(null); return }
    let cancel = false, timer
    const inicio = activo.moto || yo.ubicacion
    const objetivo = activo.estado === 'en_camino' ? activo.origen : activo.destino
    avance.current = 0
    obtenerRuta(inicio, objetivo).then((pts) => {
      if (cancel) return
      setRuta(pts)
      const total = largoRuta(pts)
      timer = setInterval(() => {
        const v = obtenerViaje(activo.id)
        if (!v || v.estado === 'cancelado') { clearInterval(timer); return }
        avance.current += 0.04
        if (avance.current >= total) {
          const fin = pts[pts.length - 1]
          if (v.estado === 'en_camino') {
            actualizarViaje(v.id, { estado: 'llego', moto: fin })
            actualizarConductor(miId, { ubicacion: fin })
          } else {
            actualizarViaje(v.id, { estado: 'completado', moto: fin })
            actualizarConductor(miId, {
              ganancias: (yo.ganancias || 0) + v.tarifa.conductorBs,
              carreras: (yo.carreras || 0) + 1, ubicacion: fin
            })
            ajustarSaldo(miId, -v.tarifa.comisionBs)
          }
          clearInterval(timer)
        } else {
          const sig = posicionEnRuta(pts, avance.current)
          actualizarViaje(v.id, { moto: sig })
          actualizarConductor(miId, { ubicacion: sig })
        }
      }, 350)
    })
    return () => { cancel = true; clearInterval(timer) }
  }, [activo?.id, activo?.estado, yo?.id]) // eslint-disable-line

  if (!miId || !yo) return <Registro onListo={(id) => { setMiId(id); localStorage.setItem('upa_mi_conductor_id', id) }} onCambiarRol={onCambiarRol} />

  async function aceptar(id) {
    const r = await aceptarViaje(id, yo)
    if (!r.ok) alert(r.motivo === 'tomada' ? 'Ese pedido ya lo tomó otro conductor 🏍️' : 'El pedido ya no está disponible.')
  }
  function recogi() { actualizarViaje(activo.id, { estado: 'en_curso' }) }
  function cerrar(id) { setVistos((s) => [...s, id]) }
  function recargar(monto) {
    ajustarSaldo(miId, monto)
    setRecargando(false)
    alert(`Saldo recargado: +${formatoBs(monto)}. (En la app real se acredita cuando confirmas el Pago Móvil en el panel.)`)
  }
  async function ponerseDisponible(valor) {
    if (valor && sinSaldo) { setRecargando(true); return } // sin saldo no puede trabajar
    let ubic = yo.ubicacion
    if (valor) { try { ubic = await ubicacionActual() } catch { ubic = yo.ubicacion || UPATA_CENTER } }
    actualizarConductor(miId, { disponible: valor, ubicacion: ubic })
  }

  const tActivo = activo ? TIPOS_SERVICIO[activo.tipo] : null
  const mostrarPanel = !recargando && !completado && !cancelado && !activo && pedidos.length === 0
  const saldoClase = sinSaldo ? 'rojo' : (saldo < SALDO_BAJO ? 'amarillo' : 'verde')

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <button className="rol-chip" onClick={onCambiarRol}><Bike size={14} /> Conductor</button>
      </header>

      <div className="map-wrap">
        <MapaViaje origen={activo?.origen} destino={activo?.destino}
          moto={yo.ubicacion} ruta={ruta} center={yo.ubicacion || UPATA_CENTER} />
      </div>

      {/* Recargar saldo */}
      {recargando && (
        <div className="sheet">
          <h2>Recargar saldo Flashrider</h2>
          <p className="sub">Tu saldo es solo para la comisión del 10%. Envía Pago Móvil a:</p>
          <div className="nota">
            {CUENTAS_RECARGA.pagoMovil}
          </div>
          <p className="sub">Monto a recargar:</p>
          <div className="btn-row">
            <button className="btn btn-sec" onClick={() => recargar(1000)}>Bs 1.000</button>
            <button className="btn btn-sec" onClick={() => recargar(5000)}>Bs 5.000</button>
            <button className="btn btn-primary" onClick={() => recargar(10000)}>Bs 10.000</button>
          </div>
          <button className="btn btn-ghost" onClick={() => setRecargando(false)}>Volver</button>
        </div>
      )}

      {/* Compensación por cancelación del pasajero */}
      {!recargando && cancelado && (
        <div className="sheet center">
          <h2>El pasajero canceló</h2>
          <p className="sub">Como ya ibas en camino, te compensamos abonándolo a tu saldo.</p>
          <div className="fare center"><span className="usd">+{formatoBs(cancelado.cancelacion_fee)}</span><span className="bs">a tu saldo</span></div>
          <button className="btn btn-primary" onClick={() => cerrar(cancelado.id)}>Entendido</button>
        </div>
      )}

      {/* Resumen del pedido completado: ganancia + comisión descontada */}
      {!recargando && !cancelado && completado && (
        <div className="sheet center">
          <div style={{ color: 'var(--verde)', marginBottom: 8 }}><CheckCircle size={44} /></div>
          <h2>¡Carrera completada!</h2>
          <div className="fare center"><span className="usd">+{formatoBs(completado.tarifa.conductorBs)}</span>
            <span className="bs">≈ {formatoUsd(completado.tarifa.conductor)}</span></div>
          <div className="fare-detail center">
            Comisión Flashrider: −{formatoBs(completado.tarifa.comisionBs)} · Saldo: <strong>{formatoBs(saldo)}</strong>
          </div>
          <button className="btn btn-primary" onClick={() => cerrar(completado.id)}>Listo, otra carrera</button>
        </div>
      )}

      {/* Lista de pedidos en difusión */}
      {!recargando && !cancelado && !completado && !activo && pedidos.length > 0 && (
        <div className="sheet">
          <span className="status-pill"><span className="dot" />{pedidos.length} {pedidos.length === 1 ? 'pedido cercano' : 'pedidos cercanos'} — ¡agárralo!</span>
          <div className="lista-pedidos">
            {pedidos.map(({ v, dist }) => {
              const tp = TIPOS_SERVICIO[v.tipo]
              return (
                <div className="pedido" key={v.id}>
                  <div className="pedido-info">
                    <div className="pedido-top"><TipoIco tipo={v.tipo} size={16} /> {tp.label}{v.comercio ? ` · ${v.comercio.nombre}` : ''} · <strong>{formatoBs(v.tarifa.conductorBs)}</strong> para ti</div>
                    <div className="fare-detail">≈ {formatoUsd(v.tarifa.conductor)} · {v.tarifa.km} km · a {dist.toFixed(1)} km de ti{v.tarifa.esNocturno ? ' · noche' : ''}</div>
                    {v.nota && <div className="nota">{v.nota}</div>}
                  </div>
                  <button className="btn btn-primary pedido-btn" onClick={() => aceptar(v.id)}>Aceptar</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pedido activo */}
      {!recargando && !cancelado && !completado && activo && (
        <div className="sheet">
          <span className="status-pill"><span className="dot" />{
            activo.estado === 'en_camino' ? `Yendo a recoger (${tActivo.label})` :
            activo.estado === 'llego' ? 'Llegaste al punto de recogida' :
            `Llevando ${tActivo.label.toLowerCase()} al destino`
          }</span>
          {activo.nota && <div className="nota">{activo.nota}</div>}
          <div className="fare-detail">
            Ganarás <strong>{formatoBs(activo.tarifa.conductorBs)}</strong> (≈ {formatoUsd(activo.tarifa.conductor)}) · comisión {formatoBs(activo.tarifa.comisionBs)}
          </div>
          {activo.estado === 'llego' && (
            <button className="btn btn-primary" onClick={recogi}>
              {activo.tipo === 'viaje' ? 'Recogí al pasajero — iniciar' : 'Recogí el pedido — iniciar'}
            </button>
          )}
          {activo.estado !== 'llego' && (
            <p className="sub center">Tu ubicación se actualiza en el mapa mientras avanzas.</p>
          )}
        </div>
      )}

      {/* Panel base: saldo, disponibilidad y ganancias */}
      {mostrarPanel && (
        <div className="sheet">
          <div className="driver">
            <div className="avatar">{yo.foto ? <img className="avatar-img" src={yo.foto} alt="" /> : yo.nombre[0]}</div>
            <div>
              <div className="name">{yo.nombre}</div>
              <div className="meta">{yo.modelo_moto} · {yo.placa}</div>
            </div>
            <div className="plate"><Star size={12} filled /> {yo.estrellas}</div>
          </div>

          {/* Reputación y reseñas */}
          <div className="resenas">
            <div className="resenas-h">
              <span className="stars"><Star size={15} filled /></span> {yo.estrellas} · {yo.numResenas || 0} {(yo.numResenas || 0) === 1 ? 'reseña' : 'reseñas'}
            </div>
            {(yo.resenas || []).slice(0, 3).map((r, i) => (
              <div className="resena" key={i}>
                <span className="resena-stars">{'★'.repeat(r.estrellas)}<span className="off">{'★'.repeat(5 - r.estrellas)}</span></span>
                {r.comentario && <span className="resena-txt">"{r.comentario}"</span>}
              </div>
            ))}
            {(yo.numResenas || 0) === 0 && <div className="sub" style={{ fontSize: 12 }}>Aún sin reseñas. ¡Da un buen servicio y construye tu reputación!</div>}
          </div>

          {/* Saldo Flashrider */}
          <div className={'saldo ' + saldoClase}>
            <div>
              <span className="saldo-lbl"><Wallet size={13} /> Saldo Flashrider (comisión)</span>
              <span className="saldo-num">{formatoBs(saldo)} <small>≈ {formatoUsd(saldo / tasa)}</small></span>
            </div>
            <button className="btn-recarga" onClick={() => setRecargando(true)}>Recargar</button>
          </div>
          {(yo.carreras || 0) === 0 && saldo > 0 && (
            <div className="bienvenida">Te regalamos {formatoBs(SALDO_BIENVENIDA)} de saldo para empezar. ¡Trabaja gratis hasta gastarlo!</div>
          )}
          {sinSaldo && <div className="bienvenida rojo">Saldo agotado. Recarga para seguir recibiendo carreras.</div>}

          <div className="stats">
            <div><span className="stat-num">{formatoBs(yo.ganancias || 0)}</span><span className="stat-lbl">ganado hoy</span></div>
            <div><span className="stat-num">{yo.carreras || 0}</span><span className="stat-lbl">carreras</span></div>
          </div>
          <button className={'btn ' + (yo.disponible ? 'btn-sec' : 'btn-primary')}
            onClick={() => ponerseDisponible(!yo.disponible)}>
            <Power size={18} /> {yo.disponible ? 'Disponible — tocar para descansar' : (sinSaldo ? 'Recargar para trabajar' : 'Ponerme disponible')}
          </button>
          {yo.disponible && !sinSaldo && <p className="sub center" style={{ marginTop: 10 }}>Esperando pedidos cercanos…</p>}
        </div>
      )}
    </div>
  )
}

function Registro({ onListo, onCambiarRol }) {
  const [f, setF] = useState({ nombre: '', telefono: '', placa: '', modelo_moto: '' })
  const [foto, setFoto] = useState(null)
  const [acepto, setAcepto] = useState(false)
  const [verLegal, setVerLegal] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  if (verLegal) return <Legal onCerrar={() => setVerLegal(false)} />

  async function elegirFoto(e) {
    const file = e.target.files?.[0]
    if (file) { try { setFoto(await archivoAMiniatura(file)) } catch { /* nada */ } }
  }

  async function registrar(e) {
    e.preventDefault()
    let ubic = UPATA_CENTER
    try { ubic = await ubicacionActual() } catch { /* usa centro */ }
    const c = guardarConductor({
      ...f, foto, verificado: true, disponible: false, estrellas: 5,
      ganancias: 0, carreras: 0, saldo: SALDO_BIENVENIDA, ubicacion: ubic
    })
    onListo(c.id)
  }

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <button className="rol-chip" onClick={onCambiarRol}><Bike size={14} /> Conductor</button>
      </header>
      <form className="sheet" onSubmit={registrar} style={{ marginTop: 'auto' }}>
        <h2>Regístrate como conductor</h2>
        <p className="sub">Únete a los Pioneros Flashrider. Te regalamos {formatoBs(SALDO_BIENVENIDA)} de saldo para arrancar sin poner un bolívar.</p>
        <label className="foto-upload">
          {foto ? <img src={foto} alt="" className="foto-prev" /> : <span className="foto-ph"><Camera size={24} /></span>}
          <span className="foto-txt">{foto ? 'Cambiar foto' : 'Subir tu foto (para que te reconozcan)'}</span>
          <input type="file" accept="image/*" onChange={elegirFoto} hidden />
        </label>
        <input className="campo" placeholder="Nombre y apellido" required value={f.nombre} onChange={set('nombre')} />
        <input className="campo" placeholder="Teléfono (WhatsApp)" required value={f.telefono} onChange={set('telefono')} />
        <input className="campo" placeholder="Placa (ej. AB12CD)" required value={f.placa} onChange={set('placa')} />
        <input className="campo" placeholder="Modelo de moto (ej. Bera SBR 150)" required value={f.modelo_moto} onChange={set('modelo_moto')} />
        <label className="acepto">
          <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
          <span>Acepto los <a onClick={(e) => { e.preventDefault(); setVerLegal(true) }}>Términos y la Política de Privacidad</a></span>
        </label>
        <button className="btn btn-primary" type="submit" disabled={!acepto}><Bike size={19} /> Empezar — gratis los primeros {formatoBs(SALDO_BIENVENIDA)}</button>
      </form>
    </div>
  )
}
