import { NextRequest, NextResponse } from 'next/server'
import * as metaAds from '@/lib/meta-ads'
import * as googleAds from '@/lib/google-ads'
import { avaliarAlertas, type LinhaMetrica } from '@/lib/trafego-alertas'

export const runtime = 'nodejs'
export const maxDuration = 120

/**
 * Sincroniza métricas do dia anterior (Meta Ads + Google Ads) para metricas_diarias.
 * Disparar via cron diário (ex.: Vercel Cron) com header Authorization: Bearer SYNC_SECRET.
 */
export async function GET(req: NextRequest) {
  // Vercel Cron envia automaticamente "Authorization: Bearer $CRON_SECRET" quando configurado
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
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

  const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const data = ontem.toISOString().slice(0, 10) // YYYY-MM-DD

  const { data: clientes, error: clientesErr } = await supabase
    .from('clientes')
    .select('id, nome, meta_ads_id, google_ads_id')

  if (clientesErr) {
    return NextResponse.json({ error: clientesErr.message }, { status: 500 })
  }

  const registros: { linha: LinhaMetrica; nome: string }[] = []
  const erros: string[] = []

  for (const cliente of clientes || []) {
    if (cliente.meta_ads_id) {
      try {
        const insights = await metaAds.getInsights(cliente.meta_ads_id, 'yesterday', 'campaign')
        if (!insights?.error && Array.isArray(insights?.data)) {
          for (const row of insights.data) {
            const linha = await montarLinhaMeta(supabase, cliente, row, data)
            registros.push({ linha, nome: row.campaign_name || 'Campanha sem nome' })
          }
        } else if (insights?.error) {
          erros.push(`Meta (${cliente.nome}): ${insights.message}`)
        }
      } catch (err) {
        erros.push(`Meta (${cliente.nome}): ${err instanceof Error ? err.message : 'erro'}`)
      }
    }

    if (cliente.google_ads_id) {
      try {
        const insights = await googleAds.getInsights(cliente.google_ads_id, 'yesterday', 'campaign')
        const resultados = insights?.results || insights?.data
        if (!insights?.error && Array.isArray(resultados)) {
          for (const row of resultados) {
            const linha = await montarLinhaGoogle(supabase, cliente, row, data)
            registros.push({ linha, nome: row.campaign?.name || 'Campanha sem nome' })
          }
        } else if (insights?.error) {
          erros.push(`Google (${cliente.nome}): ${insights.message}`)
        }
      } catch (err) {
        erros.push(`Google (${cliente.nome}): ${err instanceof Error ? err.message : 'erro'}`)
      }
    }
  }

  let gravadas = 0
  if (registros.length > 0) {
    const linhas = registros.map(r => r.linha)
    const { error: upsertErr, count } = await supabase
      .from('metricas_diarias')
      .upsert(linhas, { onConflict: 'campanha_id,canal,data', count: 'exact' })

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message, parcial: linhas.length, erros }, { status: 500 })
    }
    gravadas = count ?? linhas.length
  }

  // Motor de alertas — avalia cada linha sincronizada e persiste os disparos
  let alertasGerados = 0
  const alertas = registros
    .filter(r => r.linha.campanha_id) // alertas exigem campanha vinculada
    .flatMap(r => avaliarAlertas(r.linha, r.nome))

  if (alertas.length > 0) {
    const { error: alertaErr, count } = await supabase
      .from('alertas_trafego')
      .upsert(alertas, { onConflict: 'campanha_id,tipo,data', count: 'exact' })

    if (alertaErr) erros.push(`Alertas: ${alertaErr.message}`)
    else alertasGerados = count ?? alertas.length
  }

  return NextResponse.json({ ok: true, data, gravadas, alertas: alertasGerados, erros })
}

async function campanhaIdPorNome(supabase: any, clienteId: string, nome: string, canal: string) {
  const { data } = await supabase
    .from('campanhas')
    .select('id')
    .eq('cliente_id', clienteId)
    .eq('nome', nome)
    .maybeSingle()
  return data?.id ?? null
}

async function montarLinhaMeta(supabase: any, cliente: any, row: any, data: string) {
  const campanhaId = await campanhaIdPorNome(supabase, cliente.id, row.campaign_name, 'meta')
  const impressoes = Number(row.impressions || 0)
  const cliques = Number(row.clicks || 0)
  const gasto = Number(row.spend || 0)
  return {
    campanha_id: campanhaId,
    cliente_id: cliente.id,
    canal: 'meta' as const,
    data,
    impressoes,
    cliques,
    gasto,
    conversoes: Number(row.conversions || 0),
    ctr: Number(row.ctr || 0),
    cpc: Number(row.cpc || 0),
    cpm: Number(row.cpm || 0),
    frequencia: Number(row.frequency || 0),
  }
}

async function montarLinhaGoogle(supabase: any, cliente: any, row: any, data: string) {
  const campanha = row.campaign || {}
  const metricas = row.metrics || {}
  const campanhaId = await campanhaIdPorNome(supabase, cliente.id, campanha.name, 'google')
  const custoMicros = Number(metricas.costMicros ?? metricas.cost_micros ?? 0)
  const cpcMicros = Number(metricas.averageCpc ?? metricas.average_cpc ?? 0)
  const cpmMicros = Number(metricas.averageCpm ?? metricas.average_cpm ?? 0)
  return {
    campanha_id: campanhaId,
    cliente_id: cliente.id,
    canal: 'google' as const,
    data,
    impressoes: Number(metricas.impressions || 0),
    cliques: Number(metricas.clicks || 0),
    gasto: custoMicros / 1_000_000,
    conversoes: Number(metricas.conversions || 0),
    ctr: Number(metricas.ctr || 0),
    cpc: cpcMicros / 1_000_000,
    cpm: cpmMicros / 1_000_000,
    frequencia: 0,
  }
}
