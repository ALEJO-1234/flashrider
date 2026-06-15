import { distanciaKm, pasoHacia } from './geo.js'

// Calcula la RUTA POR LAS CALLES entre dos puntos (no línea recta) usando OSRM
// (servicio público gratuito de OpenStreetMap). Si falla, cae a línea recta.
// Para producción conviene un servidor de rutas propio o un proveedor con plan.

const cache = new Map()

export async function obtenerRuta(a, b) {
  const key = `${a.lat.toFixed(5)},${a.lng.toFixed(5)};${b.lat.toFixed(5)},${b.lng.toFixed(5)}`
  if (cache.has(key)) return cache.get(key)
  const recta = [a, b]
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`
    const r = await fetch(url)
    const data = await r.json()
    const coords = data?.routes?.[0]?.geometry?.coordinates
    if (Array.isArray(coords) && coords.length > 1) {
      const pts = coords.map(([lng, lat]) => ({ lat, lng }))
      cache.set(key, pts)
      return pts
    }
  } catch { /* sin conexión / sin servicio: usamos línea recta */ }
  cache.set(key, recta)
  return recta
}

// Largo total de una polilínea (km).
export function largoRuta(pts) {
  let d = 0
  for (let i = 1; i < pts.length; i++) d += distanciaKm(pts[i - 1], pts[i])
  return d
}

// Punto ubicado a 'distKm' a lo largo de la polilínea (para mover la moto).
export function posicionEnRuta(pts, distKm) {
  if (!pts || pts.length < 2) return pts?.[0]
  let acc = 0
  for (let i = 1; i < pts.length; i++) {
    const seg = distanciaKm(pts[i - 1], pts[i])
    if (acc + seg >= distKm) {
      const f = seg > 0 ? (distKm - acc) / seg : 0
      return pasoHacia(pts[i - 1], pts[i], f)
    }
    acc += seg
  }
  return pts[pts.length - 1]
}
