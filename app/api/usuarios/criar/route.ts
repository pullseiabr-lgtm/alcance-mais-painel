import { NextRequest, NextResponse } from 'next/server'
import { PERMISSOES_PADRAO, type Role } from '@/lib/permissoes'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, cargo, role, permissoes } = await req.json()

    if (!nome || !email || !senha || !role) {
      return NextResponse.json({ error: 'nome, email, senha e role são obrigatórios' }, { status: 400 })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    // ── Modo Supabase (produção) ──────────────────────────────────────
    if (serviceKey && supabaseUrl) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { nome },
      })

      if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

      const userId = authData.user.id
      const perms: string[] = permissoes ?? PERMISSOES_PADRAO[role as Role] ?? []

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: userId, nome, email, cargo: cargo ?? '', role, permissoes: perms, ativo: true })

      if (profileError) {
        await supabase.auth.admin.deleteUser(userId)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      return NextResponse.json({ ok: true, id: userId, email, nome, role })
    }

    // ── Modo local (dev sem Supabase) ────────────────────────────────
    const { criarUsuario } = await import('@/lib/usuarios-local')
    const novo = criarUsuario({ nome, email, senha, cargo, role: role as Role, permissoes })
    return NextResponse.json({ ok: true, ...novo })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
