'use client'
import { useState } from 'react'

type Transacao = {
  id: number; descricao: string; tipo: 'receita' | 'despesa'; categoria: string;
  valor: number; data: string; cliente?: string; status: string
}

const inicial: Transacao[] = [
  { id: 1, descricao: 'Mensalidade TechNova Solutions', tipo: 'receita', categoria: 'Mensalidade', valor: 12000, data: '2026-05-05', cliente: 'TechNova Solutions', status: 'Pago' },
  { id: 2, descricao: 'Mensalidade Construtora Viva Mais', tipo: 'receita', categoria: 'Mensalidade', valor: 8500, data: '2026-05-05', cliente: 'Construtora Viva Mais', status: 'Pago' },
  { id: 3, descricao: 'Mensalidade Imobiliária Prime', tipo: 'receita', categoria: 'Mensalidade', valor: 7200, data: '2026-05-08', cliente: 'Imobiliária Prime', status: 'Pago' },
  { id: 4, descricao: 'Mensalidade Clínica OdontoVida', tipo: 'receita', categoria: 'Mensalidade', valor: 5600, data: '2026-05-10', cliente: 'Clínica OdontoVida', status: 'Pago' },
  { id: 5, descricao: 'Mensalidade Dr. Marcos', tipo: 'receita', categoria: 'Mensalidade', valor: 4200, data: '2026-05-15', cliente: 'Dr. Marcos Cardiologia', status: 'Pendente' },
  { id: 6, descricao: 'Salários Equipe — Maio', tipo: 'despesa', categoria: 'Pessoal', valor: 28000, data: '2026-05-05', status: 'Pago' },
  { id: 7, descricao: 'Ferramentas de Marketing (RD, Semrush)', tipo: 'despesa', categoria: 'Ferramentas', valor: 1800, data: '2026-05-01', status: 'Pago' },
  { id: 8, descricao: 'Aluguel Escritório', tipo: 'despesa', categoria: 'Infraestrutura', valor: 4500, data: '2026-05-01', status: 'Pago' },
  { id: 9, descricao: 'Publicidade Online (própria)', tipo: 'despesa', categoria: 'Marketing', valor: 1200, data: '2026-05-03', status: 'Pago' },
  { id: 10, descricao: 'Projeto extra — Landing Page Prime', tipo: 'receita', categoria: 'Projeto Pontual', valor: 3800, data: '2026-05-12', cliente: 'Imobiliária Prime', status: 'Pago' },
]

const catColor: Record<string, string> = {
  Mensalidade: 'badge-al', 'Projeto Pontual': 'badge-bl', Pessoal: 'badge-er',
  Ferramentas: 'badge-wr', Infraestrutura: 'badge-gr', Marketing: 'badge-pu',
}
const empty: Omit<Transacao, 'id'> = { descricao: '', tipo: 'receita', categoria: 'Mensalidade', valor: 0, data: '', cliente: '', status: 'Pendente' }

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Omit<Transacao, 'id'>>(empty)
  const [editing, setEditing] = useState<number | null>(null)
  const [filter, setFilter] = useState('Todos')

  const receitas = transacoes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0)
  const despesas = transacoes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0)
  const lucro = receitas - despesas
  const margem = receitas > 0 ? Math.round((lucro / receitas) * 100) : 0

  const filtered = transacoes.filter(t => filter === 'Todos' || t.tipo === filter.toLowerCase())

  function save() {
    if (!form.descricao) return
    if (editing !== null) {
      setTransacoes(ts => ts.map(t => t.id === editing ? { ...form, id: editing } : t))
    } else {
      setTransacoes(ts => [...ts, { ...form, id: Date.now() }])
    }
    setModal(false); setForm(empty); setEditing(null)
  }

  function edit(t: Transacao) {
    const { id, ...rest } = t; setForm(rest); setEditing(id); setModal(true)
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Financeiro</span>
          <span className="tb-sub">Maio 2026</span>
        </div>
        <button className="btn btn-al" onClick={() => { setForm(empty); setEditing(null); setModal(true) }}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Transação
        </button>
      </div>

      <div className="content">
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <div className="kpi">
            <div className="kpi-label">Receitas</div>
            <div className="kpi-val" style={{ color: 'var(--ok)' }}>R$ {receitas.toLocaleString('pt-BR')}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Despesas</div>
            <div className="kpi-val" style={{ color: 'var(--er)' }}>R$ {despesas.toLocaleString('pt-BR')}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Lucro Líquido</div>
            <div className="kpi-val" style={{ color: lucro >= 0 ? 'var(--ok)' : 'var(--er)' }}>R$ {lucro.toLocaleString('pt-BR')}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Margem</div>
            <div className="kpi-val" style={{ color: margem >= 40 ? 'var(--ok)' : margem >= 20 ? 'var(--wr)' : 'var(--er)' }}>{margem}%</div>
          </div>
        </div>

        <div className="card">
          <div className="sec-hd">
            <div className="tabs" style={{ margin: 0 }}>
              {['Todos', 'Receitas', 'Despesas'].map(f => (
                <button key={f} className={`tab${filter === f ? ' act' : ''}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Descrição</th><th>Categoria</th><th>Cliente</th><th>Data</th><th>Valor</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: 'var(--wh)' }}>{t.descricao}</td>
                  <td><span className={`badge ${catColor[t.categoria] ?? 'badge-gr'}`}>{t.categoria}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--gr3)' }}>{t.cliente ?? '—'}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{t.data}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: t.tipo === 'receita' ? 'var(--ok)' : 'var(--er)' }}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR')}
                  </td>
                  <td>
                    <span className={`badge ${t.status === 'Pago' ? 'badge-ok' : 'badge-wr'}`}>{t.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => edit(t)}>Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Editar Transação' : 'Nova Transação'}</div>
            <div className="modal-grid">
              <div className="field" style={{ gridColumn: '1/-1' }}><label>Descrição</label>
                <input className="inp" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="field"><label>Tipo</label>
                <select className="inp" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as 'receita' | 'despesa' })}>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div className="field"><label>Categoria</label>
                <select className="inp" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  {['Mensalidade','Projeto Pontual','Pessoal','Ferramentas','Infraestrutura','Marketing','Outro'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label>Valor (R$)</label>
                <input className="inp" type="number" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} />
              </div>
              <div className="field"><label>Data</label>
                <input className="inp" type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
              <div className="field"><label>Cliente (opcional)</label>
                <input className="inp" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} />
              </div>
              <div className="field"><label>Status</label>
                <select className="inp" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Pago</option><option>Pendente</option><option>Atrasado</option>
                </select>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-al" onClick={save}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
