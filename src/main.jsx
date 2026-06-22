import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import 'leaflet/dist/leaflet.css'
import './styles.css'

// Auto-actualización del PWA: si hay una versión nueva publicada, se aplica
// sola y recarga — así nadie queda atascado en una versión vieja con bugs ya
// corregidos. Revisa cada 20s mientras la app está abierta.
//
// Con registerType:'autoUpdate' el Service Worker nuevo toma el control solo
// (skipWaiting + clientsClaim), pero la pestaña YA ABIERTA sigue corriendo el
// JS viejo en memoria hasta recargar. El evento 'controllerchange' es lo que
// avisa que un SW nuevo tomó el control — ahí forzamos la recarga.
if ('serviceWorker' in navigator) {
  let yaRecargo = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (yaRecargo) return
    yaRecargo = true
    window.location.reload()
  })
}

const actualizarSW = registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (registration) setInterval(() => registration.update(), 20000)
  },
  onNeedRefresh() { actualizarSW(true) }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
