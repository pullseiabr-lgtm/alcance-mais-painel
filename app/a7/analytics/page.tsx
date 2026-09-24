'use client'
import { useEffect, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts'
import { clientePreview, brl } from '@/lib/a7-client'
import { Cabecalho } from '../ui'

const CANAL: Record<string, string> = { meta: 'Meta Ads', google: 'Google Ads', tiktok: 'TikTok Ads' }
const num = (v: number) => (v || 0).toLocaleString('pt-BR')
const div = (a: number, b: number) => (b > 0 ? a / b : 0)

function Delta({ atual, ant, inverso }: { atual: number; ant: number; inverso?: boolean }) {
  if (!ant) return <small style={{ color: 'var(--mut)' }}>sem base anterior</small>
  const p = ((atual - ant) / ant) * 100
  const bom = inverso ? p <= 0 : p >= 0
  return <small style={{ color: bom ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{p >= 0 ? '▲' : '▼'} {Math.abs(p).toFixed(1)}% vs. período anterior</small>
}

export default function Analytics() {
  const [dias, setDias] = useState(30)
  const [d, setD] = useState<any>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    setD(null); setErro('')
    const c = clientePreview()
    fetch(`/api/a7/analytics?dias=${dias}${c ? `&cliente_id=${c}` : ''}`).then(async r => {
      const j = await r.json(); if (!r.ok) throw new Error(j.error); setD(j)
    }).catch(e => setErro(e.message))
  }, [dias])

  const a = d?.atual, p = d?.anterior
  const ctr = a ? div(a.cliques, a.impressoes) * 100 : 0
  const cpc = a ? div(a.gasto, a.cliques) : 0
  const cpl = a ? div(a.gasto, a.conversoes) : 0
  const cplAnt = p ? div(p.gasto, p.conversoes) : 0

  return (
    <div className="a7-page">
      <Cabecalho titulo="Analytics de tráfego pago" sub="Resultados dos anúncios, atualizados automaticamente todos os dias."
        acao={<div className="a7-tabs" style={{ margin: 0 }}>
          {[7, 30, 90].map(n => <span key={n} className={`a7-chip ${dias === n ? 'on' : ''}`} onClick={() => setDias(n)}>{n} dias</span>)}
        </div>} />
      {erro && <div className="a7-err">{erro}</div>}
      {!d && !erro && <div className="a7-empty">Carregando…</div>}
      {d && !d.temDados && (
        <div className="a7-warn">Ainda não há dados de anúncios sincronizados para esta conta. Assim que as contas de anúncio forem conectadas, os números aparecem aqui. Enquanto isso, veja o resumo manual em <b>Campanhas e tráfego</b>.</div>
      )}
      {d && d.temDados && (
        <>
          <div className="a7-grid a7-g4" style={{ marginBottom: 16 }}>
            <div className="a7-card a7-kpi"><div className="n">{brl(a.gasto)}</div><div className="l">Investido</div><Delta atual={a.gasto} ant={p.gasto} /></div>
            <div className="a7-card a7-kpi"><div className="n">{num(a.impressoes)}</div><div className="l">Impressões</div><Delta atual={a.impressoes} ant={p.impressoes} /></div>
            <div className="a7-card a7-kpi"><div className="n">{num(a.cliques)}</div><div className="l">Cliques · CTR {ctr.toFixed(2)}% · CPC {brl(cpc)}</div><Delta atual={a.cliques} ant={p.cliques} /></div>
            <div className="a7-card a7-kpi"><div className="n">{num(a.conversoes)}</div><div className="l">Conversões / leads</div><Delta atual={a.conversoes} ant={p.conversoes} /></div>
            <div className="a7-card a7-kpi"><div className="n">{a.conversoes ? brl(cpl) : '—'}</div><div className="l">Custo por conversão</div><Delta atual={cpl} ant={cplAnt} inverso /></div>
            {d.conversas > 0 && <div className="a7-card a7-kpi"><div className="n">{num(d.conversas)}</div><div className="l">Conversas no WhatsApp</div></div>}
          </div>

          <div className="a7-card" style={{ marginBottom: 16 }}>
            <b>Investimento e conversões por dia</b>
            <div style={{ height: 260, marginTop: 10 }}>
              <ResponsiveContainer>
                <LineChart data={d.porDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="data" tickFormatter={(v: string) => v.slice(8) + '/' + v.slice(5, 7)} fontSize={11} />
                  <YAxis yAxisId="l" fontSize={11} /><YAxis yAxisId="r" orientation="right" fontSize={11} />
                  <Tooltip formatter={(v: any, n: any) => (n === 'Investido' ? brl(Number(v)) : v)} />
                  <Legend />
                  <Line yAxisId="l" type="monotone" dataKey="gasto" name="Investido" stroke="#00A89A" strokeWidth={2} dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="conversoes" name="Conversões" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="a7-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>
            <div className="a7-card">
              <b>Por canal</b>
              <div style={{ height: 220, marginTop: 10 }}>
                <ResponsiveContainer>
                  <BarChart data={d.porCanal.map((c: any) => ({ ...c, canal: CANAL[c.canal] || c.canal }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="canal" fontSize={11} /><YAxis fontSize={11} />
                    <Tooltip formatter={(v: any) => brl(Number(v))} /><Bar dataKey="gasto" name="Investido" fill="#00A89A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="a7-card" style={{ overflowX: 'auto' }}>
              <b>Campanhas</b>
              <table style={{ width: '100%', fontSize: 12, marginTop: 8, borderCollapse: 'collapse' }}>
                <thead><tr style={{ color: 'var(--mut)', textAlign: 'left' }}><th>Campanha</th><th>Invest.</th><th>Cliques</th><th>Conv.</th><th>CPL</th></tr></thead>
                <tbody>
                  {d.porCampanha.map((c: any) => (
                    <tr key={c.id} style={{ borderTop: '1px solid var(--bd)' }}>
                      <td style={{ padding: '7px 4px' }}>{c.nome}<br /><small style={{ color: 'var(--mut)' }}>{CANAL[c.canal] || c.canal}</small></td>
                      <td>{brl(c.gasto)}</td><td>{num(c.cliques)}</td><td>{num(c.conversoes)}</td><td>{c.conversoes ? brl(c.gasto / c.conversoes) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
