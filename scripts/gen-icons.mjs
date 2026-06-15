// Genera los iconos PNG de la PWA (marca negro + amarillo, una "rueda" de moto).
// Sin dependencias: codifica PNG a mano con zlib. Reemplaza luego por tu logo real.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const NEGRO = [17, 17, 17]
const AMARILLO = [255, 210, 0]

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return (~c) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const t = Buffer.from(type, 'ascii')
  const body = Buffer.concat([t, data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size) {
  const px = Buffer.alloc(size * size * 4)
  const c = size / 2
  const rExt = size * 0.40   // borde externo de la rueda
  const rInt = size * 0.24   // borde interno
  const rHub = size * 0.07   // centro
  const radio = size * 0.16  // esquinas redondeadas del fondo
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // fondo negro con esquinas redondeadas (fuera = transparente)
      let col = NEGRO, a = 255
      if (!dentroRedondeado(x, y, size, radio)) a = 0
      const d = Math.hypot(x - c, y - c)
      if ((d <= rExt && d >= rInt) || d <= rHub) col = AMARILLO // aro + hub
      const i = (y * size + x) * 4
      px[i] = col[0]; px[i + 1] = col[1]; px[i + 2] = col[2]; px[i + 3] = a
    }
  }
  // scanlines con byte de filtro 0
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8 bits, RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

function dentroRedondeado(x, y, size, r) {
  const nx = Math.min(x, size - 1 - x), ny = Math.min(y, size - 1 - y)
  if (nx >= r || ny >= r) return true
  return Math.hypot(r - nx, r - ny) <= r
}

mkdirSync(new URL('../public/', import.meta.url), { recursive: true })
for (const s of [192, 512]) {
  writeFileSync(new URL(`../public/icon-${s}.png`, import.meta.url), png(s))
  console.log(`✓ public/icon-${s}.png`)
}
