// auth-session.ts — usa Web Crypto API (compatível com Edge + Node.js)

const SECRET = process.env.AUTH_SECRET ?? 'alcance-secret-2026-interno'

function b64url(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString('base64url')
}

async function getKey(): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function criarToken(email: string, role: string): Promise<string> {
  const payload = JSON.stringify({ email, role, ts: Date.now() })
  const b64 = Buffer.from(payload).toString('base64url')
  const key = await getKey()
  const sig = b64url(await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(b64)))
  return `${b64}.${sig}`
}

export async function verificarToken(token: string): Promise<{ email: string; role: string; ts: number } | null> {
  try {
    const dot = token.lastIndexOf('.')
    if (dot < 0) return null
    const b64 = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    const key = await getKey()
    const sigBytes = Buffer.from(sig, 'base64url')
    const valid = await globalThis.crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(b64))
    if (!valid) return null
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString())
    if (Date.now() - payload.ts > 30 * 24 * 60 * 60 * 1000) return null
    return payload
  } catch {
    return null
  }
}

export function getAdminUsers(): Array<{ email: string; senha: string; nome: string; role: string }> {
  const users: Array<{ email: string; senha: string; nome: string; role: string }> = []

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    users.push({
      email: process.env.ADMIN_EMAIL,
      senha: process.env.ADMIN_PASSWORD,
      nome: process.env.ADMIN_NOME ?? 'Administrador',
      role: 'admin',
    })
  }

  // Credencial padrão sempre disponível
  users.push({
    email: 'admin@alcance.com',
    senha: 'alcance2026',
    nome: 'Administrador',
    role: 'admin',
  })

  return users
}
