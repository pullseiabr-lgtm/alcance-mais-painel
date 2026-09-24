// Analytics do portal: lê metricas_diarias (já alimentada pelo cron /api/trafego/sync) do cliente da sessão
import { NextRequest, NextResponse } from 'next/server'
import { admin, getCtx } from '@/lib/a7-server'

export const runtime = 'nodejs'

type Tot = { gasto: number; impressoes: number; cliques: number; conversoes: number }
const zero = (): Tot => ({ gasto: 0, impressoes: 0, cliques: 0, conversoes: 0 })
const soma = (t: Tot, r: any) => {
  t.gasto += Number(r.gasto) || 0; t.impressoes += Number(r.impressoes) || 0
  t.cliques += Number(r.cliques) || 0; t.conversoes += Number(r.conversoes) || 0
}
const iso = (d: Date) => d.toISOString().slice(0, 10)

export async function GET(req: NextRequest) {
  const ctx = await getCtx(req)
  if (!ctx) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (!ctx.clienteId) return NextResponse.json({ error: 'Selecione o cliente' }, { status: 400 })

  const dias = [7, 30, 90].includes(Number(req.nextUrl.searchParams.get('dias'))) ? Number(req.nextUrl.searchParams.get('dias')) : 30
  const fim = new Date()
  const iniAtual = new Date(Date.now() - (dias - 1) * 86400000)
  const iniAnterior = new Date(Date.now() - (2 * dias - 1) * 86400000)

  const sb = admin()
  const { data: linhas, error } = await sb.from('metricas_diarias').select('*')
    .eq('cliente_id', ctx.clienteId).gte('data', iso(iniAnterior)).lte('data', iso(fim)).order('data')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const atual = zero(), anterior = zero()
  const porDia: Record<string, Tot> = {}
  const porCanal: Record<string, Tot> = {}
  const porCamp: Record<string, Tot & { id: string; canal: string }> = {}

  for (const r of linhas ?? []) {
    if (r.data >= iso(iniAtual)) {
      soma(atual, r)
      soma((porDia[r.data] ??= zero()), r)
      soma((porCanal[r.canal] ??= zero()), r)
      const k = r.campanha_id ?? 'sem'
      soma((porCamp[k] ??= { ...zero(), id: k, canal: r.canal }), r)
    } else soma(anterior, r)
  }

  const ids = Object.keys(porCamp).filter(k => k !== 'sem')
  const nomes: Record<string, string> = {}
  if (ids.length) {
    const { data: cs } = await sb.from('campanhas').select('id,nome').in('id', ids)
    ;(cs ?? []).forEach((c: any) => { nomes[c.id] = c.nome })
  }

  // WhatsApp (conversas geradas) no período
  const { data: wa } = await sb.from('metricas_whatsapp').select('conversas')
    .eq('cliente_id', ctx.clienteId).gte('data', iso(iniAtual))
  const conversas = (wa ?? []).reduce((s: number, r: any) => s + (r.conversas || 0), 0)

  return NextResponse.json({
    dias, atual, anterior, conversas,
    temDados: (linhas ?? []).length > 0,
    porDia: Object.entries(porDia).map(([data, t]) => ({ data, ...t })),
    porCanal: Object.entries(porCanal).map(([canal, t]) => ({ canal, ...t })),
    porCampanha: Object.values(porCamp).map(c => ({ ...c, nome: nomes[c.id] || 'Campanha sem nome' }))
      .sort((a, b) => b.gasto - a.gasto),
  })
}
