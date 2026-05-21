import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

// Atualizar usuário (role, permissões, cargo, ativo)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' }, { status: 400 })
    }

    const body = await req.json()
    const { nome, cargo, role, permissoes, ativo, senha } = body
    const supabase = admin()

    // Atualiza senha se fornecida
    if (senha) {
      const { error } = await supabase.auth.admin.updateUserById(params.id, { password: senha })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Atualiza profile
    const updates: Record<string, unknown> = {}
    if (nome !== undefined)       updates.nome = nome
    if (cargo !== undefined)      updates.cargo = cargo
    if (role !== undefined)       updates.role = role
    if (permissoes !== undefined) updates.permissoes = permissoes
    if (ativo !== undefined)      updates.ativo = ativo

    const { error } = await supabase.from('profiles').update(updates).eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 500 })
  }
}

// Excluir usuário
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' }, { status: 400 })
    }

    const supabase = admin()
    const { error } = await supabase.auth.admin.deleteUser(params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 500 })
  }
}
