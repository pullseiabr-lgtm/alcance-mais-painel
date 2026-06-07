import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) return null
  return { serviceKey, supabaseUrl }
}

/** Lista alertas ativos (não resolvidos), mais recentes primeiro. */
export async function GET(req: NextRequest) {
  const conf = getSupabase()
  if (!conf) return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(conf.supabaseUrl, conf.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const apenasAtivos = req.nextUrl.searchParams.get('todos') !== '1'

  let query = supabase
    .from('alertas_trafego')
    .select('id, campanha_id, cliente_id, canal, tipo, severidade, mensagem, valor, limite, data, resolvido, created_at')
    .order('data', { ascending: false })
    .order('severidade', { ascending: true })
    .limit(100)

  if (apenasAtivos) query = query.eq('resolvido', false)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, alertas: data })
}

/** Marca um alerta como resolvido. Body: { id: string } */
export async function PATCH(req: NextRequest) {
  const conf = getSupabase()
  if (!conf) return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(conf.supabaseUrl, conf.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await supabase
    .from('alertas_trafego')
    .update({ resolvido: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
