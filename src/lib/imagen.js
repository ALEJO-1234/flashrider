// Convierte una foto elegida (archivo) en una miniatura pequeña (data URL JPEG).
// La reducimos para que no pese y quepa en localStorage / luego en Supabase.
export function archivoAMiniatura(file, max = 320) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const escala = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * escala)
        const h = Math.round(img.height * escala)
        const c = document.createElement('canvas')
        c.width = w; c.height = h
        c.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(c.toDataURL('image/jpeg', 0.8))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
