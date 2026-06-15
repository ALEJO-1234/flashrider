import { WHATSAPP_DISPATCHER } from './config.js'
import { formatoUsd, formatoBs } from './fare.js'

// Link de Google Maps para una coordenada (ligero, abre la app de mapas del teléfono).
function linkMapa(p) {
  return `https://maps.google.com/?q=${p.lat},${p.lng}`
}

// FASE 0 REAL: el pasajero pide la moto por WhatsApp al coordinador/dispatcher.
// Esto funciona HOY, sin backend, mientras validas la demanda (sección 4 del plan).
export function pedirPorWhatsapp(origen, destino, tarifa) {
  const msg =
    `🏍️ *Nueva carrera — Flashrider*\n\n` +
    `📍 Origen: ${linkMapa(origen)}\n` +
    `🎯 Destino: ${linkMapa(destino)}\n` +
    `📏 Distancia: ${tarifa.km} km\n` +
    `💵 Tarifa: ${formatoUsd(tarifa.usd)} (${formatoBs(tarifa.bs)})` +
    `${tarifa.esNocturno ? '\n🌙 Incluye recargo nocturno' : ''}`
  abrirWhatsapp(WHATSAPP_DISPATCHER, msg)
}

// Botón de emergencia (diferenciador #1 del plan): comparte ubicación en vivo.
export function alertaEmergencia(ubicacion, contacto) {
  const msg =
    `🚨 *EMERGENCIA — voy en mototaxi*\n` +
    `Estoy aquí ahora mismo: ${linkMapa(ubicacion)}\n` +
    `Por favor revisa que esté bien.`
  abrirWhatsapp(contacto || '', msg)
}

// Compartir viaje: link de seguimiento a un familiar.
export function compartirViaje(ubicacion) {
  const texto = `Voy en mototaxi con Flashrider 🏍️. Sígueme aquí: ${linkMapa(ubicacion)}`
  if (navigator.share) {
    navigator.share({ title: 'Mi viaje en Flashrider', text: texto }).catch(() => {})
  } else {
    abrirWhatsapp('', texto)
  }
}

function abrirWhatsapp(numero, mensaje) {
  const base = numero ? `https://wa.me/${numero}` : 'https://wa.me/'
  window.open(`${base}?text=${encodeURIComponent(mensaje)}`, '_blank')
}
