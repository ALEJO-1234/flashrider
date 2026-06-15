import { useEffect, useState } from 'react'
import { suscribir, obtenerViajes, obtenerConductores, obtenerComercios } from './backend.js'

// Hooks que se re-renderizan cuando cambian los datos (en esta o en otra pestaña).
// Equivalente local de las suscripciones Realtime de Supabase.

export function useViajes() {
  const [v, setV] = useState(obtenerViajes)
  useEffect(() => suscribir((col) => { if (col === 'viajes') setV(obtenerViajes()) }), [])
  return v
}

export function useConductores() {
  const [c, setC] = useState(obtenerConductores)
  useEffect(() => suscribir((col) => { if (col === 'conductores') setC(obtenerConductores()) }), [])
  return c
}

export function useComercios() {
  const [c, setC] = useState(obtenerComercios)
  useEffect(() => suscribir((col) => { if (col === 'comercios') setC(obtenerComercios()) }), [])
  return c
}
