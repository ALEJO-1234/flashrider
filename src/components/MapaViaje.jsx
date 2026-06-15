import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

// Marcadores personalizados con estilo premium (pulso en el origen).
const iconoOrigen = L.divIcon({
  className: 'pin',
  html: '<div style="position:relative" class="pin-dot pin-origen"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
})
const iconoDestino = L.divIcon({
  className: 'pin',
  html: '<div class="pin-dot pin-destino"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
})
const iconoMoto = L.divIcon({
  className: 'pin',
  html: '<div style="width:34px;height:34px;border-radius:11px;background:linear-gradient(145deg,#ffd400,#ffc400);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.5),0 0 0 3px rgba(255,212,0,.25)">' +
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0b0b0f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
})

// Captura toques en el mapa para fijar el destino.
function CapturarToque({ onPick }) {
  useMapEvents({ click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) } })
  return null
}

// Reencuadra el mapa para que se vean origen y destino.
function Encuadrar({ puntos }) {
  const map = useMap()
  useEffect(() => {
    const validos = puntos.filter(Boolean)
    if (validos.length === 1) {
      map.setView([validos[0].lat, validos[0].lng], 15)
    } else if (validos.length >= 2) {
      map.fitBounds(validos.map((p) => [p.lat, p.lng]), { padding: [50, 50], maxZoom: 16 })
    }
  }, [JSON.stringify(puntos)]) // eslint-disable-line
  return null
}

export default function MapaViaje({ origen, destino, moto, ruta, onPick, center }) {
  // Línea de ruta: si hay ruta por calles la usamos; si no, línea recta origen→destino.
  const linea = (ruta && ruta.length > 1)
    ? ruta.map((p) => [p.lat, p.lng])
    : (origen && destino ? [[origen.lat, origen.lng], [destino.lat, destino.lng]] : null)

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={14} zoomControl={false} attributionControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {onPick && <CapturarToque onPick={onPick} />}
      <Encuadrar puntos={[origen, destino, moto]} />
      {linea && (
        <Polyline positions={linea}
          pathOptions={{ color: '#ffd400', weight: 5, lineCap: 'round', lineJoin: 'round', opacity: 0.95 }} />
      )}
      {origen && <Marker position={[origen.lat, origen.lng]} icon={iconoOrigen} />}
      {destino && <Marker position={[destino.lat, destino.lng]} icon={iconoDestino} />}
      {moto && <Marker position={[moto.lat, moto.lng]} icon={iconoMoto} />}
    </MapContainer>
  )
}
