'use client'
import { useState, useEffect } from 'react'
const STORAGE_KEY = 'alcance_campanhas_v1'

type Campanha = {
  id: number; nome: string; cliente: string; canal: string; status: string;
  orcamento: number; gasto: number; inicio: string; fim: string;
  impressoes: number; cliques: number; conversoes: number; objetivo: string
}

const inicial: Campanha[] = [
  { id: 1, nome: 'Google Ads — TechNova Q2', cliente: 'TechNova Solutions', canal: 'Google Ads', status: 'Ativa', orcamento: 5000, gasto: 2840, inicio: '2026-05-01', fim: '2026-06-30', impressoes: 124500, cliques: 3420, conversoes: 87, objetivo: 'Leads' },
  { id: 2, nome: 'Meta Ads Construtora', cliente: 'Construtora Viva Mais', canal: 'Meta Ads', status: 'Ativa', orcamento: 3000, gasto: 1560, inicio: '2026-05-01', fim: '2026-05-31', impressoes: 89200, cliques: 2100, conversoes: 43, objetivo: 'Reconhecimento' },
  { id: 3, nome: 'Google Ads Dr. Marcos', cliente: 'Dr. Marcos Cardiologia', canal: 'Google Ads', status: 'Ativa', orcamento: 1800, gasto: 340, inicio: '2026-05-10', fim: '2026-06-10', impressoes: 18400, cliques: 820, conversoes: 22, objetivo: 'Consultas' },
  { id: 4, nome: 'Instagram Sabor & Arte', cliente: 'Sabor & Arte Restaurante', canal: 'Instagram', status: 'Pausada', orcamento: 1200, gasto: 800, inicio: '2026-04-01', fim: '2026-05-31', impressoes: 52000, cliques: 1340, conversoes: 0, objetivo: 'Engajamento' },
  { id: 5, nome: 'SEO Imobiliária Prime', cliente: 'Imobiliária Prime', canal: 'SEO', status: 'Ativa', orcamento: 2500, gasto: 2500, inicio: '2026-01-01', fim: '2026-12-31', impressoes: 0, cliques: 0, conversoes: 156, objetivo: 'Orgânico' },
  { id: 6, nome: 'YouTube Ads TechNova', cliente: 'TechNova Solutions', canal: 'YouTube', status: 'Encerrada', orcamento: 2000, gasto: 2000, inicio: '2026-04-01', fim: '2026-04-30', impressoes: 67000, cliques: 1890, conversoes: 31, objetivo: 'Alcance' },
]

const canalColor: Record<string, string> = {
  'Google Ads': 'badge-bl', 'Meta Ads': 'badge-pu', Instagram: 'badge-pk', SEO: 'badge-ok', YouTube: 'badge-er', TikTok: 'badge-wr'
}
const statusColor: Record<string, string> = { Ativa: 'badge-ok', Pausada: 'badge-wr', Encerrada: 'badge-gr', Planejada: 'badge-al' }
const empty: Omit<Campanha, 'id'> = { nome: '', cliente: '', canal: 'Google Ads', status: 'Planejada', orcamento: 0, gasto: 0, inicio: '', fim: '', impressoes: 0, cliques: 0, conversoes: 0, objetivo: 'Leads' }

export default function CampanhasPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loaded, setLoaded]       = useState(false)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState<Omit<Campanha, 'id'>>(empty)
  const [editing, setEditing]     = useState<number | null>(null)
  const [filter, setFilter]       = useState('Todas')
  const [confirmDel, setConfirmDel] = useState<number | null>(null)

  useEffect(() => {
    try { setCampanhas(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? inicial) }
    catch { setCampanhas(inicial) }
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(campanhas)) }, [campanhas, loaded])

  const filtered = campanhas.filter(c => filter === 'Todas' || c.status === filter)

  function save() {
    if (!form.nome) return
    if (editing !== null) {
      setCampanhas(cs => cs.map(c => c.id === editing ? { ...form, id: editing } : c))
    } else {
      setCampanhas(cs => [...cs, { ...form, id: Date.now() }])
    }
    setModal(false); setForm(empty); setEditing(null)
  }

  function edit(c: Campanha) {
    const { id, ...rest } = c; setForm(rest); setEditing(id); setModal(true)
  }

  function closeModal() { setModal(false); setForm(empty); setEditing(null) }

  function deleteConfirmed() {
    if (confirmDel === null) return
    setCampanhas(cs => cs.filter(c => c.id !== confirmDel))
    setConfirmDel(null); setModal(false); setEditing(null)
  }

  const totalGasto = campanhas.reduce((s, c) => s + c.gasto, 0)
  const totalOrcamento = campanhas.reduce((s, c) => s + c.orcamento, 0)
  const totalConv = campanhas.reduce((s, c) => s + c.conversoes, 0)

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Campanhas</span>
          <span className="tb-sub">{campanhas.filter(c => c.status === 'Ativa').length} ativas</span>
        </div>
        <button className="btn btn-al" onClick={() => { setForm(empty); setEditing(null); setModal(true) }}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Campanha
        </button>
      </div>

      <div className="content">
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { label: 'Total Campanhas', val: campanhas.length },
            { label: 'Orçamento Total', val: `R$ ${totalOrcamento.toLocaleString('pt-BR')}` },
            { label: 'Total Gasto', val: `R$ ${totalGasto.toLocaleString('pt-BR')}` },
            { label: 'Total Conversões', val: totalConv },
          ].map(k => (
            <div key={k.label} className="kpi">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val" style={{ fontSize: 22 }}>{k.val}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="sec-hd">
            <div className="tabs" style={{ margin: 0 }}>
              {['Todas', 'Ativa', 'Pausada', 'Encerrada'].map(s => (
                <button key={s} className={`tab${filter === s ? ' act' : ''}`} onClick={() => setFilter(s)}>{s}</button>
              ))}
            </div>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Campanha</th><th>Cliente</th><th>Canal</th>
                <th>Orçamento / Gasto</th><th>Impressões</th><th>Cliques</th>
                <th>Conversões</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const pct = c.orcamento > 0 ? Math.round((c.gasto / c.orcamento) * 100) : 0
                const ctr = c.impressoes > 0 ? ((c.cliques / c.impressoes) * 100).toFixed(2) : '0'
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--wh)' }}>{c.nome}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--gr3)' }}>{c.objetivo}</div>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--gr3)' }}>{c.cliente}</td>
                    <td><span className={`badge ${canalColor[c.canal] ?? 'badge-gr'}`}>{c.canal}</span></td>
                    <td>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>
                        R$ {c.gasto.toLocaleString('pt-BR')} / R$ {c.orcamento.toLocaleString('pt-BR')}
                      </div>
                      <div className="progress-bar" style={{ marginTop: 4 }}>
                        <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 90 ? 'var(--er)' : pct > 70 ? 'var(--wr)' : 'var(--al)' }} />
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{c.impressoes.toLocaleString('pt-BR')}</td>
                    <td>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{c.cliques.toLocaleString('pt-BR')}</div>
                      <div style={{ fontSize: 9, color: 'var(--gr3)' }}>CTR {ctr}%</div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--ok)', fontSize: 13, fontWeight: 700 }}>{c.conversoes}</td>
                    <td><span className={`badge ${statusColor[c.status]}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => edit(c)}>✏️ Editar</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--er)' }} onClick={() => setConfirmDel(c.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Editar Campanha' : 'Nova Campanha'}</div>
            <div className="modal-grid">
              <div className="field" style={{ gridColumn: '1/-1' }}><label>Nome da Campanha</label>
                <input className="inp" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="field"><label>Cliente</label>
                <input className="inp" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} />
              </div>
              <div className="field"><label>Canal</label>
                <select className="inp" value={form.canal} onChange={e => setForm({ ...form, canal: e.target.value })}>
                  {['Google Ads','Meta Ads','Instagram','YouTube','TikTok','SEO','Email'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label>Objetivo</label>
                <select className="inp" value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })}>
                  {['Leads','Reconhecimento','Vendas','Engajamento','Orgânico','Tráfego','Consultas'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="field"><label>Status</label>
                <select className="inp" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['Planejada','Ativa','Pausada','Encerrada'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field"><label>Orçamento (R$)</label>
                <input className="inp" type="number" value={form.orcamento} onChange={e => setForm({ ...form, orcamento: Number(e.target.value) })} />
              </div>
              <div className="field"><label>Gasto (R$)</label>
                <input className="inp" type="number" value={form.gasto} onChange={e => setForm({ ...form, gasto: Number(e.target.value) })} />
              </div>
              <div className="field"><label>Início</label>
                <input className="inp" type="date" value={form.inicio} onChange={e => setForm({ ...form, inicio: e.target.value })} />
              </div>
              <div className="field"><label>Fim</label>
                <input className="inp" type="date" value={form.fim} onChange={e => setForm({ ...form, fim: e.target.value })} />
              </div>
            </div>
            <div className="modal-foot">
              {editing !== null && (
                <button className="btn btn-ghost" style={{ color: 'var(--er)', marginRight: 'auto' }}
                  onClick={() => { closeModal(); setConfirmDel(editing) }}>🗑️ Excluir</button>
              )}
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-al" onClick={save}>💾 Salvar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color: 'var(--er)' }}>🗑️ Excluir Campanha</div>
            <p style={{ fontSize: 13, color: 'var(--gr3)', margin: '12px 0 20px' }}>
              Excluir <strong style={{ color: 'var(--wh)' }}>"{campanhas.find(c => c.id === confirmDel)?.nome}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="btn" style={{ background: 'var(--er)', color: '#fff', border: 'none' }} onClick={deleteConfirmed}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
