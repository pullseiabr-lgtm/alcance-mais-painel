'use client'
import { useState } from 'react'

type Membro = {
  id: number; nome: string; cargo: string; email: string; especializacao: string[];
  status: string; projetos: number; cargaHoraria: number; nivel: string
}

const inicial: Membro[] = [
  { id: 1, nome: 'Marina Costa', cargo: 'Gerente de Conteúdo', email: 'marina@alcanceplus.com.br', especializacao: ['Redes Sociais','Copywriting','Branding'], status: 'Ativo', projetos: 6, cargaHoraria: 40, nivel: 'Sênior' },
  { id: 2, nome: 'Carlos Pereira', cargo: 'Especialista em Tráfego', email: 'carlos@alcanceplus.com.br', especializacao: ['Google Ads','Meta Ads','Analytics'], status: 'Ativo', projetos: 5, cargaHoraria: 40, nivel: 'Sênior' },
  { id: 3, nome: 'Ana Lima', cargo: 'Designer', email: 'ana@alcanceplus.com.br', especializacao: ['UI/UX','Motion','Identidade Visual'], status: 'Ativo', projetos: 4, cargaHoraria: 40, nivel: 'Pleno' },
  { id: 4, nome: 'João Silva', cargo: 'Analista de SEO', email: 'joao@alcanceplus.com.br', especializacao: ['SEO','SEM','Blog'], status: 'Ativo', projetos: 3, cargaHoraria: 32, nivel: 'Pleno' },
  { id: 5, nome: 'Fernanda Ramos', cargo: 'Account Manager', email: 'fernanda@alcanceplus.com.br', especializacao: ['Atendimento','Projetos','Relatórios'], status: 'Ativo', projetos: 8, cargaHoraria: 40, nivel: 'Sênior' },
  { id: 6, nome: 'Bruno Torres', cargo: 'Dev Web', email: 'bruno@alcanceplus.com.br', especializacao: ['WordPress','Landing Pages','React'], status: 'Férias', projetos: 2, cargaHoraria: 40, nivel: 'Pleno' },
]

const nivelColor: Record<string, string> = { Sênior: 'badge-al', Pleno: 'badge-bl', Júnior: 'badge-gr' }
const statusColor: Record<string, string> = { Ativo: 'badge-ok', Férias: 'badge-wr', Afastado: 'badge-er' }
const empty: Omit<Membro, 'id'> = { nome: '', cargo: '', email: '', especializacao: [], status: 'Ativo', projetos: 0, cargaHoraria: 40, nivel: 'Pleno' }

export default function EquipePage() {
  const [equipe, setEquipe] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Omit<Membro, 'id'>>(empty)
  const [editing, setEditing] = useState<number | null>(null)
  const [especInput, setEspecInput] = useState('')

  function save() {
    if (!form.nome) return
    if (editing !== null) {
      setEquipe(ms => ms.map(m => m.id === editing ? { ...form, id: editing } : m))
    } else {
      setEquipe(ms => [...ms, { ...form, id: Date.now() }])
    }
    setModal(false); setForm(empty); setEditing(null); setEspecInput('')
  }

  function edit(m: Membro) {
    const { id, ...rest } = m; setForm(rest); setEditing(id); setModal(true)
  }

  function addEspec() {
    if (especInput.trim()) {
      setForm(f => ({ ...f, especializacao: [...f.especializacao, especInput.trim()] }))
      setEspecInput('')
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Equipe</span>
          <span className="tb-sub">{equipe.filter(m => m.status === 'Ativo').length} ativos</span>
        </div>
        <button className="btn btn-al" onClick={() => { setForm(empty); setEditing(null); setModal(true) }}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Membro
        </button>
      </div>

      <div className="content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 20 }}>
          {equipe.map(m => (
            <div key={m.id} className="card" style={{ cursor: 'pointer' }} onClick={() => edit(m)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="av av-lg">{m.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--wh)', fontSize: 13 }}>{m.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--gr3)' }}>{m.cargo}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className={`badge ${statusColor[m.status]}`}>{m.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {m.especializacao.map(e => <span key={e} className="badge badge-gr">{e}</span>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(0,196,180,.06)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--al)' }}>{m.projetos}</div>
                  <div style={{ fontSize: 9, color: 'var(--gr3)' }}>Projetos</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wh)' }}>{m.cargaHoraria}h</div>
                  <div style={{ fontSize: 9, color: 'var(--gr3)' }}>Carga/sem</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span className={`badge ${nivelColor[m.nivel]}`}>{m.nivel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="card">
          <div className="sec-hd"><div className="sec-title">Resumo da Equipe</div></div>
          <table className="tbl">
            <thead>
              <tr><th>Nome</th><th>Cargo</th><th>Nível</th><th>Projetos</th><th>C. Horária</th><th>Status</th></tr>
            </thead>
            <tbody>
              {equipe.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="av">{m.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                      <span style={{ fontWeight: 600, color: 'var(--wh)' }}>{m.nome}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--gr3)', fontSize: 11 }}>{m.cargo}</td>
                  <td><span className={`badge ${nivelColor[m.nivel]}`}>{m.nivel}</span></td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--al)' }}>{m.projetos}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{m.cargaHoraria}h/sem</td>
                  <td><span className={`badge ${statusColor[m.status]}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Editar Membro' : 'Novo Membro'}</div>
            <div className="modal-grid">
              <div className="field"><label>Nome Completo</label>
                <input className="inp" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="field"><label>Cargo</label>
                <input className="inp" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} />
              </div>
              <div className="field"><label>E-mail</label>
                <input className="inp" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field"><label>Nível</label>
                <select className="inp" value={form.nivel} onChange={e => setForm({ ...form, nivel: e.target.value })}>
                  <option>Sênior</option><option>Pleno</option><option>Júnior</option>
                </select>
              </div>
              <div className="field"><label>Status</label>
                <select className="inp" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Ativo</option><option>Férias</option><option>Afastado</option>
                </select>
              </div>
              <div className="field"><label>Carga Horária (h/sem)</label>
                <input className="inp" type="number" value={form.cargaHoraria} onChange={e => setForm({ ...form, cargaHoraria: Number(e.target.value) })} />
              </div>
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>Especializações</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="inp" value={especInput} onChange={e => setEspecInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEspec()} placeholder="Digite e pressione Enter" />
                <button className="btn btn-ghost" onClick={addEspec}>+</button>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {form.especializacao.map(e => (
                  <span key={e} className="badge badge-al" style={{ cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, especializacao: f.especializacao.filter(x => x !== e) }))}>{e} ✕</span>
                ))}
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
