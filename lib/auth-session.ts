import crypto from 'crypto'

const SECRET = process.env.AUTH_SECRET ?? 'alcance-secret-2026-interno'

export function criarToken(email: string, role: string): string {
  const payload = JSON.stringify({ email, role, ts: Date.now() })
  const b64 = Buffer.from(payload).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url')
  return `${b64}.${sig}`
}

export function verificarToken(token: string): { email: string; role: string; ts: number } | null {
  try {
    const [b64, sig] = token.split('.')
    if (!b64 || !sig) return null
    const expected = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url')
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString())
    // Token válido por 30 dias
    if (Date.now() - payload.ts > 30 * 24 * 60 * 60 * 1000) return null
    return payload
  } catch {
    return null
  }
}

export function getAdminUsers(): Array<{ email: string; senha: string; nome: string; role: string }> {
  const users = []

  // Usuário do env var (produção/Vercel)
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    users.push({
      email: process.env.ADMIN_EMAIL,
      senha: process.env.ADMIN_PASSWORD,
      nome: process.env.ADMIN_NOME ?? 'Administrador',
      role: 'admin',
    })
  }

  // Usuário padrão dev (sempre disponível como fallback)
  users.push({
    email: 'admin@alcance.com',
    senha: 'alcance2026',
    nome: 'Administrador',
    role: 'admin',
  })

  return users
}
