'use client'
import { useState } from 'react'

type Lead = {
  id: number; empresa: string; contato: string; valor: number;
  etapa: string; origem: string; prob: number; proximo: string; obs: string
}

const etapas = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado', 'Perdido']
const etapaColor: Record<string, string> = {
  'Prospecção': 'var(--gr3)', Qualificação: 'var(--bl)', Proposta: 'var(--pu)',
  Negociação: 'var(--wr)', Fechado: 'var(--ok)', Perdido: 'var(--er)',
}

const inicial: Lead[] = [
  { id: 1, empresa: 'E-commerce Moda Urbana', contato: 'Camila Freitas', valor: 8000, etapa: 'Proposta', origem: 'Indicação', prob: 70, proximo: '2026-05-15', obs: 'Aguardando aprovação da proposta' },
  { id: 2, empresa: 'Clínica Dermato Plus', contato: 'Dra. Julia', valor: 5500, etapa: 'Qualificação', origem: 'Instagram', prob: 40, proximo: '2026-05-16', obs: 'Reunião de descoberta agendada' },
  { id: 3, empresa: 'Auto Peças Veloz', contato: 'Marcos Cruz', valor: 3200, etapa: 'Negociação', origem: 'Google', prob: 85, proximo: '2026-05-14', obs: 'Revisão final de contrato' },
  { id: 4, empresa: 'Academia Sport Center', contato: 'Pedro Alves', valor: 4800, etapa: 'Prospecção', origem: 'Indicação', prob: 20, proximo: '2026-05-20', obs: 'Primeiro contato feito' },
  { id: 5, empresa: 'Advocacia Mendes & Assoc.', contato: 'Dr. Mendes', valor: 6000, etapa: 'Proposta', origem: 'LinkedIn', prob: 60, proximo: '2026-05-17', obs: 'Proposta enviada por e-mail' },
  { id: 6, empresa: 'Padaria & Café Aroma', contato: 'Lucia Santos', valor: 2800, etapa: 'Fechado', origem: 'Indicação', prob: 100, proximo: '', obs: 'Contrato assinado 10/05' },
  { id: 7, empresa: 'Escola de Idiomas Globe', contato: 'Ana Paula', valor: 5200, etapa: 'Qualificação', origem: 'Site', prob: 35, proximo: '2026-05-19', obs: 'Pediu case de escola anterior' },
]

const empty: Omit<Lead, 'id'> = { empresa: '', contato: '', valor: 0, etapa: 'Prospecção', origem: 'Indicação', prob: 30, proximo: '', obs: '' }

export default function PipelinePage() {
  const [leads, setLeads] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Omit<Lead, 'id'>>(empty)
  const [editing, setEditing] = useState<number | null>(null)

  function save() {
    if (!form.empresa) return
    if (editing !== null) {
      setLeads(ls => ls.map(l => l.id === editing ? { ...form, id: editing } : l))
    } else {
      setLeads(ls => [...ls, { ...form, id: Date.now() }])
    }
    setModal(false); setForm(empty); setEditing(null)
  }

  function edit(l: Lead) {
    const { id, ...rest } = l; setForm(rest); setEditing(id); setModal(true)
  }

  const totalPipeline = leads.filter(l => l.etapa !== 'Perdido').reduce((s, l) => s + l.valor * (l.prob / 100), 0)

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Pipeline de Vendas</span>
          <span className="tb-sub">Funil comercial</span>
        </div>
        <button className="btn btn-al" onClick={() => { setForm(empty); setEditing(null); setModal(true) }}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Lead
        </button>
      </div>

      <div className="content">
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 20 }}>
          {['Prospecção','Qualificação','Proposta','Negociação','Fechado'].map(e => {
            const ls = leads.filter(l => l.etapa === e)
            const val = ls.reduce((s, l) => s + l.valor, 0)
            return (
              <div key={e} className="kpi">
                <div className="kpi-label">{e}</div>
                <div className="kpi-val" style={{ fontSize: 20, color: etapaColor[e] }}>{ls.length}</div>
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--gr3)' }}>R$ {val.toLocaleString('pt-BR')}</div>
              </div>
            )
          })}
        </div>

        <div style={{ marginBottom: 12, fontSize: 11, color: 'var(--gr3)' }}>
          Pipeline ponderado: <span style={{ color: 'var(--al)', fontFamily: 'var(--mono)', fontWeight: 700 }}>R$ {Math.round(totalPipeline).toLocaleString('pt-BR')}</span>
        </div>

        {/* Kanban */}
        <div className="kanban-wrap">
          {etapas.filter(e => e !== 'Perdido').map(etapa => {
            const cards = leads.filter(l => l.etapa === etapa)
            return (
              <div key={etapa} className="k-col" style={{ borderTop: `2px solid ${etapaColor[etapa]}` }}>
                <div className="k-col-hd">
                  <span className="k-col-title" style={{ color: etapaColor[etapa] }}>{etapa}</span>
                  <span className="k-col-cnt">{cards.length}</span>
                </div>
                <div className="k-cards">
                  {cards.map(l => (
                    <div key={l.id} className="k-card" onClick={() => edit(l)}>
                      <div className="k-card-title">{l.empresa}</div>
                      <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6 }}>{l.contato}</div>
                      <div style={{ fontFamily: 'var(--mono)', color: 'var(--al)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                        R$ {l.valor.toLocaleString('pt-BR')}
                      </div>
                      <div className="k-card-meta">
                        <span className="badge badge-gr">{l.origem}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: l.prob >= 70 ? 'var(--ok)' : l.prob >= 40 ? 'var(--wr)' : 'var(--er)' }}>
                          {l.prob}%
                        </span>
                      </div>
                      {l.proximo && <div style={{ fontSize: 9, color: 'var(--gr3)', marginTop: 5 }}>📅 {l.proximo}</div>}
                    </div>
                  ))}
                  <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                    onClick={() => { setForm({ ...empty, etapa }); setEditing(null); setModal(true) }}>
                    + Adicionar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Editar Lead' : 'Novo Lead'}</div>
            <div className="modal-grid">
              <div className="field"><label>Empresa</label>
                <input className="inp" value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} />
              </div>
              <div className="field"><label>Contato</label>
                <input className="inp" value={form.contato} onChange={e => setForm({ ...form, contato: e.target.value })} />
              </div>
              <div className="field"><label>Valor Estimado (R$)</label>
                <input className="inp" type="number" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} />
              </div>
              <div className="field"><label>Etapa</label>
                <select className="inp" value={form.etapa} onChange={e => setForm({ ...form, etapa: e.target.value })}>
                  {etapas.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div className="field"><label>Origem</label>
                <select className="inp" value={form.origem} onChange={e => setForm({ ...form, origem: e.target.value })}>
                  {['Indicação','Google','Instagram','LinkedIn','Site','Evento','Cold Outreach'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="field"><label>Probabilidade (%)</label>
                <input className="inp" type="number" min={0} max={100} value={form.prob} onChange={e => setForm({ ...form, prob: Number(e.target.value) })} />
              </div>
              <div className="field"><label>Próximo Contato</label>
                <input className="inp" type="date" value={form.proximo} onChange={e => setForm({ ...form, proximo: e.target.value })} />
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
