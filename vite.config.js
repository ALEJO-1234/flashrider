import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// PWA "instalable" sin App Store. Estrategia liviana para gama baja y datos caros.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Flashrider — Moto y delivery',
        short_name: 'Flashrider',
        description: 'Pídela, súbete, llegaste. Moto, encomiendas y encargos.',
        theme_color: '#111111',
        background_color: '#111111',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es-VE',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Solo precachea lo que NO cambia de versión en versión (iconos, fuentes).
        // El HTML/JS/CSS de la app usan NetworkFirst abajo: SIEMPRE intentan traer
        // la versión más nueva primero. Esto evita que alguien quede atascado en
        // una versión vieja (bug conocido de Service Workers, sobre todo en
        // iPhone/Safari, donde la detección automática de actualización no
        // siempre dispara). Solo cae al caché si no hay internet.
        globPatterns: ['**/*.{svg,png,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'html-cache', networkTimeoutSeconds: 4 }
          },
          {
            urlPattern: ({ request }) => ['script', 'style'].includes(request.destination),
            handler: 'NetworkFirst',
            options: { cacheName: 'asset-cache', networkTimeoutSeconds: 4 }
          },
          {
            // Tiles de OpenStreetMap: cache para no recargar mapa y ahorrar datos.
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
})
