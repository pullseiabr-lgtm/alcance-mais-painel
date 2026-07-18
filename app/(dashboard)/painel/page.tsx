'use client'
import { useEffect, useState } from 'react'
import { getDashboardKPIs, type DashboardKPIs } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'

const fmt = (v: number) =>
  v >= 1000 ? `R$ ${(v / 1000).toFixed(1).replace('.', ',')}k` : `R$ ${v.toLocaleString('pt-BR')}`

const statusColor: Record<string, string> = {
  ativo: 'badge-ok', onboarding: 'badge-al', pausado: 'badge-wr', inativo: 'badge-er',
}

export default function DashboardPage() {
  const [kpis, setKpis]       = useState<DashboardKPIs | null>(null)
  const [clientes, setClientes] = useState<any[]>([])
  const [projetos, setProjetos] = useState<any[]>([])
  const [pipeline, setPipeline] = useState<any[]>([])
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const sb = createClient()
      const [kpisData, { data: cls }, { data: prj }, { data: pip }] = await Promise.all([
        getDashboardKPIs(),
        sb.from('clientes').select('*').order('created_at', { ascending: false }).limit(5),
        sb.from('projetos').select('*').eq('status', 'em_andamento').limit(5),
        sb.from('pipeline').select('*').order('created_at', { ascending: false }).limit(8),
      ])
      setKpis(kpisData)
      setClientes(cls ?? [])
      setProjetos(prj ?? [])
      setPipeline(pip ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const kpiCards = kpis ? [
    { label: 'MRR',                  val: fmt(kpis.mrr),            delta: `${kpis.clientesAtivos} ativos`,  up: true,  icon: '💰', color: 'var(--al)' },
    { label: 'Clientes Ativos',      val: String(kpis.clientesAtivos), delta: `${kpis.totalClientes} total`, up: true,  icon: '🏢', color: 'var(--bl)' },
    { label: 'Projetos em Andamento',val: String(kpis.projetosAtivos), delta: `${kpis.projetosConcluidos} concluídos`, up: true, icon: '📋', color: 'var(--pu)' },
    { label: 'Campanhas Ativas',     val: String(kpis.campanhasAtivas), delta: 'em execução',                up: true,  icon: '🚀', color: 'var(--wr)' },
    { label: 'Receita do Mês',       val: fmt(kpis.receitaMes),     delta: `Margem ${kpis.margemMes.toFixed(0)}%`, up: kpis.margemMes > 0, icon: '📊', color: 'var(--ok)' },
    { label: 'Ticket Médio',         val: fmt(kpis.ticketMedio),    delta: `${kpis.propostasAbertas} propostas abertas`, up: true, icon: '🎯', color: 'var(--cy)' },
  ] : []

  const etapas = ['prospeccao','qualificacao','proposta','negociacao','fechado','perdido']
  const funnelData = etapas.slice(0, 4).map(e => ({
    label: { prospeccao: 'Prospecção', qualificacao: 'Qualificação', proposta: 'Em Proposta', negociacao: 'Negociação' }[e] ?? e,
    val: pipeline.filter(l => l.etapa === e).length,
    color: ['var(--bl)','var(--pu)','var(--wr)','var(--ok)'][etapas.indexOf(e)] ?? 'var(--gr)',
  }))
  const maxFunnel = Math.max(...funnelData.map(f => f.val), 1)

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Dashboard Executivo</span>
          <span className="tb-sub">Visão geral em tempo real</span>
        </div>
        {loading && <span style={{ fontSize: 12, color: 'var(--gr3)' }}>⟳ Carregando…</span>}
      </div>

      <div className="content">
        {/* KPIs */}
        <div className="kpi-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="kpi" style={{ opacity: 0.4 }}>
                  <div className="kpi-label">—</div>
                  <div className="kpi-val">…</div>
                </div>
              ))
            : kpiCards.map(k => (
                <div key={k.label} className="kpi">
                  <div className="kpi-icon" style={{ background: `${k.color}22` }}>
                    <span style={{ fontSize: 16 }}>{k.icon}</span>
                  </div>
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-val">{k.val}</div>
                  <div className={`kpi-delta ${k.up ? 'up' : 'dn'}`}>{k.delta}</div>
                </div>
              ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          {/* Clientes Recentes */}
          <div className="card">
            <div className="sec-hd">
              <div>
                <div className="sec-title">Clientes Recentes</div>
                <div className="sec-sub">Últimos cadastrados</div>
              </div>
              <a href="/clientes" className="btn btn-ghost btn-sm">Ver todos</a>
            </div>
            {clientes.length === 0 && !loading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gr3)', fontSize: 13 }}>
                Nenhum cliente cadastrado ainda.<br/>
                <a href="/clientes" style={{ color: 'var(--al)' }}>Cadastrar primeiro cliente →</a>
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr><th>Cliente</th><th>Setor</th><th>Mensalidade</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: 'var(--wh)' }}>{c.nome}</td>
                      <td style={{ color: 'var(--gr3)' }}>{c.setor || '—'}</td>
                      <td style={{ fontFamily: 'var(--mono)', color: 'var(--al)' }}>
                        {c.mensalidade ? `R$ ${c.mensalidade.toLocaleString('pt-BR')}` : '—'}
                      </td>
                      <td><span className={`badge ${statusColor[c.status] ?? ''}`}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Projetos Ativos */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">Projetos em Andamento</div>
              <a href="/projetos" className="btn btn-ghost btn-sm">Ver todos</a>
            </div>
            {projetos.length === 0 && !loading ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--gr3)', fontSize: 12 }}>
                Nenhum projeto ativo.<br/>
                <a href="/projetos" style={{ color: 'var(--al)' }}>Criar projeto →</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projetos.map(p => (
                  <div key={p.id} className="stat-row" style={{ alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--wh)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titulo}</div>
                      <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>{p.cliente_nome || '—'} · {p.responsavel || '—'}</div>
                      <div className="progress-bar" style={{ marginTop: 6 }}>
                        <div className="progress-fill" style={{ width: `${p.progresso}%` }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--al)', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{p.progresso}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Funil + Financeiro + Pipeline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 16 }}>
          {/* Funil de Vendas */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">Funil de Vendas</div>
              <a href="/pipeline" className="btn btn-ghost btn-sm">Pipeline</a>
            </div>
            {funnelData.map(r => (
              <div key={r.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11 }}>{r.label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: r.color }}>{r.val}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${maxFunnel > 0 ? (r.val / maxFunnel) * 100 : 0}%`, background: r.color }} />
                </div>
              </div>
            ))}
            {kpis && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--bk4)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--gr3)' }}>Pipeline total</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ok)' }}>{fmt(kpis.valorPipelineTotal)}</span>
              </div>
            )}
          </div>

          {/* Resultado do Mês */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">Resultado do Mês</div>
              <a href="/financeiro" className="btn btn-ghost btn-sm">Financeiro</a>
            </div>
            {kpis ? [
              { label: 'Receita',  val: fmt(kpis.receitaMes),  color: 'var(--ok)' },
              { label: 'Despesas', val: fmt(kpis.despesaMes),  color: 'var(--er)' },
              { label: 'Lucro',    val: fmt(kpis.lucroMes),    color: kpis.lucroMes >= 0 ? 'var(--al)' : 'var(--er)' },
            ].map(r => (
              <div key={r.label} className="stat-row" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--gr3)' }}>{r.label}</span>
                <span style={{ fontSize: 14, fontFamily: 'var(--mono)', fontWeight: 700, color: r.color }}>{r.val}</span>
              </div>
            )) : null}
            {kpis && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--bk4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11 }}>Margem</span>
                  <span style={{ fontSize: 11, color: kpis.margemMes >= 30 ? 'var(--ok)' : kpis.margemMes >= 15 ? 'var(--wr)' : 'var(--er)' }}>
                    {kpis.margemMes.toFixed(1)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(kpis.margemMes, 100)}%`, background: kpis.margemMes >= 30 ? 'var(--ok)' : kpis.margemMes >= 15 ? 'var(--wr)' : 'var(--er)' }} />
                </div>
              </div>
            )}
          </div>

          {/* Saúde da Carteira */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">Saúde da Carteira</div>
              <a href="/clientes" className="btn btn-ghost btn-sm">Clientes</a>
            </div>
            {kpis ? (() => {
              const total = kpis.totalClientes || 1
              const saude = [
                { label: 'Ativos',     val: kpis.clientesAtivos, color: 'var(--ok)' },
                { label: 'Onboarding', val: total - kpis.clientesAtivos, color: 'var(--al)' },
              ]
              return saude.map(s => (
                <div key={s.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11 }}>{s.label}</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: s.color }}>{s.val}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(s.val / total) * 100}%`, background: s.color }} />
                  </div>
                </div>
              ))
            })() : null}
            {kpis && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--bk4)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--gr3)' }}>Propostas em aberto</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--wr)' }}>{kpis.propostasAbertas}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
