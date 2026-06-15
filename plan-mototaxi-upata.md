# Plan de lanzamiento — App de Mototaxi para Upata

> Mentalidad: bajo costo, velocidad de lanzamiento, escalable a otras ciudades de Venezuela.
> Supuestos (ajústalos): presupuesto inicial bootstrap (<$1.000), precios anclados a USD pero cobrando en Pago Móvil/efectivo, fundador solo o con 1 socio técnico.

---

## 1. Marca e identidad

**Recomendado: "Upa"** (app: *Upa Moto*).

Por qué funciona mejor que las demás:
- "¡Upa!" es coloquial venezolano = *arriba / vamos / levanta*. Comunica **velocidad y acción**.
- Contiene **Upa**ta → arraigo local instantáneo.
- Es corto, fácil de decir por WhatsApp y **escalable**: en otra ciudad sigue significando "vamos", no te ata a Upata.

Eslogan: **"Pídela, súbete, llegaste."**

Alternativas (por si la marca ya está tomada):

| Nombre | Ángulo | Escalable fuera de Upata |
|---|---|---|
| **Upa Moto** | local + acción | Sí |
| **RuedaYa** | velocidad | Sí |
| **Yocoima** | herencia (río/fundación de Upata) | Débil (muy local) |
| **VeloMoto** | velocidad | Sí |
| **MotoSegura** | confianza/seguridad | Sí |

Identidad visual:
- Colores: **verde Upata / amarillo aviso** o **negro + amarillo moto** (alta visibilidad, asociado a motorizado).
- Logo: casco o flecha de movimiento. Simple, legible en ícono de 48px.
- Tono: cercano, directo, "pana de confianza", no corporativo.

---

## 2. Modelo de negocio

**Principio:** el ticket promedio es bajo (~$1–$1,50 por carrera). Esto **no se gana con margen alto, se gana con volumen y con costos casi cero**. Por eso el MVP no quema plata en infraestructura.

### Cómo ganas dinero (en orden de implementación)

1. **Comisión por viaje** — empieza en **0% el primer mes** (para robar conductores a Yummy/Ridery/líneas informales), luego **10%**. Yummy/Ridery cobran ~20–25%; tu 10% es tu arma de captación de oferta.
2. **Suscripción del conductor (plan alternativo)** — cuota fija semanal (ej. $3–$5/sem) en vez de %. En Venezuela funciona muy bien porque el conductor *odia* que le descuenten cada carrera. Ofrece ambos y deja que el conductor elija.
3. **Mandados / delivery** (fase 2) — misma flota, paquetes y encomiendas. Margen mayor que pasajeros.
4. **Publicidad local** (fase 3) — comercios de Upata pagando por aparecer/promos en la app.

### Tarifa (estructura sugerida, ancla USD)

| Concepto | Valor sugerido |
|---|---|
| Tarifa mínima | $0,80 |
| Banderazo (base) | $0,50 |
| Por km | $0,30 |
| Recargo nocturno (después 8pm) | +20% |
| Cobro | Pago Móvil (tasa BCV del día), efectivo en Bs o $, Zelle |

> Pon precio **igual o ligeramente más barato** que Yummy en moto ($1,25) para el pasajero, y **mejor reparto** para el conductor. Ganas por los dos lados.

### Incentivos a conductores
- **0% comisión** primeras 4 semanas.
- **Bono por volumen**: +$3 al completar 30 carreras/semana.
- **Referido**: $2 por cada conductor verificado que traiga.
- **Ranking semanal** visible (gamificación, top 5 conductores).

---

## 3. Funciones de la app

### Pasajero
1. **Registro con teléfono** — OTP por **WhatsApp** (no por SMS; SMS a Venezuela es caro y poco confiable).
2. **Solicitar moto** — un botón grande, destino por mapa o por dirección escrita.
3. **GPS / ubicación** — detecta origen automático.
4. **Cálculo de tarifa** — muestra precio **antes** de confirmar (clave de confianza en VE).
5. **Seguimiento en vivo** del conductor en mapa + placa + nombre + foto + teléfono.
6. **Historial de viajes** con recibo.
7. **Calificaciones** (1–5 estrellas + comentario).
8. **Botón de emergencia** — comparte ubicación en vivo por WhatsApp a un contacto + número de emergencia. (La seguridad es la queja #1 del mototaxi en VE; esto es diferenciador real.)
9. **Compartir viaje** — link de seguimiento a un familiar.

### Conductor (motorizado)
1. **Registro y verificación** — cédula, licencia, RCV/documentos de la moto, foto, selfie. Verificación manual al inicio (tú o un socio aprueban).
2. **Perfil** — foto, placa, modelo de moto, calificación.
3. **Aceptar / rechazar viajes** con dirección y tarifa visibles.
4. **Ganancias diarias / semanales** — cuánto lleva, cuántas carreras.
5. **Historial** de viajes.
6. **Zonas de más demanda** — mapa de calor simple (centro, mercado, terminal, hospital, liceos).
7. **Modo disponible/no disponible**.

### Panel administrativo (web)
1. **Control de usuarios** — alta/baja, bloqueo.
2. **Control de conductores** — aprobar documentos, suspender, ver calificaciones.
3. **Tarifas** — editar banderazo/km/recargos sin tocar código.
4. **Reportes** — viajes/día, ingresos, comisión, conductores activos, zonas calientes.
5. **Soporte** — gestión de quejas y emergencias.

---

## 4. MVP — lanzar rápido y barato en Upata

**No construyas una app nativa primero.** Valida la demanda con casi cero código y escala.

### Fase 0 — "Mago de Oz" (semana 1–2, costo ~$0)
- **WhatsApp Business + un grupo/dispatcher manual.** El pasajero pide por WhatsApp, tú (o un coordinador) asignas al mototaxista más cercano del grupo.
- Objetivo: probar que hay demanda real y aprender precios, zonas y horas pico **sin desarrollar nada**.

### Fase 1 — PWA (app web, semana 3–8)
- Una **Progressive Web App** (se usa desde el navegador, "se instala" sin App Store, sin pagar $99 de Apple ni esperar revisiones).
- Funciones mínimas: registro WhatsApp-OTP, pedir moto, mapa + GPS, tarifa estimada, asignación al conductor, seguimiento, calificación, botón de emergencia. **Pagos manuales** (Pago Móvil con captura/confirmación) al principio.
- Panel admin web básico.

### Fase 2 — App nativa + automatización (mes 3+)
- React Native (Expo) para Android primero (el 90%+ del mercado venezolano es Android).
- Automatizar asignación, notificaciones push, integrar Pago Móvil C2P si consigues banco.

**Regla de oro del MVP:** lanza con **lo mínimo que permita una carrera completa y segura**. Todo lo demás (delivery, publicidad, ranking) viene después.

---

## 5. Stack tecnológico (priorizando costo $0 al inicio)

| Capa | Recomendación | Por qué |
|---|---|---|
| Frontend | **React** (PWA) → luego **React Native / Expo** | Reutilizas código web→móvil; barato |
| Backend | **Supabase** (Postgres + Auth + Realtime) o **Firebase** | Tiempo real para ubicación; capa gratis generosa |
| Base de datos | **PostgreSQL** (en Supabase) | Robusta, gratis al inicio |
| Mapas | **OpenStreetMap + Leaflet/MapLibre** o **Mapbox** (capa gratis) | **Evita Google Maps**: escala caro rápido |
| Ubicación en vivo | Supabase Realtime / Socket.io | Seguimiento del conductor |
| Auth / OTP | **WhatsApp OTP** (Meta/Twilio) | SMS a VE es caro/poco fiable |
| Pagos | **Pago Móvil** (manual al inicio → C2P), **efectivo $/Bs**, **Zelle** | Así paga el venezolano; no fuerces tarjeta |
| Hosting | **Vercel / Netlify** (front) + Supabase (back) | Capas gratuitas |
| Notificaciones | WhatsApp + Web Push | Barato y ya lo usa todo el mundo |

> Costo de infraestructura realista los primeros meses: **prácticamente $0**, solo dominio (~$12/año) y, si automatizas WhatsApp OTP, unos centavos por mensaje.

---

## 6. Análisis del mercado de Upata

### Oportunidades
- ~**118 mil habitantes**, mototaxi es el transporte de trechos cortos por excelencia.
- **Yummy, Ridery, Yango se concentran en Caracas y grandes ciudades** — Upata está desatendida por apps. Tú serías el primero local.
- Economía **dolarizada + Pago Móvil**: la gente ya está acostumbrada a pagar carreras en $ o transferencia.
- Confianza local: una marca *de Upata, para Upata*, con conductores conocidos, vence a una app caraqueña impersonal.

### Riesgos
| Riesgo | Mitigación |
|---|---|
| **Inseguridad** (robos en moto, queja #1) | Conductores verificados, botón de emergencia, viaje compartido, calificaciones |
| **Ticket bajo (~$1)** | Modelo de volumen + suscripción de conductor + delivery |
| **Fricción de pago** (sin API fácil de Pago Móvil) | Confirmación manual al inicio; efectivo/Zelle |
| **Rotación de conductores** | Comisión baja, bonos, plan de suscripción |
| **Gasolina / fallas de servicio** | Empieza con líneas que ya operan estable |
| **Regulación** (Reglamento de Transporte Terrestre exige equipo: casco, extintor, etc.) | Verificación de requisitos legales como filtro de calidad → marketing de "conductor en regla" |
| **Inestabilidad monetaria (Bs)** | Anclar precios a USD, actualizar tasa diaria |
| **Datos/Internet caros** | App liviana, bajo consumo, funciona en gama baja |

### Competencia
- **Apps grandes** (Yummy, Ridery, Yango, Bip Bip): fuertes en marca y tecnología, **débiles/ausentes en Upata**.
- **Líneas y paradas informales de mototaxi**: tu competencia real diaria. Tienen lealtad de clientes pero **cero tecnología, cero trazabilidad, cero seguridad formal**.

### Cómo diferenciarte
1. **Hiperlocal**: marca de Upata, conductores conocidos.
2. **Más barato para el pasajero + mejor pago al conductor** que las grandes.
3. **Seguridad como bandera**: verificación + emergencia + viaje compartido.
4. **Liviana y de bajo consumo de datos**, funciona en teléfonos de gama baja.
5. **Pagas como quieras** (Pago Móvil, efectivo, Zelle).

---

## 7. Estrategia: primeros 50 conductores y 500 usuarios

> **Regla del marketplace: primero la oferta (motos), después la demanda (pasajeros).** Sin motos disponibles, el pasajero se va y no vuelve.

### Etapa A — Conseguir 50 motorizados (semanas 1–4)
1. **Ve a las paradas/líneas existentes** de Upata en persona (centro, mercado, terminal). Habla con los **líderes de línea** primero.
2. Oferta imbatible: **"0% de comisión el primer mes, y más carreras porque te llegan por la app."**
3. **Referido $2** por conductor verificado que traigan → crecimiento orgánico de oferta.
4. Crea un **grupo de WhatsApp de conductores fundadores** (los primeros 50 = "Pioneros Upa", con badge en la app).
5. Verifica documentos rápido para que tengan sello de "conductor en regla".

### Etapa B — Conseguir 500 usuarios (semanas 3–10)
1. **Lanza en nodos de alta demanda**: Plaza Miranda/centro, mercado municipal, terminal, hospital, liceos/universidad, zonas comerciales.
2. **Usa tu fuerte: contenido.** Tienes experiencia en TikTok/edición — haz contenido local de Upata mostrando la app, conductores reales, "pide tu moto sin salir de casa". Esto te cuesta $0 y es tu ventaja injusta frente a cualquier competidor.
3. **Promo de lanzamiento**: primeras 2 carreras a mitad de precio o la primera gratis (subsidio mínimo, ticket es de $1).
4. **Referido de pasajeros**: trae un amigo, ambos reciben $0,50 de saldo.
5. **Grupos de WhatsApp/Facebook de Upata** + flyers QR en comercios, liceos y la universidad.
6. **Alianzas con comercios**: farmacias, panaderías, abastos que recomienden la app a sus clientes (luego se vuelven clientes de delivery).
7. **Evento de lanzamiento** en el centro: motos con la marca, música (tú tocas guitarra — úsalo), registro en vivo.

### Métricas que debes vigilar desde el día 1
- Tiempo de espera promedio (si sube, faltan motos).
- Carreras/día y carreras/conductor activo.
- % de solicitudes sin conductor disponible (tu mayor fuga).
- Retención semana 2 vs semana 1.

---

## 8. Hoja de ruta y escalabilidad

| Fase | Plazo | Meta |
|---|---|---|
| 0. Validación WhatsApp | Sem 1–2 | 5–10 conductores, 50 carreras de prueba |
| 1. PWA en Upata | Mes 1–2 | 50 conductores, 500 usuarios |
| 2. App nativa + delivery | Mes 3–5 | Rentabilidad operativa en Upata |
| 3. Expansión regional | Mes 6–12 | Ciudad Guayana/Puerto Ordaz, El Callao, Guasipati, Tumeremo, El Tigre |

**Por qué Upata primero y luego la región Guayana:** dominas un mercado que las grandes ignoran, construyes marca y caja, y replicas el *playbook* ciudad por ciudad con el mismo código y el mismo modelo de "líderes de línea + contenido local".

---

## 9. Lo primero que harías esta semana (acción concreta)

1. Reservar nombre/dominio y crear logo simple.
2. Montar **WhatsApp Business + grupo de conductores** (Fase 0, costo $0).
3. Ir físicamente a 2–3 paradas de Upata y cerrar **5 conductores fundadores**.
4. Correr **20 carreras manuales** para aprender precios, zonas y horas pico reales.
5. Con esos datos, recién ahí, mandar a construir la PWA.

> No construyas la app hasta tener demanda probada por WhatsApp. Ese es el error que mata a la mayoría: gastan meses programando algo que nadie pidió.
