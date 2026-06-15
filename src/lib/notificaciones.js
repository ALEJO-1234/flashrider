// Notificaciones para conductores y comercios: aviso del sistema + sonido +
// vibración cuando entra un pedido nuevo. Funciona con la app abierta (o de
// fondo) en el teléfono. Para que suene aunque la app esté cerrada hace falta
// "push" del servidor (llega con Supabase + despliegue).

export async function pedirPermisoNotif() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  } catch { /* sin soporte */ }
}

export function notificar(titulo, cuerpo) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(titulo, { body: cuerpo, icon: '/icon-192.png', badge: '/icon-192.png' })
    }
  } catch { /* nada */ }
  sonar()
  try { navigator.vibrate && navigator.vibrate([140, 70, 140]) } catch { /* nada */ }
}

// Pitido corto sin archivo de audio (Web Audio).
function sonar() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    const a = new AC()
    const tono = (freq, t0, dur) => {
      const o = a.createOscillator(), g = a.createGain()
      o.connect(g); g.connect(a.destination); o.type = 'sine'; o.frequency.value = freq
      g.gain.setValueAtTime(0.0001, a.currentTime + t0)
      g.gain.exponentialRampToValueAtTime(0.35, a.currentTime + t0 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur)
      o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + 0.02)
    }
    tono(880, 0, 0.18); tono(1320, 0.2, 0.28)
  } catch { /* nada */ }
}
