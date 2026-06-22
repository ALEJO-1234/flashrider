import { useEffect, useState } from 'react'
import MapaViaje from './components/MapaViaje.jsx'
import { UPATA_CENTER, TIPOS_SERVICIO, TARIFAS_FIJAS, CANCELACION, VELOCIDAD_MOTO_KMH, RADIO_PEDIDOS_KM, SOLO_MOTOTAXI } from './lib/config.js'
import { ubicacionActual, distanciaKm, etaMinutos } from './lib/geo.js'
import { calcularTarifa, formatoUsd, formatoBs } from './lib/fare.js'
import { useTasa } from './lib/bcv.js'
import { compartirViaje, alertaEmergencia } from './lib/acciones.js'
import { crearViaje, actualizarViaje, ajustarSaldo, calificarConductor } from './lib/backend.js'
import { useViajes, useConductores, useComercios } from './lib/useDatos.js'
import { Logo, User, Pin, Alert, Star, Send, X, Clock, Bike, Store, ChevronRight, TipoIco } from './icons.jsx'

export default function PasajeroApp({ onCambiarRol }) {
  const [origen, setOrigen] = useState(null)
  const [tipo, setTipo] = useState('viaje')
  const [destino, setDestino] = useState(null)
  const [nota, setNota] = useState('')
  const [viajeId, setViajeId] = useState(null)
  const [aviso, setAviso] = useState('')
  const [comercioSel, setComercioSel] = useState(null) // comercio elegido para delivery

  const tasa = useTasa()
  const viajes = useViajes()
  const conductores = useConductores()
  const comercios = useComercios()
  const comerciosAbiertos = comercios.filter((c) => c.verificado && c.abierto)
  const viaje = viajes.find((v) => v.id === viajeId)

  // En viaje la tarifa se calcula origen→destino marcado en el mapa.
  // En delivery se calcula del comercio elegido hasta tu ubicación.
  const tarifa = tipo === 'delivery'
    ? (comercioSel && origen ? calcularTarifa(comercioSel.ubicacion, origen, new Date(), 'delivery', tasa) : null)
    : (origen && destino ? calcularTarifa(origen, destino, new Date(), tipo, tasa) : null)

  // Motos disponibles cerca + la más cercana (transparencia de tiempo de espera).
  const cercanas = origen
    ? conductores
        .filter((c) => c.verificado && c.disponible && c.ubicacion)
        .map((c) => ({ c, dist: distanciaKm(c.ubicacion, origen) }))
        .filter((x) => x.dist <= RADIO_PEDIDOS_KM)
        .sort((a, b) => a.dist - b.dist)
    : []
  const masCercana = cercanas[0]

  // Ubicación automática al abrir.
  useEffect(() => {
    ubicacionActual().then(setOrigen).catch(() => {
      setOrigen(UPATA_CENTER); setAviso('Activa la ubicación para mayor precisión.')
    })
  }, [])

  function pedir() {
    // DELIVERY: el viaje va del comercio (origen) a tu casa (destino). Primero
    // lo recibe el comercio para confirmar; luego se difunde a los motorizados.
    if (tipo === 'delivery') {
      const t = calcularTarifa(comercioSel.ubicacion, origen, new Date(), 'delivery', tasa)
      const nuevo = crearViaje({
        tipo, origen: comercioSel.ubicacion, destino: origen, nota,
        tarifa: t, estado: 'pendiente_comercio',
        comercio_id: comercioSel.id, comercio: { nombre: comercioSel.nombre, tipo: comercioSel.tipo }
      })
      setViajeId(nuevo.id)
      return
    }
    const t = calcularTarifa(origen, destino, new Date(), tipo, tasa)
    // Se difunde a las motos cercanas; la primera que acepte la bloquea.
    const nuevo = crearViaje({ tipo, origen, destino, nota, tarifa: t })
    setViajeId(nuevo.id)
  }

  // Cancelar. Si la moto ya salió, se cobra tarifa de cancelación y se le
  // compensa al conductor (fue hasta el sitio).
  function cancelar() {
    if (!viaje) { reiniciar(); return }
    const motoEnCamino = ['en_camino', 'llego'].includes(viaje.estado)
    if (motoEnCamino) {
      const ok = confirm(
        `La moto ya salió hacia ti. Si cancelas se cobra ${formatoBs(CANCELACION)} ` +
        `por la salida del conductor. ¿Cancelar de todos modos?`
      )
      if (!ok) return
      // Compensación al conductor: se le abona a su saldo (Flashrider lo cubre).
      if (viaje.conductor_id) ajustarSaldo(viaje.conductor_id, CANCELACION)
      actualizarViaje(viaje.id, { estado: 'cancelado', cancelacion_fee: CANCELACION })
      alert(`Carrera cancelada. Se cobró ${formatoBs(CANCELACION)} por cancelación.`)
    } else {
      actualizarViaje(viaje.id, { estado: 'cancelado' })
    }
    reiniciar()
  }
  function reiniciar() { setViajeId(null); setDestino(null); setNota(''); setComercioSel(null) }

  function emergencia() {
    const contacto = prompt('Número de tu contacto de confianza (ej. 584120000000):', '')
    if (contacto !== null) alertaEmergencia(viaje?.moto || origen, contacto)
  }

  const enViaje = viaje && ['en_camino', 'llego', 'en_curso'].includes(viaje.estado)
  const t = TIPOS_SERVICIO[tipo]

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <button className="rol-chip" onClick={onCambiarRol}><User size={14} /> Pasajero</button>
      </header>

      <div className="map-wrap">
        {!viaje && tipo !== 'delivery' && !destino && <div className="map-hint"><Pin size={15} /> Toca el mapa para marcar tu destino</div>}
        <MapaViaje origen={tipo === 'delivery' ? (comercioSel?.ubicacion || origen) : origen} destino={tipo === 'delivery' ? origen : destino}
          moto={viaje?.moto} center={origen || UPATA_CENTER} onPick={!viaje && tipo !== 'delivery' ? setDestino : null} />
        {enViaje && <button className="emergencia" onClick={emergencia}><Alert size={20} />SOS</button>}
      </div>

      {!viaje && (
        <div className="sheet">
          <div className="tipos">
            {Object.entries(TIPOS_SERVICIO).map(([k, v]) => {
              const pronto = SOLO_MOTOTAXI && k !== 'viaje'
              return (
                <button key={k} disabled={pronto}
                  className={'tipo' + (tipo === k ? ' on' : '') + (pronto ? ' soon' : '')}
                  onClick={() => !pronto && setTipo(k)}>
                  {pronto && <span className="soon-badge">Pronto</span>}
                  <span className="tipo-ico"><TipoIco tipo={k} size={22} /></span>{v.label}
                </button>
              )
            })}
          </div>

          {tipo === 'delivery' ? (
            // ===== Flujo de DELIVERY: elegir comercio y pedir =====
            !comercioSel ? (
              <>
                <p className="sub">Elige un comercio afiliado:</p>
                {comerciosAbiertos.length === 0 && <p className="sub center">Aún no hay comercios afiliados abiertos. Vuelve pronto.</p>}
                <div className="lista-pedidos">
                  {comerciosAbiertos.map((c) => (
                    <button key={c.id} className="pedido" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setComercioSel(c)}>
                      <div className="avatar" style={{ width: 42, height: 42, borderRadius: 12 }}><Store size={20} /></div>
                      <div className="pedido-info">
                        <div className="pedido-top">{c.nombre}</div>
                        <div className="fare-detail">{c.tipo}{c.vende ? ` · ${c.vende}` : ''}</div>
                      </div>
                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="driver">
                  <div className="avatar"><Store size={22} /></div>
                  <div><div className="name">{comercioSel.nombre}</div><div className="meta">{comercioSel.tipo}</div></div>
                  <button className="rol-chip" onClick={() => setComercioSel(null)}>Cambiar</button>
                </div>
                <textarea rows={2} placeholder="¿Qué pides? (ej. 2 pizzas familiares y una malta)"
                  value={nota} onChange={(e) => setNota(e.target.value)} />
                {tarifa && (
                  <>
                    <div className="fare"><span className="usd">{formatoBs(tarifa.bs)}</span><span className="bs">≈ {formatoUsd(tarifa.usd)}</span></div>
                    <div className="fare-detail">Costo del delivery (la comida la pagas aparte al comercio){tarifa.esNocturno && <span className="badge-noche"> · nocturno</span>}</div>
                  </>
                )}
                <button className="btn btn-primary" disabled={!origen || !nota.trim()} onClick={pedir}>
                  <Store size={20} /> Pedir delivery
                </button>
              </>
            )
          ) : (
            // ===== Flujo de VIAJE =====
            <>
              <p className="sub">{destino ? '¿Confirmas tu carrera?' : 'Marca tu destino en el mapa.'}</p>

              {tarifa && (
                <>
                  <div className="fare">
                    <span className="usd">{formatoBs(tarifa.bs)}</span>
                    <span className="bs">≈ {formatoUsd(tarifa.usd)}</span>
                  </div>
                  <div className="fare-detail">
                    {TARIFAS_FIJAS[tarifa.categoria].label} · precio fijo · efectivo o Pago Móvil
                    {tarifa.esNocturno && <span className="badge-noche"> · nocturno</span>}
                  </div>
                </>
              )}

              {origen && (
                <div className={'disponibilidad' + (masCercana ? ' on' : '')}>
                  {masCercana
                    ? <><Clock size={16} /> Moto más cercana: <strong>~{etaMinutos(masCercana.dist, VELOCIDAD_MOTO_KMH)} min</strong> · {cercanas.length} en línea</>
                    : <><Clock size={16} /> No hay motos en línea ahora. Puedes pedir igual y esperar.</>}
                </div>
              )}

              <button className="btn btn-primary" disabled={!origen || !destino} onClick={pedir}>
                <TipoIco tipo={tipo} size={20} /> Pedir {t.label.toLowerCase()}
              </button>
            </>
          )}
          {aviso && <p className="sub center" style={{ marginTop: 8 }}>{aviso}</p>}
        </div>
      )}

      {viaje?.estado === 'pendiente_comercio' && (
        <div className="sheet center">
          <div className="spinner" />
          <h2>Esperando al comercio…</h2>
          <p className="sub">{viaje.comercio?.nombre} está confirmando tu pedido. En breve sale un motorizado a recogerlo.</p>
          <button className="btn btn-ghost" onClick={cancelar}>Cancelar</button>
        </div>
      )}

      {viaje?.estado === 'buscando' && (
        <div className="sheet center">
          <div className="spinner" />
          <h2>{viaje.tipo === 'delivery' ? 'Buscando motorizado para tu delivery…' : `Buscando tu ${t.label.toLowerCase()}…`}</h2>
          <p className="sub">
            {viaje.tipo === 'delivery'
              ? 'El comercio aceptó. Un motorizado lo recoge y te lo lleva.'
              : `Avisamos a ${cercanas.length} ${cercanas.length === 1 ? 'moto cercana' : 'motos cercanas'}. La primera que acepte te recoge — sin sobreprecio.`}
          </p>
          <button className="btn btn-ghost" onClick={cancelar}>Cancelar</button>
        </div>
      )}

      {enViaje && (
        <div className="sheet">
          <span className="status-pill"><span className="dot" />{
            viaje.estado === 'en_camino' ? 'Tu moto va en camino' :
            viaje.estado === 'llego' ? '¡Tu moto llegó!' :
            'En camino a tu destino'
          }</span>
          <div className="driver">
            <div className="avatar">{viaje.conductor?.foto ? <img className="avatar-img" src={viaje.conductor.foto} alt="" /> : viaje.conductor?.inicial}</div>
            <div>
              <div className="name">{viaje.conductor?.nombre}</div>
              <div className="meta">
                <span className="stars"><Star size={13} filled /></span> {viaje.conductor?.estrellas}
                {viaje.conductor?.numResenas ? ` (${viaje.conductor.numResenas})` : ' · nuevo'} · {viaje.conductor?.moto}
              </div>
            </div>
            <div className="plate">{viaje.conductor?.placa}</div>
          </div>
          <div className="fare-detail"><TipoIco tipo={tipo} size={15} /> {t.label} · <strong>{formatoBs(viaje.tarifa.bs)}</strong> (≈ {formatoUsd(viaje.tarifa.usd)})</div>
          <div className="btn-row">
            <button className="btn btn-sec" onClick={() => compartirViaje(viaje.moto || origen)}><Send size={17} /> Compartir</button>
            <button className="btn btn-sec" onClick={cancelar}><X size={17} /> Cancelar</button>
          </div>
          {['en_camino', 'llego'].includes(viaje.estado) && (
            <p className="sub center" style={{ marginTop: 8, fontSize: 11 }}>
              Cancelar ahora cobra {formatoBs(CANCELACION)} (la moto ya salió).
            </p>
          )}
        </div>
      )}

      {viaje?.estado === 'completado' && <Calificar viaje={viaje} onListo={reiniciar} />}
    </div>
  )
}

function Calificar({ viaje, onListo }) {
  const [estrellas, setEstrellas] = useState(0)
  const [comentario, setComentario] = useState('')

  function enviar() {
    // Guarda la calificación y actualiza la reputación del conductor.
    if (viaje?.conductor_id) calificarConductor(viaje.conductor_id, estrellas, comentario)
    actualizarViaje(viaje.id, { calificacion: estrellas, comentario })
    onListo()
  }

  return (
    <div className="sheet center">
      <h2>¿Qué tal {viaje?.conductor?.nombre?.split(' ')[0] || 'tu conductor'}?</h2>
      <p className="sub">Tu opinión cuida a la comunidad Flashrider. Califica el trato y el servicio.</p>
      <div className="stars-input">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={'star' + (n <= estrellas ? ' on' : '')} onClick={() => setEstrellas(n)}>
            <Star size={36} filled={n <= estrellas} />
          </span>
        ))}
      </div>
      <textarea rows={2} placeholder="Deja un comentario (¿fue puntual? ¿amable? ¿manejó bien?)"
        value={comentario} onChange={(e) => setComentario(e.target.value)} />
      <button className="btn btn-primary" disabled={!estrellas} onClick={enviar}>Enviar reseña</button>
      <button className="btn btn-ghost" onClick={onListo}>Ahora no</button>
    </div>
  )
}
