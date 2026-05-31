// ─── Brand Kit — armazenamento local ─────────────────────────────────────────
// Os logos ficam em localStorage como base64 para funcionar sem servidor.

export interface Brand {
  id:         string
  nome:       string
  logoBase64: string | null   // base64 do PNG/SVG/JPG
  logoMime:   string | null   // 'image/png' | 'image/svg+xml' etc.
  cor1:       string          // cor principal
  cor2:       string          // cor secundária
  tagline:    string
  segmento:   string
  site:       string
  ts:         number
}

const STORAGE_KEY = 'alcance_brands_v1'

export function listarMarcas(): Brand[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function salvarMarca(brand: Brand): void {
  const list = listarMarcas().filter(b => b.id !== brand.id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([brand, ...list]))
}

export function deletarMarca(id: string): void {
  const list = listarMarcas().filter(b => b.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function getMarca(id: string): Brand | null {
  return listarMarcas().find(b => b.id === id) ?? null
}

export function novaMarca(): Brand {
  return {
    id:         crypto.randomUUID(),
    nome:       '',
    logoBase64: null,
    logoMime:   null,
    cor1:       '#00C4B4',
    cor2:       '#1A1D28',
    tagline:    '',
    segmento:   '',
    site:       '',
    ts:         Date.now(),
  }
}

// Lê um File e retorna { base64, mime }
export function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      const [header, base64] = dataUrl.split(',')
      const mime = header.split(';')[0].split(':')[1]
      resolve({ base64, mime })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
