import { NextRequest, NextResponse } from 'next/server'
import { criarToken, getAdminUsers } from '@/lib/auth-session'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'E-mail e senha obrigatórios' }, { status: 400 })
    }

    const setCookie = async (userEmail: string, role: string, nome: string) => {
      const token = await criarToken(userEmail, role)
      const res = NextResponse.json({ ok: true, nome, role })
      res.cookies.set('alcance_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      })
      return res
    }

    // ── 1. Credenciais admin (env vars + padrão) ─────────────────────
    const admins = getAdminUsers()
    const admin = admins.find(u => u.email === email && u.senha === senha)
    if (admin) return setCookie(admin.email, admin.role, admin.nome)

    // ── 2. Usuários locais dev (.usuarios-dev.json) ──────────────────
    try {
      const fs = await import('fs')
      const path = await import('path')
      const crypto = await import('crypto')
      const dbPath = path.join(process.cwd(), '.usuarios-dev.json')
      if (fs.existsSync(dbPath)) {
        type UserDB = { email: string; nome: string; role: string; ativo: boolean; senha_hash: string }
        const db: UserDB[] = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
        const hash = crypto.createHash('sha256').update(senha + 'alcance2026').digest('hex')
        const u = db.find(u => u.email === email && u.senha_hash === hash && u.ativo)
        if (u) return setCookie(u.email, u.role, u.nome)
      }
    } catch { /* sem arquivo local */ }

    // ── 3. Supabase Auth (se configurado) ────────────────────────────
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (serviceKey && supabaseUrl) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (!error && data.user) {
          const { data: profile } = await supabase
            .from('profiles').select('role,nome').eq('id', data.user.id).single()
          return setCookie(email, profile?.role ?? 'viewer', profile?.nome ?? email)
        }
      } catch { /* ignora erro Supabase */ }
    }

    return NextResponse.json({ error: 'E-mail ou senha inválidos' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
