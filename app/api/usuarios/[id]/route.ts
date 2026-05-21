import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { nome, cargo, role, permissoes, ativo, senha } = body
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    // ── Modo Supabase ────────────────────────────────────────────────
    if (serviceKey && supabaseUrl) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      if (senha) {
        const { error } = await supabase.auth.admin.updateUserById(params.id, { password: senha })
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      }
      const updates: Record<string, unknown> = {}
      if (nome !== undefined)       updates.nome = nome
      if (cargo !== undefined)      updates.cargo = cargo
      if (role !== undefined)       updates.role = role
      if (permissoes !== undefined) updates.permissoes = permissoes
      if (ativo !== undefined)      updates.ativo = ativo
      const { error } = await supabase.from('profiles').update(updates).eq('id', params.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    // ── Modo local ───────────────────────────────────────────────────
    const { atualizarUsuario } = await import('@/lib/usuarios-local')
    const atualizado = atualizarUsuario(params.id, { nome, cargo, role, permissoes, ativo, ...(senha ? { senha } : {}) })
    return NextResponse.json({ ok: true, ...atualizado })

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    // ── Modo Supabase ────────────────────────────────────────────────
    if (serviceKey && supabaseUrl) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { error } = await supabase.auth.admin.deleteUser(params.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ ok: true })
    }

    // ── Modo local ───────────────────────────────────────────────────
    const { deletarUsuario } = await import('@/lib/usuarios-local')
    deletarUsuario(params.id)
    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 500 })
  }
}
