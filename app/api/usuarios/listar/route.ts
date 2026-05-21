import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    // ── Modo Supabase (produção) ──────────────────────────────────────
    if (serviceKey && supabaseUrl) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      const { data, error } = await supabase
        .from('profiles')
        .select('id,nome,email,cargo,role,permissoes,ativo,created_at')
        .order('created_at', { ascending: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true, usuarios: data })
    }

    // ── Modo local (dev sem Supabase) ────────────────────────────────
    const { listarUsuarios } = await import('@/lib/usuarios-local')
    return NextResponse.json({ ok: true, usuarios: listarUsuarios() })

  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 500 })
  }
}
