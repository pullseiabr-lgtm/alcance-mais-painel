import { NextRequest, NextResponse } from 'next/server'
import * as metaAds from '@/lib/meta-ads'
import * as googleAds from '@/lib/google-ads'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Lista campanhas + insights ao vivo de um canal (Meta ou Google) para todos
 * os clientes que possuem a conta vinculada. Usado pelas sub-abas do módulo Tráfego.
 * Query params: ?canal=meta|google&periodo=last_7d
 */
export async function GET(req: NextRequest) {
  const canal = req.nextUrl.searchParams.get('canal')
  const periodo = req.nextUrl.searchParams.get('periodo') || 'last_7d'

  if (canal !== 'meta' && canal !== 'google') {
    return NextResponse.json({ error: 'Parâmetro canal deve ser "meta" ou "google"' }, { status: 400 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const campo = canal === 'meta' ? 'meta_ads_id' : 'google_ads_id'
  const { data: clientes, error: clientesErr } = await supabase
    .from('clientes')
    .select(`id, nome, ${campo}`)
    .not(campo, 'is', null)

  if (clientesErr) return NextResponse.json({ error: clientesErr.message }, { status: 500 })

  const grupos: { cliente: string; cliente_id: string; campanhas: any[]; erro?: string }[] = []

  for (const cliente of clientes || []) {
    const contaId = (cliente as any)[campo]
    if (!contaId) continue

    try {
      const insights = canal === 'meta'
        ? await metaAds.getInsights(contaId, periodo, 'campaign')
        : await googleAds.getInsights(contaId, periodo, 'campaign')

      if (insights?.error) {
        grupos.push({ cliente: cliente.nome, cliente_id: cliente.id, campanhas: [], erro: insights.message })
        continue
      }

      const linhas = canal === 'meta' ? (insights?.data || []) : (insights?.results || insights?.data || [])
      const campanhas = linhas.map((row: any) => normalizar(canal, row))
      grupos.push({ cliente: cliente.nome, cliente_id: cliente.id, campanhas })
    } catch (err) {
      grupos.push({ cliente: cliente.nome, cliente_id: cliente.id, campanhas: [], erro: err instanceof Error ? err.message : 'Erro ao consultar API' })
    }
  }

  return NextResponse.json({ ok: true, canal, periodo, grupos })
}

function normalizar(canal: 'meta' | 'google', row: any) {
  if (canal === 'meta') {
    return {
      nome: row.campaign_name,
      impressoes: Number(row.impressions || 0),
      cliques: Number(row.clicks || 0),
      gasto: Number(row.spend || 0),
      ctr: Number(row.ctr || 0),
      cpc: Number(row.cpc || 0),
      conversoes: Number(row.conversions || 0),
      frequencia: Number(row.frequency || 0),
    }
  }
  const campanha = row.campaign || {}
  const m = row.metrics || {}
  return {
    nome: campanha.name,
    impressoes: Number(m.impressions || 0),
    cliques: Number(m.clicks || 0),
    gasto: Number(m.costMicros ?? m.cost_micros ?? 0) / 1_000_000,
    ctr: Number(m.ctr || 0),
    cpc: Number(m.averageCpc ?? m.average_cpc ?? 0) / 1_000_000,
    conversoes: Number(m.conversions || 0),
    frequencia: 0,
  }
}
