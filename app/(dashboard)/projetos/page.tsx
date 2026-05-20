'use client'
import { useState } from 'react'

type Projeto = {
  id: number; titulo: string; cliente: string; responsavel: string;
  status: string; prioridade: string; prazo: string; progresso: number; descricao: string
}

const inicial: Projeto[] = [
  { id: 1, titulo: 'Rebranding TechNova', cliente: 'TechNova Solutions', responsavel: 'Marina', status: 'Em Andamento', prioridade: 'Alta', prazo: '2026-05-30', progresso: 65, descricao: 'Redesign completo da identidade visual e site.' },
  { id: 2, titulo: 'Campanha Lançamento App', cliente: 'TechNova Solutions', responsavel: 'Carlos', status: 'Em Andamento', prioridade: 'Alta', prazo: '2026-06-15', progresso: 40, descricao: 'Campanha integrada para lançamento do app.' },
  { id: 3, titulo: 'SEO Construtora Viva Mais', cliente: 'Construtora Viva Mais', responsavel: 'Ana', status: 'Em Andamento', prioridade: 'Média', prazo: '2026-07-01', progresso: 30, descricao: 'Estratégia SEO para o site da construtora.' },
  { id: 4, titulo: 'Onboarding Dr. Marcos', cliente: 'Dr. Marcos Cardiologia', responsavel: 'João', status: 'Planejamento', prioridade: 'Alta', prazo: '2026-05-20', progresso: 10, descricao: 'Configuração inicial e briefing.' },
  { id: 5, titulo: 'Feed Sabor & Arte', cliente: 'Sabor & Arte Restaurante', responsavel: 'Marina', status: 'Revisão', prioridade: 'Baixa', prazo: '2026-05-18', progresso: 85, descricao: 'Criação de conteúdo para redes sociais.' },
  { id: 6, titulo: 'Landing Page Imobiliária Prime', cliente: 'Imobiliária Prime', responsavel: 'Carlos', status: 'Concluído', prioridade: 'Média', prazo: '2026-05-10', progresso: 100, descricao: 'LP para captação de leads imobiliários.' },
  { id: 7, titulo: 'Ads Clínica OdontoVida', cliente: 'Clínica OdontoVida', responsavel: 'Ana', status: 'Em Andamento', prioridade: 'Alta', prazo: '2026-06-01', progresso: 55, descricao: 'Gestão de Google Ads e Meta Ads.' },
]

const statusColor: Record<string, string> = {
  'Em Andamento': 'badge-al', Planejamento: 'badge-bl', Revisão: 'badge-wr', Concluído: 'badge-ok', Pausado: 'badge-gr'
}
const priorColor: Record<string, string> = { Alta: 'badge-er', Média: 'badge-wr', Baixa: 'badge-gr' }
const empty: Omit<Projeto, 'id'> = { titulo: '', cliente: '', responsavel: '', status: 'Planejamento', prioridade: 'Média', prazo: '', progresso: 0, descricao: '' }

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState(inicial)
  const [view, setView] = useState<'lista' | 'kanban'>('lista')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Omit<Projeto, 'id'>>(empty)
  const [editing, setEditing] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const filtered = projetos.filter(p => p.titulo.toLowerCase().includes(search.toLowerCase()) || p.cliente.toLowerCase().includes(search.toLowerCase()))

  function save() {
    if (!form.titulo) return
    if (editing !== null) {
      setProjetos(ps => ps.map(p => p.id === editing ? { ...form, id: editing } : p))
    } else {
      setProjetos(ps => [...ps, { ...form, id: Date.now() }])
    }
    setModal(false); setForm(empty); setEditing(null)
  }

  function edit(p: Projeto) {
    const { id, ...rest } = p; setForm(rest); setEditing(id); setModal(true)
  }

  const cols = ['Planejamento', 'Em Andamento', 'Revisão', 'Concluído']

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Projetos</span>
          <span className="tb-sub">{projetos.filter(p => p.status !== 'Concluído').length} ativos</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="tabs" style={{ margin: 0 }}>
            <button className={`tab${view === 'lista' ? ' act' : ''}`} onClick={() => setView('lista')}>Lista</button>
            <button className={`tab${view === 'kanban' ? ' act' : ''}`} onClick={() => setView('kanban')}>Kanban</button>
          </div>
          <button className="btn btn-al" onClick={() => { setForm(empty); setEditing(null); setModal(true) }}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Projeto
          </button>
        </div>
      </div>

      <div className="content">
        {view === 'lista' ? (
          <div className="card">
            <div className="sec-hd">
              <input className="inp" placeholder="Buscar projeto..." style={{ width: 220 }} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Projeto</th><th>Cliente</th><th>Responsável</th>
                  <th>Prazo</th><th>Progresso</th><th>Prioridade</th><th>Status</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: 'var(--wh)' }}>{p.titulo}</td>
                    <td style={{ color: 'var(--gr3)', fontSize: 11 }}>{p.cliente}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="av">{p.responsavel.charAt(0)}</div>
                        <span style={{ fontSize: 11 }}>{p.responsavel}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{p.prazo}</td>
                    <td style={{ width: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${p.progresso}%`, background: p.progresso === 100 ? 'var(--ok)' : 'var(--al)' }} />
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--gr3)', width: 28 }}>{p.progresso}%</span>
                      </div>
                    </td>
                    <td><span className={`badge ${priorColor[p.prioridade]}`}>{p.prioridade}</span></td>
                    <td><span className={`badge ${statusColor[p.status]}`}>{p.status}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => edit(p)}>Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="kanban-wrap">
            {cols.map(col => {
              const cards = projetos.filter(p => p.status === col)
              return (
                <div key={col} className="k-col">
                  <div className="k-col-hd">
                    <span className="k-col-title">{col}</span>
                    <span className="k-col-cnt">{cards.length}</span>
                  </div>
                  <div className="k-cards">
                    {cards.map(p => (
                      <div key={p.id} className="k-card" onClick={() => edit(p)}>
                        <div className="k-card-title">{p.titulo}</div>
                        <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 8 }}>{p.cliente}</div>
                        <div className="progress-bar" style={{ marginBottom: 8 }}>
                          <div className="progress-fill" style={{ width: `${p.progresso}%` }} />
                        </div>
                        <div className="k-card-meta">
                          <span className={`badge ${priorColor[p.prioridade]}`}>{p.prioridade}</span>
                          <span style={{ fontSize: 9.5, color: 'var(--gr3)', marginLeft: 'auto' }}>{p.prazo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Editar Projeto' : 'Novo Projeto'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field"><label>Título</label>
                <input className="inp" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div className="modal-grid">
                <div className="field"><label>Cliente</label>
                  <input className="inp" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} />
                </div>
                <div className="field"><label>Responsável</label>
                  <input className="inp" value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })} />
                </div>
                <div className="field"><label>Status</label>
                  <select className="inp" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {['Planejamento','Em Andamento','Revisão','Concluído','Pausado'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field"><label>Prioridade</label>
                  <select className="inp" value={form.prioridade} onChange={e => setForm({ ...form, prioridade: e.target.value })}>
                    <option>Alta</option><option>Média</option><option>Baixa</option>
                  </select>
                </div>
                <div className="field"><label>Prazo</label>
                  <input className="inp" type="date" value={form.prazo} onChange={e => setForm({ ...form, prazo: e.target.value })} />
                </div>
                <div className="field"><label>Progresso (%)</label>
                  <input className="inp" type="number" min={0} max={100} value={form.progresso} onChange={e => setForm({ ...form, progresso: Number(e.target.value) })} />
                </div>
              </div>
              <div className="field"><label>Descrição</label>
                <textarea className="inp" rows={2} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
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
