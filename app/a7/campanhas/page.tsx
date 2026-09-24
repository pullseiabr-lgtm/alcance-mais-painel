'use client'
import { useA7, brl, fmtData } from '@/lib/a7-client'
import { Badge, Cabecalho, Estado } from '../ui'

const n = (v: any) => Number(v) || 0
const pct = (a: number, b: number) => (b > 0 ? ((a / b) * 100).toFixed(2) + '%' : '—')
const div = (a: number, b: number) => (b > 0 ? brl(a / b) : '—')

export default function Campanhas() {
  const { dados, carregando, erro } = useA7('campanhas')
  const tot = dados.reduce((t, c) => ({
    gasto: t.gasto + n(c.gasto), imp: t.imp + n(c.impressoes), cli: t.cli + n(c.cliques), conv: t.conv + n(c.conversoes),
  }), { gasto: 0, imp: 0, cli: 0, conv: 0 })

  return (
    <div className="a7-page">
      <Cabecalho titulo="Campanhas e tráfego pago" sub="Onde o seu investimento está sendo aplicado e o que ele trouxe." />
      <div className="a7-grid a7-g4" style={{ marginBottom: 18 }}>
        <div className="a7-card a7-kpi"><div className="n">{brl(tot.gasto)}</div><div className="l">Investido</div></div>
        <div className="a7-card a7-kpi"><div className="n">{tot.imp.toLocaleString('pt-BR')}</div><div className="l">Impressões</div></div>
        <div className="a7-card a7-kpi"><div className="n">{tot.cli.toLocaleString('pt-BR')}</div><div className="l">Cliques · CTR {pct(tot.cli, tot.imp)}</div></div>
        <div className="a7-card a7-kpi"><div className="n">{tot.conv.toLocaleString('pt-BR')}</div><div className="l">Conversões · custo {div(tot.gasto, tot.conv)}</div></div>
      </div>
      <Estado carregando={carregando} erro={erro} vazio={!carregando && dados.length === 0} msgVazio="Nenhuma campanha cadastrada ainda." />
      <div className="a7-grid a7-g3">
        {dados.map(c => {
          const uso = n(c.orcamento) > 0 ? Math.min(100, (n(c.gasto) / n(c.orcamento)) * 100) : 0
          return (
            <div key={c.id} className="a7-card">
              <div className="a7-row" style={{ justifyContent: 'space-between' }}>
                <small style={{ color: 'var(--mut)' }}>{c.canal}</small><Badge s={c.status} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, margin: '6px 0 2px' }}>{c.nome}</div>
              <small style={{ color: 'var(--mut)' }}>{c.objetivo} {c.inicio && `· ${fmtData(c.inicio)}${c.fim ? ' → ' + fmtData(c.fim) : ''}`}</small>
              <div style={{ margin: '12px 0 4px', fontSize: 12 }}>{brl(n(c.gasto))} de {brl(n(c.orcamento))}</div>
              <div style={{ height: 6, background: '#e2e8f0', borderRadius: 4 }}><div style={{ width: `${uso}%`, height: 6, background: 'var(--t)', borderRadius: 4 }} /></div>
              <div className="a7-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 12, fontSize: 12 }}>
                <div><b>{n(c.impressoes).toLocaleString('pt-BR')}</b><br /><span style={{ color: 'var(--mut)' }}>impressões</span></div>
                <div><b>{n(c.cliques).toLocaleString('pt-BR')}</b><br /><span style={{ color: 'var(--mut)' }}>cliques · CTR {pct(n(c.cliques), n(c.impressoes))}</span></div>
                <div><b>{n(c.conversoes).toLocaleString('pt-BR')}</b><br /><span style={{ color: 'var(--mut)' }}>conversões</span></div>
                <div><b>{div(n(c.gasto), n(c.conversoes))}</b><br /><span style={{ color: 'var(--mut)' }}>custo / conversão</span></div>
              </div>
              {c.resultado && <p style={{ background: '#f8fafc', borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 0 }}>💡 {c.resultado}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
