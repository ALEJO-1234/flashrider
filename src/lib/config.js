// === Configuración de Upa Moto ===
// Todo lo editable en un solo lugar. En el futuro esto vendrá del panel admin
// (Supabase) para cambiar tarifas SIN tocar código, como dice el plan.

// Centro de Upata (Plaza Miranda aprox.) — origen por defecto del mapa.
export const UPATA_CENTER = { lat: 8.0106, lng: -62.4055 }

// MODO PRUEBA: enfoca la app SOLO en mototaxi (encomienda y delivery quedan
// como "Pronto"). En false se activan todos los servicios y la afiliación de comercios.
export const SOLO_MOTOTAXI = false

// === TARIFAS FIJAS (EN BOLÍVARES) ===
// Ya NO se cobra por kilómetro. El GPS solo CLASIFICA la carrera por distancia
// y se cobra el precio fijo de esa categoría, en bolívares (como la calle).
// 'bs' = lo que se queda el motorizado (su tarifa de la calle, 100% suya).
// El pasajero paga eso + la comisión de la app (ver COMISION abajo).
//
// >>> Edítalos desde el panel admin (o aquí) con los precios reales. <<<
// 'bs' = precio fijo de la categoría. La media usa 'bsMin'/'bsMax': el precio
// sube por distancia dentro del tramo (de 1.500 a 2.000), en pasos de 100.
export const TARIFAS_FIJAS = {
  corta:   { label: 'Carrera corta',   maxKm: 1.5, bs: 1000 },
  mediana: { label: 'Carrera media',   minKm: 1.5, maxKm: 3.0, bsMin: 1500, bsMax: 2000 },
  larga:   { label: 'Carrera larga',   maxKm: 5.0, bs: 3500 },
  foranea: { label: 'Foránea (afueras)', maxKm: 999, bs: 5000 }
}

// Comisión de la app. La PAGA EL PASAJERO (se hornea en el precio que ve).
// El conductor se queda con su tarifa completa; tú ganas este %.
export const COMISION = 0.10 // 10%

// Recargo nocturno: se aplica a la tarifa después de esta hora.
export const RECARGO_NOCTURNO = 0.20 // +20%
export const HORA_NOCTURNO = 20      // 20:00 (8pm)

// Cobro por cancelar con la moto ya en camino (Bs, fijo). Se le ABONA AL SALDO
// del conductor como compensación (Flashrider lo cubre al instante). La
// recuperación del pasajero llega cuando exista login de pasajero.
export const CANCELACION = 300

// === SALDO FLASHRIDER (billetera de comisión prepagada, en Bs) ===
export const SALDO_BIENVENIDA = 2000 // regalo de comisión al registrarse (promo 0%)
export const RECARGA_MINIMA = 1000   // recarga mínima
export const SALDO_BAJO = 300        // avisar "saldo bajo" por debajo de esto

// Velocidad promedio de una moto en ciudad (km/h) para estimar tiempo de llegada.
export const VELOCIDAD_MOTO_KMH = 22

// Radio máximo (km) para mostrarle un pedido a un conductor.
export const RADIO_PEDIDOS_KM = 4

// Tipos de servicio. Misma flota, distinto pedido (Fase 2 del plan: delivery).
// 'recargo' es un cargo fijo extra (Bs) que se suma a la tarifa del conductor.
export const TIPOS_SERVICIO = {
  viaje:      { label: 'Viaje',      recargo: 0,   desc: 'Te llevamos a tu destino' },
  encomienda: { label: 'Encomienda', recargo: 500, desc: 'Enviar o recibir un paquete' },
  delivery:   { label: 'Delivery',   recargo: 0, desc: 'Comida y productos de comercios afiliados' }
}

// Tasa BCV de respaldo (Bs por USD) si falla la consulta automática al BCV.
export const TASA_BCV_DEFAULT = 580

// Número del coordinador/soporte (WhatsApp), formato internacional sin "+".
export const WHATSAPP_DISPATCHER = '584120000000' // <-- pon tu número real

// Cuenta(s) donde los conductores recargan su saldo (TUYAS). <-- pon las reales.
export const CUENTAS_RECARGA = {
  pagoMovil: 'Bancamiga · 0412-6891970 · C.I. 29.689.622'
}
