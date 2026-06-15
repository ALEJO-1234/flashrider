// Genera la presentación PDF de Flashrider (marca negro + amarillo) para mostrar
// al socio y a los motorizados. Estilo diapositivas (horizontal).
import PDFDocument from 'pdfkit'
import { createWriteStream } from 'node:fs'

const W = 842, H = 595, M = 56
const C = {
  bg: '#0b0b0f', surface: '#1a1a24', surface2: '#242430', line: '#2c2c38',
  yellow: '#ffd400', text: '#f6f6f9', muted: '#9aa0aa', green: '#2ec27e'
}

const doc = new PDFDocument({ size: [W, H], margin: 0 })
doc.pipe(createWriteStream('Flashrider-Presentacion.pdf'))
let primera = true

function nuevaPagina() { if (!primera) doc.addPage(); primera = false; doc.rect(0, 0, W, H).fill(C.bg) }

function marca(x, y, s = 1) {
  doc.roundedRect(x, y, 30 * s, 30 * s, 9 * s).fill(C.yellow)
  doc.fillColor(C.bg).font('Helvetica-Bold').fontSize(18 * s).text('F', x, y + 5 * s, { width: 30 * s, align: 'center' })
  doc.font('Helvetica-Bold').fontSize(16 * s).fillColor(C.text).text('Flash', x + 40 * s, y + 5 * s, { continued: true })
  doc.fillColor(C.yellow).text('rider')
}

function pieDePagina(n) {
  doc.fillColor(C.muted).font('Helvetica').fontSize(9)
  doc.text('Flashrider · Mototaxi y delivery para Upata', M, H - 34, { width: W - 2 * M })
  doc.fillColor(C.muted).text(String(n), W - M - 30, H - 34, { width: 30, align: 'right' })
}

function encabezado(kicker, titulo) {
  marca(M, 38, 0.85)
  doc.fillColor(C.yellow).font('Helvetica-Bold').fontSize(11).text(kicker.toUpperCase(), M, 104, { characterSpacing: 1.5 })
  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(30).text(titulo, M, 122, { width: W - 2 * M })
  doc.rect(M, 168, 60, 4).fill(C.yellow)
}

function vinetas(items, x, y, ancho, opts = {}) {
  const size = opts.size || 14, gap = opts.gap || 16
  let cy = y
  for (const it of items) {
    const txt = typeof it === 'string' ? it : it.t
    const fuerte = typeof it === 'object' && it.b
    doc.circle(x + 4, cy + size / 2 + 1, 3.5).fill(C.yellow)
    doc.fillColor(fuerte ? C.text : C.muted).font(fuerte ? 'Helvetica-Bold' : 'Helvetica').fontSize(size)
    const tx = x + 18, tw = ancho - 18
    doc.text(txt, tx, cy, { width: tw, lineGap: 3 })
    cy += doc.heightOfString(txt, { width: tw, lineGap: 3 }) + gap
  }
  return cy
}

function caja(x, y, w, h, fill = C.surface) {
  doc.roundedRect(x, y, w, h, 14).fill(fill)
}

// ===== 1. Portada =====
nuevaPagina()
doc.rect(0, 0, W, 6).fill(C.yellow)
marca(M, 70, 1.6)
doc.fillColor(C.text).font('Helvetica-Bold').fontSize(54).text('Flashrider', M, 200)
doc.fillColor(C.yellow).font('Helvetica-Bold').fontSize(20).text('Pídela, súbete, llegaste.', M, 268)
doc.fillColor(C.muted).font('Helvetica').fontSize(16).text('Mototaxi y delivery para Upata, hecho en Upata.', M, 300, { width: W - 2 * M })
caja(M, 380, 470, 92, C.surface)
doc.fillColor(C.text).font('Helvetica-Bold').fontSize(15).text('Presentación para socios y motorizados', M + 24, 404)
doc.fillColor(C.muted).font('Helvetica').fontSize(12).text('Cómo funciona el negocio, el modelo económico y por qué te conviene.', M + 24, 428, { width: 430 })
pieDePagina(1)

// ===== 2. El problema =====
nuevaPagina()
encabezado('El problema hoy en Upata', 'Lo que vive la gente y los motorizados')
vinetas([
  { t: 'En las noches o en zonas sin movimiento, la gente le escribe a UNA persona que cobra lo que quiere.', b: true },
  'El pasajero no tiene opciones: no sabe quién está más cerca ni cuánto cuesta de verdad.',
  { t: 'Entre motorizados se roban los clientes — no hay orden.', b: true },
  'Sin registro, sin trazabilidad, sin seguridad formal. Si pasa algo, no hay respaldo.',
], M, 210, W - 2 * M)
pieDePagina(2)

// ===== 3. La solución =====
nuevaPagina()
encabezado('La solución', 'Flashrider: la app de mototaxi de Upata')
vinetas([
  { t: 'Precio FIJO y justo, a la vista antes de pedir. Se acabó el sobreprecio.', b: true },
  { t: 'El primero que acepta la carrera la asegura — nadie te roba el cliente.', b: true },
  { t: 'Seguridad: conductores verificados, botón de emergencia y viaje compartido.', b: true },
  { t: 'Hecha en Upata, para Upata: motorizados conocidos, marca local.', b: true },
], M, 210, W - 2 * M)
pieDePagina(3)

// ===== 4. Cómo funciona =====
nuevaPagina()
encabezado('Cómo funciona', 'Una carrera, en 4 pasos')
const pasos = [
  ['1', 'El pasajero pide', 'Marca su destino en el mapa y ve el precio fijo al instante.'],
  ['2', 'Suena en las motos cercanas', 'El pedido le llega a todos los motorizados cerca.'],
  ['3', 'El primero acepta y la asegura', 'Al aceptar, la carrera se bloquea para los demás.'],
  ['4', 'Recoge, lleva y califica', 'El conductor cobra directo; el pasajero lo califica.'],
]
let py = 205
for (const [n, t, d] of pasos) {
  caja(M, py, W - 2 * M, 70, C.surface)
  doc.roundedRect(M + 16, py + 16, 38, 38, 11).fill(C.yellow)
  doc.fillColor(C.bg).font('Helvetica-Bold').fontSize(20).text(n, M + 16, py + 23, { width: 38, align: 'center' })
  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(16).text(t, M + 70, py + 16)
  doc.fillColor(C.muted).font('Helvetica').fontSize(12).text(d, M + 70, py + 39, { width: W - 2 * M - 90 })
  py += 80
}
pieDePagina(4)

// ===== 5. Modelo económico =====
nuevaPagina()
encabezado('El modelo económico', 'Distinto a Uber — pensado para Venezuela')
vinetas([
  { t: 'El conductor cobra DIRECTO al pasajero (efectivo o Pago Móvil). Su plata, al instante.', b: true },
  { t: 'Se queda con el 100% de su tarifa de la calle.', b: true },
  { t: 'Flashrider gana el 10%, que el conductor paga por adelantado con un "saldo".', b: true },
  'La app NO guarda ni mueve el dinero de nadie. No es un banco — más simple y legal.',
], M, 210, W - 2 * M)
caja(M, 470, W - 2 * M, 60, C.surface2)
doc.fillColor(C.yellow).font('Helvetica-Bold').fontSize(13).text('Clave:', M + 24, 488, { continued: true })
doc.fillColor(C.text).font('Helvetica').fontSize(13).text('  el motorizado recibe mejor y más rápido que con cualquier app grande.')
pieDePagina(5)

// ===== 6. Saldo Flashrider =====
nuevaPagina()
encabezado('Saldo Flashrider', 'Así se cobra la comisión (sin custodiar plata)')
const ciclo = [
  ['1', 'Empieza GRATIS', 'El conductor nuevo arranca con Bs 2.000 de saldo de regalo. Trabaja sin poner un bolívar.'],
  ['2', 'Recarga por adelantado', 'Cuando ya ganó, recarga saldo (Pago Móvil) a la cuenta de Flashrider.'],
  ['3', 'Se descuenta el 10% por carrera', 'Cada viaje baja un poquito su saldo. Flashrider ya cobró.'],
  ['4', 'Saldo en 0 = recarga para seguir', 'Sin saldo, no recibe carreras. Así siempre se cobra, sin perseguir a nadie.'],
]
py = 205
for (const [n, t, d] of ciclo) {
  caja(M, py, W - 2 * M, 70, C.surface)
  doc.circle(M + 35, py + 35, 19).fill(C.yellow)
  doc.fillColor(C.bg).font('Helvetica-Bold').fontSize(18).text(n, M + 16, py + 26, { width: 38, align: 'center' })
  doc.fillColor(C.text).font('Helvetica-Bold').fontSize(15).text(t, M + 70, py + 16)
  doc.fillColor(C.muted).font('Helvetica').fontSize(12).text(d, M + 70, py + 38, { width: W - 2 * M - 90 })
  py += 80
}
pieDePagina(6)

// ===== 7. Tarifas =====
nuevaPagina()
encabezado('Tarifas', 'Fijas, en bolívares, por distancia')
const filas = [
  ['Categoría', 'El conductor recibe', 'El pasajero paga (+10%)', true],
  ['Carrera corta', 'Bs 1.000', 'Bs 1.100', false],
  ['Carrera media', 'Bs 2.000', 'Bs 2.200', false],
  ['Carrera larga', 'Bs 3.500', 'Bs 3.850', false],
  ['Foránea (afueras)', 'Bs 5.000', 'Bs 5.500', false],
]
let ty = 205
const cols = [M + 20, M + 300, M + 540]
for (const [a, b, c, head] of filas) {
  if (head) { doc.fillColor(C.muted).font('Helvetica-Bold').fontSize(11) }
  else { caja(M, ty - 6, W - 2 * M, 42, C.surface) }
  doc.fillColor(head ? C.muted : C.text).font(head ? 'Helvetica-Bold' : 'Helvetica-Bold').fontSize(head ? 11 : 15)
  doc.text(a, cols[0], ty + (head ? 0 : 4))
  doc.fillColor(head ? C.muted : C.green).font('Helvetica-Bold').fontSize(head ? 11 : 15).text(b, cols[1], ty + (head ? 0 : 4))
  doc.fillColor(head ? C.muted : C.yellow).font('Helvetica-Bold').fontSize(head ? 11 : 15).text(c, cols[2], ty + (head ? 0 : 4))
  ty += head ? 26 : 50
}
doc.fillColor(C.muted).font('Helvetica').fontSize(12).text('Después de las 8:00 pm se aplica un recargo nocturno de +20%. La comida del delivery se paga aparte al comercio.', M, ty + 14, { width: W - 2 * M })
pieDePagina(7)

// ===== 8. Por qué te conviene (motorizado) =====
nuevaPagina()
encabezado('Para el motorizado', '¿Por qué te conviene Flashrider?')
const colW = (W - 2 * M - 24) / 2
const izq = [
  { t: 'Te quedas con el 100% de tu tarifa.', b: true },
  { t: 'Cobras al instante, directo del pasajero.', b: true },
  { t: 'Primer mes gratis (saldo de bienvenida).', b: true },
]
const der = [
  { t: 'Nadie te roba el cliente: el primero que acepta, gana.', b: true },
  { t: 'Más carreras: te llegan por la app.', b: true },
  { t: 'Construyes tu reputación con estrellas.', b: true },
]
vinetas(izq, M, 210, colW, { gap: 22 })
vinetas(der, M + colW + 24, 210, colW, { gap: 22 })
pieDePagina(8)

// ===== 9. Seguridad =====
nuevaPagina()
encabezado('Seguridad y confianza', 'El diferenciador frente a las líneas informales')
vinetas([
  { t: 'Conductores verificados (cédula, licencia, documentos de la moto).', b: true },
  { t: 'Botón de emergencia que comparte tu ubicación en vivo.', b: true },
  { t: 'Compartir viaje con un familiar en tiempo real.', b: true },
  { t: 'Calificaciones y reseñas: los buenos suben, los malos salen.', b: true },
], M, 210, W - 2 * M)
pieDePagina(9)

// ===== 10. La prueba =====
nuevaPagina()
encabezado('La prueba piloto', 'Una semana, solo mototaxi')
vinetas([
  { t: 'Arrancamos enfocados en mototaxi para probar en la calle.', b: true },
  'Medimos: carreras por día, tiempo de espera y conductores activos.',
  'Aprendemos precios, zonas y horas pico reales de Upata.',
  'Con esos datos, afinamos todo antes de crecer.',
], M, 210, W - 2 * M)
pieDePagina(10)

// ===== 11. El futuro =====
nuevaPagina()
encabezado('El futuro', 'Más que mototaxi')
vinetas([
  { t: 'Delivery: comida y productos de comercios afiliados.', b: true },
  { t: 'Restaurantes y tiendas se afilian GRATIS y usan nuestra flota.', b: true },
  { t: 'Encomiendas y mandados con la misma moto.', b: true },
  { t: 'Expansión a la región: Guayana y otras ciudades, con el mismo modelo.', b: true },
], M, 210, W - 2 * M)
pieDePagina(11)

// ===== 12. Cierre =====
nuevaPagina()
doc.rect(0, 0, W, 6).fill(C.yellow)
marca(M, 80, 1.3)
doc.fillColor(C.text).font('Helvetica-Bold').fontSize(40).text('Únete como Pionero Flashrider', M, 220, { width: W - 2 * M })
doc.fillColor(C.muted).font('Helvetica').fontSize(16).text('Los primeros 50 motorizados son los fundadores. Mejor reparto, primer mes gratis y la marca de Upata respaldándote.', M, 300, { width: W - 2 * M, lineGap: 4 })
doc.fillColor(C.yellow).font('Helvetica-Bold').fontSize(18).text('Pídela, súbete, llegaste.', M, 400)
pieDePagina(12)

doc.end()
console.log('✓ Flashrider-Presentacion.pdf generado')
