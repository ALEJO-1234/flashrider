import { distanciaKm } from './geo.js'

// Asignación automática estilo Uber: busca el conductor DISPONIBLE más cercano
// al origen del pedido, que no lo haya rechazado ya.
// El día de Supabase, esto correría en el servidor (Edge Function); aquí corre
// en la app del pasajero para la demo local.
export function conductorMasCercano(conductores, origen, rechazados = []) {
  const candidatos = conductores
    .filter((c) => c.verificado && c.disponible && c.ubicacion && !rechazados.includes(c.id))
    .map((c) => ({ c, dist: distanciaKm(c.ubicacion, origen) }))
    .sort((a, b) => a.dist - b.dist)

  return candidatos.length ? candidatos[0].c : null
}
