'use client'
import { useState } from 'react'

type Post = {
  id: number; titulo: string; cliente: string; canal: string; data: string;
  hora: string; status: string; formato: string; legenda: string
}

const inicial: Post[] = [
  { id: 1, titulo: 'Post Produto TechNova', cliente: 'TechNova Solutions', canal: 'Instagram', data: '2026-05-13', hora: '10:00', status: 'Aprovado', formato: 'Carrossel', legenda: 'Novidades do nosso produto! 🚀' },
  { id: 2, titulo: 'Vídeo Construtora', cliente: 'Construtora Viva Mais', canal: 'Instagram', data: '2026-05-13', hora: '14:00', status: 'Agendado', formato: 'Reels', legenda: 'Nossa obra mais recente em SP' },
  { id: 3, titulo: 'Story Promoção FitLife', cliente: 'Academia FitLife', canal: 'Instagram', data: '2026-05-14', hora: '09:00', status: 'Em Criação', formato: 'Story', legenda: 'Black Friday na academia!' },
  { id: 4, titulo: 'Post LinkedIn TechNova', cliente: 'TechNova Solutions', canal: 'LinkedIn', data: '2026-05-14', hora: '12:00', status: 'Aprovado', formato: 'Imagem', legenda: 'Case de sucesso com nossos clientes' },
  { id: 5, titulo: 'Foto Prato Sabor & Arte', cliente: 'Sabor & Arte Restaurante', canal: 'Instagram', data: '2026-05-15', hora: '11:00', status: 'Em Criação', formato: 'Imagem', legenda: 'Especial do dia! Venha provar 😋' },
  { id: 6, titulo: 'Dica Dr. Marcos', cliente: 'Dr. Marcos Cardiologia', canal: 'Instagram', data: '2026-05-15', hora: '16:00', status: 'Revisão', formato: 'Carrossel', legenda: '5 dicas para sua saúde cardíaca' },
  { id: 7, titulo: 'Post Imóvel Prime', cliente: 'Imobiliária Prime', canal: 'Facebook', data: '2026-05-16', hora: '10:00', status: 'Agendado', formato: 'Imagem', legenda: 'Apartamento novo em Moema!' },
  { id: 8, titulo: 'Reels OdontoVida', cliente: 'Clínica OdontoVida', canal: 'Instagram', data: '2026-05-17', hora: '13:00', status: 'Aprovado', formato: 'Reels', legenda: 'Antes e depois do seu sorriso ✨' },
]

const canalColor: Record<string, string> = { Instagram: 'badge-pk', LinkedIn: 'badge-bl', Facebook: 'badge-pu', YouTube: 'badge-er', TikTok: 'badge-wr' }
const statusColor: Record<string, string> = { Aprovado: 'badge-ok', Agendado: 'badge-al', 'Em Criação': 'badge-wr', Revisão: 'badge-bl', Publicado: 'badge-gr' }

type BadgeClass = string
const empty: Omit<Post, 'id'> = { titulo: '', cliente: '', canal: 'Instagram', data: '', hora: '10:00', status: 'Em Criação', formato: 'Imagem', legenda: '' }

export default function CalendarioPage() {
  const [posts, setPosts] = useState(inicial)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Omit<Post, 'id'>>(empty)
  const [editing, setEditing] = useState<number | null>(null)
  const [filter, setFilter] = useState('Todos')

  const dias = Array.from(new Set(posts.map(p => p.data))).sort()
  const filtered = posts.filter(p => filter === 'Todos' || p.status === filter)

  function save() {
    if (!form.titulo) return
    if (editing !== null) {
      setPosts(ps => ps.map(p => p.id === editing ? { ...form, id: editing } : p))
    } else {
      setPosts(ps => [...ps, { ...form, id: Date.now() }])
    }
    setModal(false); setForm(empty); setEditing(null)
  }

  function edit(p: Post) {
    const { id, ...rest } = p; setForm(rest); setEditing(id); setModal(true)
  }

  const diasUnicos = Array.from(new Set(filtered.map(p => p.data))).sort()

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Calendário de Conteúdo</span>
          <span className="tb-sub">{posts.length} publicações programadas</span>
        </div>
        <button className="btn btn-al" onClick={() => { setForm(empty); setEditing(null); setModal(true) }}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Publicação
        </button>
      </div>

      <div className="content">
        <div className="tabs">
          {['Todos','Em Criação','Revisão','Aprovado','Agendado','Publicado'].map(f => (
            <button key={f} className={`tab${filter === f ? ' act' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {diasUnicos.map(dia => {
            const dayPosts = filtered.filter(p => p.data === dia)
            return (
              <div key={dia}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gr3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'var(--bk4)', padding: '2px 10px', borderRadius: 20 }}>
                    {new Date(dia + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                  <span style={{ color: 'var(--al)' }}>{dayPosts.length} post(s)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {dayPosts.map(p => (
                    <div key={p.id} className="card" style={{ cursor: 'pointer', borderLeft: `3px solid ${canalColor[p.canal]?.replace('badge-', '') === 'pk' ? 'var(--pk)' : 'var(--al)'}` }} onClick={() => edit(p)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, color: 'var(--wh)', fontSize: 12 }}>{p.titulo}</div>
                        <span className={`badge ${statusColor[p.status]}`}>{p.status}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6 }}>{p.cliente}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span className={`badge ${canalColor[p.canal] ?? 'badge-gr'}`}>{p.canal}</span>
                        <span className="badge badge-gr">{p.formato}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--gr3)' }}>⏰ {p.hora}</span>
                      </div>
                      {p.legenda && <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 8, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{p.legenda}"</div>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? 'Editar Publicação' : 'Nova Publicação'}</div>
            <div className="modal-grid">
              <div className="field" style={{ gridColumn: '1/-1' }}><label>Título</label>
                <input className="inp" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div className="field"><label>Cliente</label>
                <input className="inp" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} />
              </div>
              <div className="field"><label>Canal</label>
                <select className="inp" value={form.canal} onChange={e => setForm({ ...form, canal: e.target.value })}>
                  {['Instagram','LinkedIn','Facebook','YouTube','TikTok','Twitter'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label>Formato</label>
                <select className="inp" value={form.formato} onChange={e => setForm({ ...form, formato: e.target.value })}>
                  {['Imagem','Carrossel','Reels','Story','Vídeo','Texto'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="field"><label>Status</label>
                <select className="inp" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['Em Criação','Revisão','Aprovado','Agendado','Publicado'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field"><label>Data</label>
                <input className="inp" type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
              <div className="field"><label>Hora</label>
                <input className="inp" type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
              </div>
              <div className="field" style={{ gridColumn: '1/-1' }}><label>Legenda</label>
                <textarea className="inp" rows={3} value={form.legenda} onChange={e => setForm({ ...form, legenda: e.target.value })} />
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
