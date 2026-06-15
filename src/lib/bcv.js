import { useEffect, useState } from 'react'
import { TASA_BCV_DEFAULT } from './config.js'

// === Tasa oficial del BCV (Bs por USD) ===
// Se consulta una vez al día desde una fuente pública del dólar oficial y se
// guarda en caché. Si falla, usa la última guardada o el respaldo de config.
// Anclamos precios en USD y cobramos en Bs a la tasa oficial: así es legal.

const FUENTE = 'https://ve.dolarapi.com/v1/dolares/oficial'
const KEY = 'upa_tasa_bcv'

function hoy() { return new Date().toISOString().slice(0, 10) }

function leerCache() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null }
}

// Valor sincrónico actual (para cálculos inmediatos).
export function getTasa() {
  const c = leerCache()
  return c?.valor || TASA_BCV_DEFAULT
}

// Consulta la tasa del día (si no está cacheada hoy). Devuelve el valor.
export async function actualizarTasa() {
  const c = leerCache()
  if (c && c.fecha === hoy()) return c.valor
  try {
    const r = await fetch(FUENTE)
    const data = await r.json()
    const valor = Math.round(Number(data.promedio || data.venta))
    if (valor > 0) {
      localStorage.setItem(KEY, JSON.stringify({ fecha: hoy(), valor }))
      return valor
    }
  } catch { /* sin conexión: usamos lo que haya */ }
  return c?.valor || TASA_BCV_DEFAULT
}

// Hook React: devuelve la tasa y la actualiza al montar.
export function useTasa() {
  const [tasa, setTasa] = useState(getTasa())
  useEffect(() => { actualizarTasa().then(setTasa) }, [])
  return tasa
}
