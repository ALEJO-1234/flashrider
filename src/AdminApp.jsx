import { useState } from 'react'
import { UPATA_CENTER, SALDO_BIENVENIDA, TIPOS_SERVICIO } from './lib/config.js'
import { formatoUsd, formatoBs } from './lib/fare.js'
import { useTasa } from './lib/bcv.js'
import { getTarifas, getComision, guardarAjustes } from './lib/ajustes.js'
import { guardarConductor, actualizarConductor, ajustarSaldo } from './lib/backend.js'
import { useConductores, useViajes } from './lib/useDatos.js'
import { Logo, Settings, Plus, Star, TipoIco, Check } from './icons.jsx'

const NOMBRES = ['José Pérez', 'María González', 'Luis Rodríguez', 'Ana Martínez', 'Pedro Gómez', 'Carmen Díaz']
const MOTOS = ['Bera SBR 150', 'Empire Owen', 'Suzuki AX100', 'Bera Socialista', 'Haojin']

export default function AdminApp({ onCambiarRol }) {
  const [tab, setTab] = useState('resumen')
  const [verResenas, setVerResenas] = useState(null)

  const tasa = useTasa()
  const conductores = useConductores()
  const viajes = useViajes()

  // Métricas
  const activos = conductores.filter((c) => c.verificado && c.disponible).length
  const completados = viajes.filter((v) => v.estado === 'completado')
  const comisionHoy = completados.reduce((s, v) => s + (v.tarifa?.comisionBs || 0), 0)
  const saldoTotal = conductores.reduce((s, c) => s + (c.saldo || 0), 0)

  function crearConductorPrueba() {
    const n = NOMBRES[Math.floor(Math.random() * NOMBRES.length)]
    guardarConductor({
      nombre: n, telefono: '58412' + Math.floor(1000000 + Math.random() * 8999999),
      placa: letras(2) + Math.floor(10 + Math.random() * 89) + letras(2),
      modelo_moto: MOTOS[Math.floor(Math.random() * MOTOS.length)],
      verificado: true, disponible: true, estrellas: 5, numResenas: 0, resenas: [],
      ganancias: 0, carreras: 0, saldo: SALDO_BIENVENIDA,
      ubicacion: { lat: UPATA_CENTER.lat + (Math.random() - 0.5) * 0.02, lng: UPATA_CENTER.lng + (Math.random() - 0.5) * 0.02 }
    })
  }

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <span className="admin-tag">ADMIN</span>
        <button className="rol-chip" onClick={onCambiarRol}><Settings size={14} /> Admin</button>
      </header>

      <div className="tabs">
        {[['resumen', 'Resumen'], ['conductores', 'Conductores'], ['viajes', 'Viajes'], ['tarifas', 'Tarifas']].map(([k, l]) => (
          <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div className="admin-body">
        {tab === 'resumen' && (
          <>
            <div className="metrics">
              <Metric num={conductores.length} lbl="conductores" />
              <Metric num={activos} lbl="disponibles ahora" />
              <Metric num={completados.length} lbl="carreras" />
              <Metric num={formatoBs(comisionHoy)} lbl="comisión ganada" />
            </div>
            <div className="metrics">
              <Metric num={formatoBs(saldoTotal)} lbl="saldo en circulación" />
              <Metric num={'Bs ' + Math.round(tasa).toLocaleString('es-VE')} lbl="tasa BCV hoy" />
            </div>
            <p className="sub">La comisión ganada ya está en tu cuenta: los conductores la pagan por adelantado al recargar saldo.</p>
          </>
        )}

        {tab === 'conductores' && (
          <>
            <button className="btn btn-sec" onClick={crearConductorPrueba}><Plus size={18} /> Agregar conductor de prueba</button>
            {conductores.length === 0 && <p className="sub center">Aún no hay conductores. Crea uno de prueba para empezar.</p>}
            {conductores.map((c) => (
              <div className="admin-row" key={c.id}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div className="avatar" style={{ width: 44, height: 44, borderRadius: 12, fontSize: 18, flexShrink: 0 }}>
                  {c.foto ? <img className="avatar-img" src={c.foto} alt="" /> : (c.nombre?.[0] || '?')}
                </div>
                <div className="admin-main">
                  <div className="admin-nombre">
                    {c.nombre}
                    {!c.verificado && <span className="badge rojo">suspendido</span>}
                    {c.verificado && c.disponible && <span className="badge verde">en línea</span>}
                  </div>
                  <div className="admin-meta">
                    {c.modelo_moto} · {c.placa} · <span className="stars"><Star size={13} filled /></span> {c.estrellas} ({c.numResenas || 0})
                  </div>
                  <div className="admin-meta">
                    Saldo: <strong>{formatoBs(c.saldo || 0)}</strong> · {c.carreras || 0} carreras · ganó {formatoBs(c.ganancias || 0)}
                  </div>
                </div>
                </div>
                <div className="admin-actions">
                  <button className="mini-btn" onClick={() => actualizarConductor(c.id, { verificado: !c.verificado, disponible: c.verificado ? false : c.disponible })}>
                    {c.verificado ? 'Suspender' : 'Verificar'}
                  </button>
                  <button className="mini-btn" onClick={() => ajustarSaldo(c.id, 5000)}>+Bs 5.000</button>
                  <button className="mini-btn" onClick={() => setVerResenas(verResenas === c.id ? null : c.id)}>
                    Reseñas ({c.numResenas || 0})
                  </button>
                </div>
                {verResenas === c.id && (
                  <div className="admin-resenas">
                    {(c.resenas || []).length === 0 && <div className="sub">Sin reseñas todavía.</div>}
                    {(c.resenas || []).map((r, i) => (
                      <div className="resena" key={i}>
                        <span className="resena-stars">{'★'.repeat(r.estrellas)}<span className="off">{'★'.repeat(5 - r.estrellas)}</span></span>
                        {r.comentario && <span className="resena-txt">"{r.comentario}"</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {tab === 'viajes' && (
          <>
            {viajes.length === 0 && <p className="sub center">Aún no hay viajes.</p>}
            {[...viajes].reverse().map((v) => {
              const c = conductores.find((x) => x.id === v.conductor_id)
              return (
                <div className="admin-row" key={v.id}>
                  <div className="admin-main">
                    <div className="admin-nombre"><TipoIco tipo={v.tipo} size={16} /> {TIPOS_SERVICIO[v.tipo].label} · {formatoBs(v.tarifa.bs)}</div>
                    <div className="admin-meta">{c ? c.nombre : 'sin asignar'} · comisión {formatoBs(v.tarifa.comisionBs)}</div>
                  </div>
                  <span className={'badge ' + estadoColor(v.estado)}>{estadoTexto(v.estado)}</span>
                </div>
              )
            })}
          </>
        )}

        {tab === 'tarifas' && <Tarifas />}
      </div>
    </div>
  )
}

function Metric({ num, lbl }) {
  return <div className="metric"><span className="metric-num">{num}</span><span className="metric-lbl">{lbl}</span></div>
}

function Tarifas() {
  const T = getTarifas()
  const [corta, setCorta] = useState(T.corta.bs)
  const [medMin, setMedMin] = useState(T.mediana.bsMin ?? T.mediana.bs ?? 1500)
  const [medMax, setMedMax] = useState(T.mediana.bsMax ?? T.mediana.bs ?? 2000)
  const [larga, setLarga] = useState(T.larga.bs)
  const [foranea, setForanea] = useState(T.foranea?.bs ?? 5000)
  const [comision, setComision] = useState(Math.round(getComision() * 100))
  const [guardado, setGuardado] = useState(false)

  function guardar() {
    guardarAjustes({
      tarifas: {
        corta: { ...T.corta, bs: Number(corta) },
        mediana: { ...T.mediana, bsMin: Number(medMin), bsMax: Number(medMax) },
        larga: { ...T.larga, bs: Number(larga) },
        foranea: { ...(T.foranea || { label: 'Foránea (afueras)', maxKm: 999 }), bs: Number(foranea) }
      },
      comision: Number(comision) / 100
    })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  const fila = (lbl, val, set) => (
    <label className="tarifa-fila">
      <span>{lbl} <small>(lo que gana el conductor)</small></span>
      <span className="tarifa-input">Bs <input type="number" step="50" value={val} onChange={(e) => set(e.target.value)} /></span>
    </label>
  )

  return (
    <div>
      <p className="sub">Edita las tarifas en bolívares sin tocar código. El pasajero paga la tarifa + tu comisión.</p>
      {fila('Carrera corta', corta, setCorta)}
      <label className="tarifa-fila">
        <span>Carrera media <small>(sube por distancia: mín–máx)</small></span>
        <span className="tarifa-input">
          Bs <input type="number" step="50" value={medMin} onChange={(e) => setMedMin(e.target.value)} style={{ width: 64 }} />
          <span style={{ color: 'var(--txt-3)' }}>–</span>
          <input type="number" step="50" value={medMax} onChange={(e) => setMedMax(e.target.value)} style={{ width: 64 }} />
        </span>
      </label>
      {fila('Carrera larga', larga, setLarga)}
      {fila('Foránea (afueras)', foranea, setForanea)}
      <label className="tarifa-fila">
        <span>Comisión Flashrider <small>(la paga el pasajero)</small></span>
        <span className="tarifa-input"><input type="number" step="1" value={comision} onChange={(e) => setComision(e.target.value)} />%</span>
      </label>
      <div className="nota">Ejemplo: carrera corta de {formatoBs(Number(corta))} → el pasajero paga {formatoBs(Number(corta) * (1 + Number(comision) / 100))} y tú ganas {formatoBs(Number(corta) * Number(comision) / 100)}.</div>
      <button className="btn btn-primary" onClick={guardar}>{guardado ? <><Check size={18} /> Guardado</> : 'Guardar tarifas'}</button>
    </div>
  )
}

function estadoTexto(e) {
  return { buscando: 'buscando', en_camino: 'en camino', llego: 'llegó', en_curso: 'en curso', completado: 'completado', cancelado: 'cancelado', sin_conductor: 'sin conductor' }[e] || e
}
function estadoColor(e) {
  if (e === 'completado') return 'verde'
  if (e === 'cancelado' || e === 'sin_conductor') return 'rojo'
  return 'amarillo'
}
function letras(n) {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  return Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join('')
}
