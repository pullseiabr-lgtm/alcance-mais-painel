// Utilitários de servidor do A7: sessão do cliente, cliente Supabase (service role), cofre AES-GCM
import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { criarToken, verificarToken } from '@/lib/auth-session'

export const A7_COOKIE = 'a7_session'
const STAFF_ROLES = ['admin', 'gestor', 'criativo']

export function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export function hashSenha(senha: string) {
  return crypto.createHash('sha256').update(senha + 'a7-alcance-2026').digest('hex')
}

export async function tokenCliente(email: string, clienteId: string) {
  return criarToken(email, `a7:${clienteId}`)
}

export type Ctx =
  | { tipo: 'cliente'; clienteId: string; email: string }
  | { tipo: 'staff'; clienteId: string | null; email: string }

/** Identifica quem chama: cliente do portal (cookie a7_session) ou equipe (alcance_session). */
export async function getCtx(req: NextRequest): Promise<Ctx | null> {
  const a7 = req.cookies.get(A7_COOKIE)?.value
  if (a7) {
    const s = await verificarToken(a7)
    if (s && s.role.startsWith('a7:')) return { tipo: 'cliente', clienteId: s.role.slice(3), email: s.email }
  }
  const st = req.cookies.get('alcance_session')?.value
  if (st) {
    const s = await verificarToken(st)
    if (s && STAFF_ROLES.includes(s.role)) {
      return { tipo: 'staff', clienteId: req.nextUrl.searchParams.get('cliente_id'), email: s.email }
    }
  }
  return null
}

// ── Cofre de senhas (AES-256-GCM) ────────────────────────────────
function chave() {
  const base = process.env.A7_VAULT_KEY || process.env.AUTH_SECRET || 'alcance-secret-2026-interno'
  return crypto.createHash('sha256').update('a7-vault:' + base).digest()
}

export function cifrar(texto: string): string {
  if (!texto) return ''
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv('aes-256-gcm', chave(), iv)
  const enc = Buffer.concat([c.update(texto, 'utf8'), c.final()])
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64')
}

export function decifrar(b64: string): string {
  if (!b64) return ''
  try {
    const buf = Buffer.from(b64, 'base64')
    const d = crypto.createDecipheriv('aes-256-gcm', chave(), buf.subarray(0, 12))
    d.setAuthTag(buf.subarray(12, 28))
    return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString('utf8')
  } catch { return '' }
}
