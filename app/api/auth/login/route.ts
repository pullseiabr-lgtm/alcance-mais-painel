import { NextRequest, NextResponse } from 'next/server'
import { criarToken, getAdminUsers } from '@/lib/auth-session'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()

    if (!email || !senha) {
      return NextResponse.json({ error: 'E-mail e senha obrigatórios' }, { status: 400 })
    }

    // Verificar contra usuários admin do env
    const admins = getAdminUsers()
    const admin = admins.find(u => u.email === email && u.senha === senha)

    if (admin) {
      const token = criarToken(admin.email, admin.role)
      const res = NextResponse.json({ ok: true, nome: admin.nome, role: admin.role })
      res.cookies.set('alcance_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: '/',
      })
      return res
    }

    // Se Supabase configurado, tentar autenticar por lá também
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
          // Buscar role do profile
          const { data: profile } = await supabase
            .from('profiles').select('role, nome').eq('id', data.user.id).single()
          const role = profile?.role ?? 'viewer'
          const nome = profile?.nome ?? email
          const token = criarToken(email, role)
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
      } catch { /* ignora erro Supabase */ }
    }

    // Verificar usuários locais (dev)
    try {
      const { listarUsuarios } = await import('@/lib/usuarios-local')
      const crypto = await import('crypto')
      const hash = crypto.createHash('sha256').update(senha + 'alcance2026').digest('hex')
      const localUsers = listarUsuarios() as Array<{ email: string; nome: string; role: string; ativo: boolean }>
      // Precisamos verificar o hash — importar função auxiliar
      const fs = await import('fs')
      const path = await import('path')
      const dbPath = path.join(process.cwd(), '.usuarios-dev.json')
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) as Array<{ email: string; nome: string; role: string; ativo: boolean; senha_hash: string }>
        const u = db.find(u => u.email === email && u.senha_hash === hash && u.ativo)
        if (u) {
          const token = criarToken(u.email, u.role)
          const res = NextResponse.json({ ok: true, nome: u.nome, role: u.role })
          res.cookies.set('alcance_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
          })
          return res
        }
      }
    } catch { /* sem armazenamento local */ }

    return NextResponse.json({ error: 'E-mail ou senha inválidos' }, { status: 401 })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
