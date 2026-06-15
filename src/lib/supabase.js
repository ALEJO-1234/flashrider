import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase. Se activa SOLO si pones las claves en el archivo .env
// (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY). Si no, la app funciona en modo
// local (una sola máquina) como hasta ahora.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (url && key) ? createClient(url, key, {
  realtime: { params: { eventsPerSecond: 10 } }
}) : null

export const haySupabase = !!supabase
