import { supabase } from './supabase.js'

// === Backend ===
// Funciona en dos modos automáticamente:
//  - LOCAL (sin claves de Supabase): localStorage + BroadcastChannel, una sola
//    máquina. Útil para demo y desarrollo.
//  - NUBE (con Supabase configurado): la misma caché local se mantiene
//    sincronizada en tiempo real con la base de datos, así funciona entre
//    teléfonos distintos. Las lecturas siguen siendo instantáneas (desde caché).

const KEY = { conductores: 'upa_conductores', viajes: 'upa_viajes', comercios: 'upa_comercios' }
const COLECCIONES = Object.keys(KEY)
const canal = new BroadcastChannel('upa-moto')
const oyentes = new Set()

// Caché en memoria (fuente de las lecturas). Se inicializa desde localStorage.
const cache = {}
for (const c of COLECCIONES) {
  try { cache[c] = JSON.parse(localStorage.getItem(KEY[c]) || '[]') } catch { cache[c] = [] }
}

function persistir(col) { try { localStorage.setItem(KEY[col], JSON.stringify(cache[col])) } catch { /* lleno */ } }
function notificar(col) { oyentes.forEach((fn) => fn(col)) }
// Cambio local: guarda, avisa a otras pestañas y a esta.
function cambioLocal(col) { persistir(col); canal.postMessage({ coleccion: col }); notificar(col) }

canal.onmessage = (e) => {
  const col = e.data?.coleccion
  if (!col) return
  try { cache[col] = JSON.parse(localStorage.getItem(KEY[col]) || '[]') } catch { /* nada */ }
  notificar(col)
}
window.addEventListener('storage', (e) => {
  const col = COLECCIONES.find((k) => KEY[k] === e.key)
  if (col) { try { cache[col] = JSON.parse(e.newValue || '[]') } catch { /* nada */ } notificar(col) }
})

export function suscribir(fn) { oyentes.add(fn); return () => oyentes.delete(fn) }

const uuid = () =>
  (crypto.randomUUID && crypto.randomUUID()) ||
  'id-' + Date.now() + '-' + Math.random().toString(16).slice(2)

function upsertCache(col, row) {
  const i = cache[col].findIndex((x) => x.id === row.id)
  if (i >= 0) cache[col][i] = row
  else cache[col].push(row)
}

// ---- Sincronización con Supabase (solo si está configurado) ----
function fila(col, obj) {
  const base = { id: obj.id, data: obj, updated_at: new Date().toISOString() }
  if (col === 'viajes') return { ...base, estado: obj.estado || null, conductor_id: obj.conductor_id || null, comercio_id: obj.comercio_id || null }
  return base
}
function sbGuardar(col, obj) {
  if (!supabase) return
  supabase.from(col).upsert(fila(col, obj)).then(({ error }) => {
    if (error) console.warn('[Supabase] guardar', col, error.message)
  })
}

if (supabase) {
  // Carga inicial desde la nube.
  for (const col of COLECCIONES) {
    supabase.from(col).select('id,data').then(({ data, error }) => {
      if (error) { console.warn('[Supabase] cargar', col, error.message); return }
      cache[col] = (data || []).map((r) => r.data)
      persistir(col); notificar(col)
    })
  }
  // Tiempo real: cualquier cambio en la nube actualiza la caché.
  supabase.channel('upa-realtime')
    .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
      const col = payload.table
      if (!KEY[col]) return
      if (payload.eventType === 'DELETE') {
        cache[col] = cache[col].filter((x) => x.id !== payload.old?.id)
      } else if (payload.new?.data) {
        upsertCache(col, payload.new.data)
      }
      persistir(col); notificar(col)
    })
    .subscribe()
}

// ---- Conductores ----
export function obtenerConductores() { return cache.conductores }

export function guardarConductor(c) {
  c.id = c.id || uuid()
  upsertCache('conductores', c)
  cambioLocal('conductores'); sbGuardar('conductores', c)
  return c
}

export function actualizarConductor(id, patch) {
  const i = cache.conductores.findIndex((x) => x.id === id)
  if (i < 0) return
  cache.conductores[i] = { ...cache.conductores[i], ...patch }
  cambioLocal('conductores'); sbGuardar('conductores', cache.conductores[i])
}

export function calificarConductor(id, estrellas, comentario) {
  const i = cache.conductores.findIndex((x) => x.id === id)
  if (i < 0) return
  const c = cache.conductores[i]
  const num = c.numResenas || 0
  const prom = num > 0 ? (c.estrellas || 5) : 0
  const nuevoNum = num + 1
  const nuevoProm = Math.round(((prom * num + estrellas) / nuevoNum) * 10) / 10
  const resenas = [{ estrellas, comentario: (comentario || '').trim(), fecha: Date.now() }, ...(c.resenas || [])].slice(0, 20)
  cache.conductores[i] = { ...c, estrellas: nuevoProm, numResenas: nuevoNum, resenas }
  cambioLocal('conductores'); sbGuardar('conductores', cache.conductores[i])
}

export function ajustarSaldo(id, delta) {
  const i = cache.conductores.findIndex((x) => x.id === id)
  if (i < 0) return null
  cache.conductores[i] = { ...cache.conductores[i], saldo: Math.round(((cache.conductores[i].saldo || 0) + delta) * 100) / 100 }
  cambioLocal('conductores'); sbGuardar('conductores', cache.conductores[i])
  return cache.conductores[i].saldo
}

// ---- Comercios ----
export function obtenerComercios() { return cache.comercios }

export function guardarComercio(c) {
  c.id = c.id || uuid()
  upsertCache('comercios', c)
  cambioLocal('comercios'); sbGuardar('comercios', c)
  return c
}

export function actualizarComercio(id, patch) {
  const i = cache.comercios.findIndex((x) => x.id === id)
  if (i < 0) return
  cache.comercios[i] = { ...cache.comercios[i], ...patch }
  cambioLocal('comercios'); sbGuardar('comercios', cache.comercios[i])
}

// ---- Viajes / pedidos ----
export function obtenerViajes() { return cache.viajes }
export function obtenerViaje(id) { return cache.viajes.find((x) => x.id === id) }

export function crearViaje(v) {
  const viaje = { id: uuid(), estado: 'buscando', rechazados: [], creado_en: Date.now(), ...v }
  upsertCache('viajes', viaje)
  cambioLocal('viajes'); sbGuardar('viajes', viaje)
  return viaje
}

export function actualizarViaje(id, patch) {
  const i = cache.viajes.findIndex((x) => x.id === id)
  if (i < 0) return
  cache.viajes[i] = { ...cache.viajes[i], ...patch }
  cambioLocal('viajes'); sbGuardar('viajes', cache.viajes[i])
  return cache.viajes[i]
}

// ACEPTACIÓN CON BLOQUEO (anti-robo de clientes). En la nube usa una condición
// atómica (solo actualiza si sigue 'buscando' y sin conductor) para que dos
// motorizados no la tomen a la vez. En local, revisa la caché.
export async function aceptarViaje(id, conductor) {
  const actual = cache.viajes.find((x) => x.id === id)
  if (!actual) return { ok: false, motivo: 'no_existe' }
  if (actual.conductor_id || actual.estado !== 'buscando') return { ok: false, motivo: 'tomada' }

  const aceptado = {
    ...actual,
    conductor_id: conductor.id,
    conductor: {
      nombre: conductor.nombre, placa: conductor.placa, moto: conductor.modelo_moto,
      estrellas: conductor.estrellas, numResenas: conductor.numResenas || 0,
      foto: conductor.foto || null, inicial: conductor.nombre[0], telefono: conductor.telefono
    },
    estado: 'en_camino', moto: conductor.ubicacion, aceptado_en: Date.now()
  }

  if (supabase) {
    // Bloqueo atómico en la base de datos.
    const { data, error } = await supabase.from('viajes')
      .update(fila('viajes', aceptado))
      .eq('id', id).eq('estado', 'buscando').is('conductor_id', null)
      .select()
    if (error) return { ok: false, motivo: 'error' }
    if (!data || data.length === 0) return { ok: false, motivo: 'tomada' }
    upsertCache('viajes', data[0].data); cambioLocal('viajes')
    return { ok: true, viaje: data[0].data }
  }

  upsertCache('viajes', aceptado); cambioLocal('viajes'); sbGuardar('viajes', aceptado)
  return { ok: true, viaje: aceptado }
}

// Utilidad para limpiar todo (local).
export function reiniciarTodo() {
  for (const c of COLECCIONES) { cache[c] = []; localStorage.removeItem(KEY[c]); canal.postMessage({ coleccion: c }); notificar(c) }
}
