import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PERMISSOES_PADRAO, type Role } from '@/lib/permissoes'

export const runtime = 'nodejs'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, cargo, role, permissoes } = await req.json()

    if (!nome || !email || !senha || !role) {
      return NextResponse.json({ error: 'nome, email, senha e role são obrigatórios' }, { status: 400 })
    }

    const supabase = adminClient()

    // Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // confirma automaticamente, sem e-mail
      user_metadata: { nome },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id
    const perms: string[] = permissoes ?? PERMISSOES_PADRAO[role as Role] ?? []

    // Atualiza o profile criado pelo trigger
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        nome,
        email,
        cargo: cargo ?? '',
        role,
        permissoes: perms,
        ativo: true,
      })

    if (profileError) {
      // Reverte criação do usuário auth se o profile falhar
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: userId, email, nome, role })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
