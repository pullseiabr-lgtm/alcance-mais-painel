'use client'
import { useState } from 'react'

type Proposta = {
  id: number; titulo: string; cliente: string; valor: number; status: string;
  criado: string; validade: string; servicos: string[]; desconto: number; obs: string
}

const inicial: Proposta[] = [
  { id: 1, titulo: 'Proposta Gestão Completa — TechNova Fase 2', cliente: 'TechNova Solutions', valor: 15000, status: 'Aprovada', criado: '2026-05-01', validade: '2026-05-31', servicos: ['Tráfego Pago','SEO','Redes Sociais','Relatórios'], desconto: 10, obs: '' },
  { id: 2, titulo: 'Proposta Lançamento E-commerce Moda Urbana', cliente: 'E-commerce Moda Urbana', valor: 8000, status: 'Aguardando', criado: '2026-05-08', validade: '2026-05-22', servicos: ['Tráfego Pago','Redes Sociais'], desconto: 0, obs: 'Aguardando resposta do cliente' },
  { id: 3, titulo: 'Proposta SEO + Conteúdo — Advocacia Mendes', cliente: 'Advocacia Mendes & Assoc.', valor: 6000, status: 'Em Análise', criado: '2026-05-10', validade: '2026-05-24', servicos: ['SEO','Criação de Conteúdo'], desconto: 5, obs: 'Cliente pediu ajuste de escopo' },
  { id: 4, titulo: 'Pacote Redes Sociais — Academia Sport', cliente: 'Academia Sport Center', valor: 4800, status: 'Aguardando', criado: '2026-05-12', validade: '2026-05-26', servicos: ['Redes Sociais','Stories'], desconto: 0, obs: '' },
  { id: 5, titulo: 'Presença Digital — Dr. Marcos Fase 2', cliente: 'Dr. Marcos Cardiologia', valor: 5500, status: 'Rascunho', criado: '2026-05-13', validade: '2026-06-13', servicos: ['Tráfego Pago','Landing Page'], desconto: 0, obs: 'Ainda em preparação' },
  { id: 6, titulo: 'Gestão Google Ads — Clínica Dermato', cliente: 'Clínica Dermato Plus', valor: 5500, status: 'Recusada', criado: '2026-04-20', validade: '2026-05-05', servicos: ['Google Ads'], desconto: 0, obs: 'Cliente optou por outro fornecedor' },
]

const statusColor: Record<string, string> = {
  Aprovada: 'badge-ok', Aguardando: 'badge-wr', 'Em Análise': 'badge-al', Rascunho: 'badge-gr', Recusada: 'badge-er'
}
const empty: Omit<Proposta, 'id'> = { titulo: '', cliente: '', valor: 0, status: 'Rascunho', criado: '', validade: '', servicos: [], desconto: 0, obs: '' }

export default function PropostasPage() {
  const [propostas, setPropostas] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Omit<Proposta, 'id'>>(empty)
  const [editing, setEditing] = useState<number | null>(null)
  const [svcInput, setSvcInput] = useState('')
  const [filter, setFilter] = useState('Todas')

  const filtered = propostas.filter(p => filter === 'Todas' || p.status === filter)
  const totalAprovado = propostas.filter(p => p.status === 'Aprovada').reduce((s, p) => s + p.valor * (1 - p.desconto / 100), 0)

  function save() {
    if (!form.titulo) return
    if (editing !== null) {
      setPropostas(ps => ps.map(p => p.id === editing ? { ...form, id: editing } : p))
    } else {
      setPropostas(ps => [...ps, { ...form, id: Date.now() }])
    }
    setModal(false); setForm(empty); setEditing(null); setSvcInput('')
  }

  function edit(p: Proposta) {
    const { id, ...rest } = p; setForm(rest); setEditing(id); setModal(true)
  }

  function addSvc() {
    if (svcInput.trim()) {
      setForm(f => ({ ...f, servicos: [...f.servicos, svcInput.trim()] }))
      setSvcInput('')
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Propostas Comerciais</span>
          <span className="tb-sub">{propostas.filter(p => p.status === 'Aguardando').length} aguardando resposta</span>
        </div>
        <button className="btn btn-al" onClick={() => { setForm(empty); setEditing(null); setModal(true) }}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Proposta
        </button>
      </div>

      <div className="content">
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <div className="kpi"><div className="kpi-label">Total Propostas</div><div className="kpi-val" style={{ fontSize: 22 }}>{propostas.length}</div></div>
          <div className="kpi"><div className="kpi-label">Aprovadas</div><div className="kpi-val" style={{ fontSize: 22, color: 'var(--ok)' }}>{propostas.filter(p => p.status === 'Aprovada').length}</div></div>
          <div className="kpi"><div className="kpi-label">Taxa de Conversão</div><div className="kpi-val" style={{ fontSize: 22, color: 'var(--al)' }}>{Math.round((propostas.filter(p => p.status === 'Aprovada').length / propostas.length) * 100)}%</div></div>
          <div className="kpi"><div className="kpi-label">Valor Aprovado</div><div className="kpi-val" style={{ fontSize: 18, color: 'var(--ok)' }}>R$ {Math.round(totalAprovado).toLocaleString('pt-BR')}</div></div>
        </div>

        <div className="tabs">
          {['Todas','Rascunho','Aguardando','Em Análise','Aprovada','Recusada'].map(f => (
            <button key={f} className={`tab${filter === f ? ' act' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(p => {
            const valorFinal = p.valor * (1 - p.desconto / 100)
            return (
              <div key={p.id} className="card" style={{ cursor: 'pointer' }} onClick={() => edit(p)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--wh)', fontSize: 13, marginBottom: 4 }}>{p.titulo}</div>
                    <div style={{ fontSize: 11, color: 'var(--gr3)', marginBottom: 8 }}>{p.cliente}</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {p.servicos.map(s => <span key={s} className="badge badge-al">{s}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 800, color: 'var(--wh)' }}>
                      R$ {valorFinal.toLocaleString('pt-BR')}
                    </div>
                    {p.desconto > 0 && <div style={{ fontSize: 10, color: 'var(--gr3)', textDecoration: 'line-through' }}>R$ {p.valor.toLocaleString('pt-BR')}</div>}
                    <span className={`badge ${statusColor[p.status]}`}>{p.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,196,180,.06)', fontSize: 10, color: 'var(--gr3)' }}>
                  <span>📅 Criado: {p.criado}</span>
                  <span>⏰ Válido até: {p.validade}</span>
                  {p.obs && <span>💬 {p.obs}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Editar Proposta' : 'Nova Proposta'}</div>
            <div className="modal-grid">
              <div className="field" style={{ gridColumn: '1/-1' }}><label>Título da Proposta</label>
                <input className="inp" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div className="field"><label>Cliente</label>
                <input className="inp" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} />
              </div>
              <div className="field"><label>Valor (R$)</label>
                <input className="inp" type="number" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} />
              </div>
              <div className="field"><label>Desconto (%)</label>
                <input className="inp" type="number" min={0} max={100} value={form.desconto} onChange={e => setForm({ ...form, desconto: Number(e.target.value) })} />
              </div>
              <div className="field"><label>Status</label>
                <select className="inp" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['Rascunho','Aguardando','Em Análise','Aprovada','Recusada'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field"><label>Data de Criação</label>
                <input className="inp" type="date" value={form.criado} onChange={e => setForm({ ...form, criado: e.target.value })} />
              </div>
              <div className="field"><label>Validade</label>
                <input className="inp" type="date" value={form.validade} onChange={e => setForm({ ...form, validade: e.target.value })} />
              </div>
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>Serviços Incluídos</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="inp" value={svcInput} onChange={e => setSvcInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSvc()} placeholder="Ex: Google Ads" />
                <button className="btn btn-ghost" onClick={addSvc}>+</button>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {form.servicos.map(s => (
                  <span key={s} className="badge badge-al" style={{ cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, servicos: f.servicos.filter(x => x !== s) }))}>{s} ✕</span>
                ))}
              </div>
            </div>
            <div className="field" style={{ marginTop: 10 }}><label>Observações</label>
              <textarea className="inp" rows={2} value={form.obs} onChange={e => setForm({ ...form, obs: e.target.value })} />
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
