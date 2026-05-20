'use client'
import { useState } from 'react'

const clientes = ['Todos','TechNova Solutions','Construtora Viva Mais','Dr. Marcos Cardiologia','Sabor & Arte Restaurante','Imobiliária Prime','Clínica OdontoVida']
const periodos = ['Maio 2026','Abril 2026','Março 2026','Fevereiro 2026','Último Trimestre','Últimos 6 meses']

const metricas = [
  { canal: 'Google Ads', impressoes: 142900, cliques: 4240, ctr: '2.97%', conv: 109, cpa: 'R$ 78', gasto: 'R$ 8.502' },
  { canal: 'Meta Ads', impressoes: 89200, cliques: 2100, ctr: '2.35%', conv: 43, cpa: 'R$ 128', gasto: 'R$ 5.504' },
  { canal: 'Instagram Orgânico', impressoes: 52000, cliques: 1340, ctr: '2.58%', conv: 18, cpa: '—', gasto: '—' },
  { canal: 'SEO / Orgânico', impressoes: 0, cliques: 0, ctr: '—', conv: 156, cpa: 'R$ 16', gasto: 'R$ 2.500' },
  { canal: 'YouTube Ads', impressoes: 67000, cliques: 1890, ctr: '2.82%', conv: 31, cpa: 'R$ 65', gasto: 'R$ 2.015' },
]

const relatoriosMes = [
  { cliente: 'TechNova Solutions', periodo: 'Maio 2026', status: 'Enviado', data: '2026-05-10', tipo: 'Mensal' },
  { cliente: 'Construtora Viva Mais', periodo: 'Maio 2026', status: 'Pendente', data: '—', tipo: 'Mensal' },
  { cliente: 'Dr. Marcos Cardiologia', periodo: 'Maio 2026', status: 'Em Preparação', data: '—', tipo: 'Mensal' },
  { cliente: 'Imobiliária Prime', periodo: 'Maio 2026', status: 'Enviado', data: '2026-05-08', tipo: 'Mensal' },
  { cliente: 'Clínica OdontoVida', periodo: 'Maio 2026', status: 'Pendente', data: '—', tipo: 'Mensal' },
  { cliente: 'TechNova Solutions', periodo: 'Q1 2026', status: 'Enviado', data: '2026-04-02', tipo: 'Trimestral' },
]

const statusColor: Record<string, string> = { Enviado: 'badge-ok', Pendente: 'badge-wr', 'Em Preparação': 'badge-al' }

export default function RelatoriosPage() {
  const [clienteFilter, setClienteFilter] = useState('Todos')
  const [periodo, setPeriodo] = useState('Maio 2026')
  const [tab, setTab] = useState<'metricas' | 'relatorios'>('metricas')

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Relatórios & Analytics</span>
          <span className="tb-sub">Performance consolidada</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="inp" style={{ width: 160 }} value={clienteFilter} onChange={e => setClienteFilter(e.target.value)}>
            {clientes.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="inp" style={{ width: 150 }} value={periodo} onChange={e => setPeriodo(e.target.value)}>
            {periodos.map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="btn btn-al">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="content">
        {/* KPIs consolidados */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
          {[
            { label: 'Total Impressões', val: '351.100', color: 'var(--bl)' },
            { label: 'Total Cliques', val: '9.570', color: 'var(--pu)' },
            { label: 'CTR Médio', val: '2.72%', color: 'var(--al)' },
            { label: 'Total Conversões', val: '357', color: 'var(--ok)' },
            { label: 'CPA Médio', val: 'R$ 52', color: 'var(--wr)' },
          ].map(k => (
            <div key={k.label} className="kpi">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val" style={{ fontSize: 22, color: k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        <div className="tabs">
          <button className={`tab${tab === 'metricas' ? ' act' : ''}`} onClick={() => setTab('metricas')}>Métricas por Canal</button>
          <button className={`tab${tab === 'relatorios' ? ' act' : ''}`} onClick={() => setTab('relatorios')}>Relatórios Enviados</button>
        </div>

        {tab === 'metricas' ? (
          <div className="card">
            <table className="tbl">
              <thead>
                <tr><th>Canal</th><th>Impressões</th><th>Cliques</th><th>CTR</th><th>Conversões</th><th>CPA</th><th>Investimento</th></tr>
              </thead>
              <tbody>
                {metricas.map(m => (
                  <tr key={m.canal}>
                    <td style={{ fontWeight: 600, color: 'var(--wh)' }}>{m.canal}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{m.impressoes.toLocaleString('pt-BR')}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{m.cliques.toLocaleString('pt-BR')}</td>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--al)' }}>{m.ctr}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--ok)' }}>{m.conv}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{m.cpa}</td>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--er)' }}>{m.gasto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card">
            <table className="tbl">
              <thead>
                <tr><th>Cliente</th><th>Período</th><th>Tipo</th><th>Data Envio</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {relatoriosMes.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--wh)' }}>{r.cliente}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{r.periodo}</td>
                    <td><span className="badge badge-gr">{r.tipo}</span></td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{r.data}</td>
                    <td><span className={`badge ${statusColor[r.status]}`}>{r.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm">Ver</button>
                        {r.status !== 'Enviado' && <button className="btn btn-al btn-sm">Enviar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
