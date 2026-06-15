import { TIPOS_SERVICIO, RECARGO_NOCTURNO, HORA_NOCTURNO } from './config.js'
import { getTarifas, getComision } from './ajustes.js'
import { getTasa } from './bcv.js'
import { distanciaKm } from './geo.js'

// Clasifica una distancia en categoría de tarifa fija (corta/media/larga/foránea).
export function clasificar(km) {
  const T = getTarifas()
  if (km <= T.corta.maxKm) return 'corta'
  if (km <= T.mediana.maxKm) return 'mediana'
  if (km <= T.larga.maxKm) return 'larga'
  return 'foranea'
}

// Calcula la tarifa FIJA de un pedido (EN BOLÍVARES). El GPS solo elige la
// categoría; el precio es fijo. Devuelve: lo que se queda el conductor (Bs),
// tu comisión (Bs), el total que paga el pasajero (Bs), y el equivalente en
// USD como referencia (tasa BCV).
export function calcularTarifa(origen, destino, fecha = new Date(), tipo = 'viaje', tasa = getTasa()) {
  const km = Math.round(distanciaKm(origen, destino) * 10) / 10
  const categoria = clasificar(km)

  // Precio base de la categoría. Si tiene rango (bsMin/bsMax), sube por distancia
  // dentro del tramo (pasos de 100). Si no, es fijo (bs).
  const ent = getTarifas()[categoria]
  let baseCat
  if (ent.bsMin != null) {
    const lo = ent.minKm ?? 0, hi = ent.maxKm
    const frac = Math.min(1, Math.max(0, (km - lo) / (hi - lo)))
    baseCat = Math.round((ent.bsMin + frac * (ent.bsMax - ent.bsMin)) / 100) * 100
  } else {
    baseCat = ent.bs
  }

  // Base en Bs = tarifa de la calle del conductor + extra por tipo de servicio.
  let base = baseCat + (TIPOS_SERVICIO[tipo]?.recargo || 0)

  const esNocturno = fecha.getHours() >= HORA_NOCTURNO
  if (esNocturno) base *= 1 + RECARGO_NOCTURNO

  const conductorBs = redondear(base)                       // lo que se queda el motorizado
  const totalBs = redondear(base * (1 + getComision()))     // lo que paga el pasajero
  const comisionBs = totalBs - conductorBs                  // tu ganancia (Bs)

  return {
    km, categoria, esNocturno,
    bs: totalBs,                          // precio que ve y paga el pasajero (Bs)
    conductorBs, comisionBs,
    usd: redondearUsd(totalBs / tasa),    // referencia en dólares
    conductor: redondearUsd(conductorBs / tasa),
    comision: redondearUsd(comisionBs / tasa)
  }
}

// Redondea bolívares a múltiplos de 50 para precios "limpios" al cobrar.
function redondear(n) { return Math.round(n / 50) * 50 }
function redondearUsd(n) { return Math.round(n * 100) / 100 }

// Formatos al estilo venezolano.
export function formatoBs(n) {
  return 'Bs ' + Math.round(n || 0).toLocaleString('es-VE')
}
export function formatoUsd(n) {
  return '$' + Number(n || 0).toFixed(2).replace('.', ',')
}
