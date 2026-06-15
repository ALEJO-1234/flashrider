// Utilidades de geolocalización. Sin dependencias pesadas (datos caros = código liviano).

// Distancia entre dos puntos {lat, lng} en kilómetros (fórmula de Haversine).
export function distanciaKm(a, b) {
  const R = 6371 // radio de la Tierra en km
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const lat1 = rad(a.lat)
  const lat2 = rad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function rad(deg) {
  return (deg * Math.PI) / 180
}

// Minutos estimados para recorrer una distancia en moto (mínimo 1 min).
export function etaMinutos(km, kmh = 22) {
  return Math.max(1, Math.round((km / kmh) * 60))
}

// Da un paso desde un punto hacia otro (fracción 0..1). Sirve para simular
// el movimiento del conductor acercándose en el mapa.
export function pasoHacia(desde, hacia, fraccion) {
  return {
    lat: desde.lat + (hacia.lat - desde.lat) * fraccion,
    lng: desde.lng + (hacia.lng - desde.lng) * fraccion
  }
}

// Pide la ubicación del navegador. Devuelve Promise<{lat, lng}>.
export function ubicacionActual() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Tu teléfono no permite ubicación.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('No pudimos obtener tu ubicación. Actívala e intenta de nuevo.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  })
}
