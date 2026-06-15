# Upa Moto 🏍️ — MVP (PWA del pasajero)

> Pídela, súbete, llegaste. Mototaxi para Upata.

Esta es la **Progressive Web App** de la Fase 1 del [plan](plan-mototaxi-upata.md):
una app web instalable (sin App Store, sin pagar Apple), liviana y de bajo
consumo de datos para teléfonos de gama baja.

## Qué hace este MVP (lado pasajero)

- 📍 **Ubicación automática** (origen) + marcar destino tocando el mapa.
- 🗺️ **Mapa con OpenStreetMap** (gratis, sin Google Maps que escala caro).
- 💵 **Tarifa antes de confirmar** — con la estructura exacta del plan
  ($0,50 banderazo + $0,30/km, mínimo $0,80, +20% nocturno) en USD y Bs.
- 🏍️ **Pedir moto** → en **Fase 0** abre WhatsApp al coordinador con origen,
  destino y tarifa (¡funciona hoy, sin backend!).
- 🚨 **Botón de emergencia** y **compartir viaje** (el diferenciador del plan).
- ⭐ **Calificación** al terminar.
- 📲 **Instalable** como PWA, funciona con poca señal (cachea el mapa).

## Cómo correrlo

```bash
npm install
npm run dev      # abre http://localhost:5173
```

Para una versión de producción:

```bash
npm run build    # genera /dist
npm run preview  # prueba el build localmente
```

Despliega la carpeta `dist` gratis en **Vercel** o **Netlify**.

## Configúralo (sin tocar lógica)

Edita [`src/lib/config.js`](src/lib/config.js):

- `WHATSAPP_DISPATCHER` → **tu número** de coordinador (Fase 0).
- `TASA_BCV` → la tasa del día (hasta automatizarla).
- `TARIFA` → banderazo, por km, recargo nocturno.
- `UPATA_CENTER` → centro del mapa.

## Estructura

```
src/
  App.jsx              flujo del viaje (home → buscando → viaje → calificar)
  components/MapaViaje  mapa Leaflet (origen, destino, moto, ruta)
  lib/
    config.js          TARIFAS y ajustes editables
    fare.js            cálculo de tarifa (estructura del plan)
    geo.js             distancia (Haversine) y geolocalización
    acciones.js        pedir por WhatsApp, emergencia, compartir
scripts/gen-icons.mjs  genera los iconos PWA (reemplaza por tu logo)
```

## Siguiente paso (Fase 2): backend con Supabase

Hoy el conductor es de demostración y la asignación es simulada. Para
automatizar, conecta **Supabase** (Postgres + Auth + Realtime). Ver
[`SUPABASE.md`](SUPABASE.md) para el esquema de base de datos sugerido y
los puntos exactos del código donde enchufarlo.
