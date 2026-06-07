import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Agrega metricas_diarias para o Dashboard Executivo do módulo Tráfego.
 * Query params: ?dias=30 (janela de série temporal, default 30)
 */
export async function GET(req: NextRequest) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const dias = Number(req.nextUrl.searchParams.get('dias') || '30')
  const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const hoje = new Date().toISOString().slice(0, 10)

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: linhas, error } = await supabase
    .from('metricas_diarias')
    .select('data, canal, impressoes, cliques, gasto, conversoes')
    .gte('data', desde)
    .order('data', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const todas = linhas || []

  // KPIs agregados do período
  const totais = todas.reduce((acc, r) => {
    acc.investimento += Number(r.gasto || 0)
    acc.impressoes += Number(r.impressoes || 0)
    acc.cliques += Number(r.cliques || 0)
    acc.conversoes += Number(r.conversoes || 0)
    return acc
  }, { investimento: 0, impressoes: 0, cliques: 0, conversoes: 0 })

  // Investimento de hoje
  const investimentoHoje = todas
    .filter(r => r.data === hoje)
    .reduce((s, r) => s + Number(r.gasto || 0), 0)

  // Série diária (somando canais por data)
  const porData = new Map<string, { data: string; investimento: number; cliques: number; conversoes: number }>()
  for (const r of todas) {
    const atual = porData.get(r.data) || { data: r.data, investimento: 0, cliques: 0, conversoes: 0 }
    atual.investimento += Number(r.gasto || 0)
    atual.cliques += Number(r.cliques || 0)
    atual.conversoes += Number(r.conversoes || 0)
    porData.set(r.data, atual)
  }
  const serie = Array.from(porData.values()).sort((a, b) => a.data.localeCompare(b.data))

  // Quebra por canal
  const porCanal = new Map<string, { canal: string; investimento: number; cliques: number; conversoes: number }>()
  for (const r of todas) {
    const atual = porCanal.get(r.canal) || { canal: r.canal, investimento: 0, cliques: 0, conversoes: 0 }
    atual.investimento += Number(r.gasto || 0)
    atual.cliques += Number(r.cliques || 0)
    atual.conversoes += Number(r.conversoes || 0)
    porCanal.set(r.canal, atual)
  }

  const ctr = totais.impressoes > 0 ? (totais.cliques / totais.impressoes) * 100 : 0
  const cpc = totais.cliques > 0 ? totais.investimento / totais.cliques : 0
  const custoConversao = totais.conversoes > 0 ? totais.investimento / totais.conversoes : 0

  return NextResponse.json({
    ok: true,
    periodo: { desde, ate: hoje, dias },
    kpis: {
      investimento_hoje: investimentoHoje,
      investimento_periodo: totais.investimento,
      impressoes: totais.impressoes,
      cliques: totais.cliques,
      conversoes: totais.conversoes,
      ctr,
      cpc,
      custo_por_conversao: custoConversao,
    },
    serie,
    canais: Array.from(porCanal.values()),
  })
}
