'use client'
import { useState } from 'react'

const kpis = [
  { label: 'Receita Mensal', val: 'R$ 84.500', delta: '+12%', up: true, icon: '💰', color: 'var(--al)' },
  { label: 'Clientes Ativos', val: '23', delta: '+3', up: true, icon: '🏢', color: 'var(--bl)' },
  { label: 'Projetos em Andamento', val: '14', delta: '+2', up: true, icon: '📋', color: 'var(--pu)' },
  { label: 'Campanhas Ativas', val: '8', delta: '-1', up: false, icon: '🚀', color: 'var(--wr)' },
  { label: 'Leads no Mês', val: '342', delta: '+28%', up: true, icon: '🎯', color: 'var(--ok)' },
  { label: 'Ticket Médio', val: 'R$ 3.674', delta: '+8%', up: true, icon: '📊', color: 'var(--cy)' },
]

const recentClients = [
  { name: 'TechNova Solutions', status: 'Ativo', value: 'R$ 12.000/mês', sector: 'Tecnologia' },
  { name: 'Construtora Viva Mais', status: 'Ativo', value: 'R$ 8.500/mês', sector: 'Construção' },
  { name: 'Dr. Marcos Cardiologia', status: 'Onboarding', value: 'R$ 4.200/mês', sector: 'Saúde' },
  { name: 'Sabor & Arte Restaurante', status: 'Ativo', value: 'R$ 3.800/mês', sector: 'Food' },
  { name: 'Academia FitLife', status: 'Pausado', value: 'R$ 2.900/mês', sector: 'Fitness' },
]

const activities = [
  { time: 'Hoje, 09:14', text: 'Relatório enviado para TechNova Solutions', type: 'report' },
  { time: 'Hoje, 08:52', text: 'Nova proposta criada: Construtora Viva Mais — Fase 2', type: 'proposal' },
  { time: 'Ontem, 17:30', text: 'Campanha Google Ads otimizada — Dr. Marcos', type: 'campaign' },
  { time: 'Ontem, 15:10', text: 'Reunião de briefing com Academia FitLife', type: 'meeting' },
  { time: 'Ontem, 11:05', text: 'Novo cliente: Sabor & Arte Restaurante', type: 'client' },
]

const statusColor: Record<string, string> = {
  Ativo: 'badge-ok', Onboarding: 'badge-al', Pausado: 'badge-wr',
}
const actIcon: Record<string, string> = {
  report: '📄', proposal: '📝', campaign: '🎯', meeting: '📅', client: '🏢',
}

export default function DashboardPage() {
  const [period, setPeriod] = useState('Maio 2026')

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Dashboard Executivo</span>
          <span className="tb-sub">Visão geral da agência</span>
        </div>
        <select className="inp" style={{ width: 130 }} value={period} onChange={e => setPeriod(e.target.value)}>
          <option>Maio 2026</option>
          <option>Abril 2026</option>
          <option>Março 2026</option>
        </select>
      </div>

      <div className="content">
        {/* KPIs */}
        <div className="kpi-grid">
          {kpis.map(k => (
            <div key={k.label} className="kpi">
              <div className="kpi-icon" style={{ background: `${k.color}22` }}>
                <span style={{ fontSize: 16 }}>{k.icon}</span>
              </div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val">{k.val}</div>
              <div className={`kpi-delta ${k.up ? 'up' : 'dn'}`}>
                {k.up ? '▲' : '▼'} {k.delta} vs. mês anterior
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          {/* Clientes Recentes */}
          <div className="card">
            <div className="sec-hd">
              <div>
                <div className="sec-title">Clientes Recentes</div>
                <div className="sec-sub">Últimas interações</div>
              </div>
              <a href="/clientes" className="btn btn-ghost btn-sm">Ver todos</a>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Setor</th>
                  <th>Valor Mensal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentClients.map(c => (
                  <tr key={c.name}>
                    <td style={{ fontWeight: 600, color: 'var(--wh)' }}>{c.name}</td>
                    <td style={{ color: 'var(--gr3)' }}>{c.sector}</td>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--al)' }}>{c.value}</td>
                    <td><span className={`badge ${statusColor[c.status]}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Atividades */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">Atividades Recentes</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {activities.map((a, i) => (
                <div key={i} className="stat-row" style={{ alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 16, marginTop: 1 }}>{actIcon[a.type]}</span>
                  <div>
                    <div style={{ fontSize: 11.5, color: 'var(--lgt)', lineHeight: 1.4 }}>{a.text}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--gr3)', marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 16 }}>
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">Funil de Vendas</div>
            </div>
            {[
              { label: 'Leads', val: 342, pct: 100, color: 'var(--bl)' },
              { label: 'Qualificados', val: 89, pct: 26, color: 'var(--pu)' },
              { label: 'Em Proposta', val: 31, pct: 9, color: 'var(--wr)' },
              { label: 'Fechados', val: 11, pct: 3, color: 'var(--ok)' },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11 }}>{r.label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: r.color }}>{r.val}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">Receita por Canal</div>
            </div>
            {[
              { label: 'Gestão de Redes', pct: 38, val: 'R$ 32.110' },
              { label: 'Tráfego Pago', pct: 28, val: 'R$ 23.660' },
              { label: 'SEO / Orgânico', pct: 18, val: 'R$ 15.210' },
              { label: 'Criação de Conteúdo', pct: 16, val: 'R$ 13.520' },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11 }}>{r.label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--al)' }}>{r.val}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">Metas do Mês</div>
            </div>
            {[
              { label: 'Receita', current: 84500, goal: 100000, pct: 85 },
              { label: 'Novos Clientes', current: 3, goal: 5, pct: 60 },
              { label: 'Propostas Enviadas', current: 11, goal: 15, pct: 73 },
              { label: 'Projetos Entregues', current: 8, goal: 10, pct: 80 },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11 }}>{m.label}</span>
                  <span style={{ fontSize: 11, color: m.pct >= 80 ? 'var(--ok)' : m.pct >= 60 ? 'var(--wr)' : 'var(--er)' }}>{m.pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${m.pct}%`, background: m.pct >= 80 ? 'var(--ok)' : m.pct >= 60 ? 'var(--wr)' : 'var(--er)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
