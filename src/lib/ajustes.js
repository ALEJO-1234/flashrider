import { TARIFAS_FIJAS, COMISION } from './config.js'

// Ajustes editables desde el panel de administrador (tarifas y comisión), sin
// tocar código. Se guardan en localStorage y caen de vuelta a config.js si no
// se han tocado. (Con Supabase esto vivirá en la base de datos.)

const KEY = 'upa_ajustes'

function leer() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}

export function getTarifas() {
  const t = leer().tarifas
  // Solo usa el override si tiene el formato nuevo (bolívares + foránea).
  if (t && typeof t?.corta?.bs === 'number' && t.foranea) return t
  return TARIFAS_FIJAS
}

export function getComision() {
  const c = leer().comision
  return typeof c === 'number' ? c : COMISION
}

export function guardarAjustes(patch) {
  localStorage.setItem(KEY, JSON.stringify({ ...leer(), ...patch }))
}
