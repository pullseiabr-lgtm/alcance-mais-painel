import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!key) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' }, { status: 400 })
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await supabase
      .from('profiles')
      .select('id,nome,email,cargo,role,permissoes,ativo,created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, usuarios: data })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 500 })
  }
}
