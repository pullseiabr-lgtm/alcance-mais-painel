'use client'
import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'Instagram' | 'Facebook' | 'TikTok' | 'YouTube' | 'WhatsApp' | 'iFood'
type ContentType = 'Feed' | 'Story' | 'Reels' | 'Vídeo' | 'Post' | 'Status'
type Status = 'ideia' | 'producao' | 'agendado' | 'publicado'

interface Post {
  id:          number
  data:        string      // YYYY-MM-DD
  hora:        string      // HH:MM
  plataforma:  Platform
  tipo:        ContentType
  titulo:      string
  legenda:     string
  status:      Status
  cliente:     string
  campanha:    string
  cor:         string
}

const STORAGE_KEY = 'alcance_social_planner_v1'

const PLATFORMS: { id: Platform; icon: string; color: string }[] = [
  { id: 'Instagram', icon: '📸', color: '#E1306C' },
  { id: 'Facebook',  icon: '📘', color: '#1877F2' },
  { id: 'TikTok',    icon: '🎵', color: '#000000' },
  { id: 'YouTube',   icon: '📺', color: '#FF0000' },
  { id: 'WhatsApp',  icon: '💬', color: '#25D366' },
  { id: 'iFood',     icon: '🛵', color: '#E8002D' },
]

const CONTENT_TYPES: ContentType[] = ['Feed', 'Story', 'Reels', 'Vídeo', 'Post', 'Status']

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  ideia:      { label: 'Ideia',      color: '#8B5CF6', bg: 'rgba(139,92,246,.12)' },
  producao:   { label: 'Produção',   color: '#F59E0B', bg: 'rgba(245,158,11,.12)' },
  agendado:   { label: 'Agendado',   color: '#3B82F6', bg: 'rgba(59,130,246,.12)' },
  publicado:  { label: 'Publicado',  color: '#22C55E', bg: 'rgba(34,197,94,.12)'  },
}

const PLATFORM_COLORS: Record<Platform, string> = {
  Instagram: '#E1306C', Facebook: '#1877F2', TikTok: '#000000',
  YouTube: '#FF0000', WhatsApp: '#25D366', iFood: '#E8002D',
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const emptyPost: Omit<Post, 'id'> = {
  data: '', hora: '09:00', plataforma: 'Instagram', tipo: 'Feed',
  titulo: '', legenda: '', status: 'ideia', cliente: '', campanha: '', cor: '#E1306C',
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function getWeekDays(baseDate: Date): Date[] {
  const d = new Date(baseDate)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    return dd
  })
}

function fmtDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function fmtDisplay(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SocialPlannerPage() {
  const [posts, setPosts]             = useState<Post[]>([])
  const [loaded, setLoaded]           = useState(false)
  const [weekBase, setWeekBase]       = useState(new Date())
  const [modal, setModal]             = useState(false)
  const [form, setForm]               = useState<Omit<Post, 'id'>>(emptyPost)
  const [editing, setEditing]         = useState<number | null>(null)
  const [filterPlatform, setFilterP]  = useState<Platform | 'Todas'>('Todas')
  const [filterStatus, setFilterS]    = useState<Status | 'Todos'>('Todos')
  const [confirmDel, setConfirmDel]   = useState<number | null>(null)
  const [aiLoading, setAiLoading]     = useState(false)
  const [toast, setToast]             = useState('')

  useEffect(() => {
    try { setPosts(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? []) }
    catch { setPosts([]) }
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)) }, [posts, loaded])

  const days = getWeekDays(weekBase)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function prevWeek() { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d) }
  function nextWeek() { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d) }
  function today()    { setWeekBase(new Date()) }

  function openNew(date?: string) {
    setForm({ ...emptyPost, data: date ?? fmtDate(new Date()) })
    setEditing(null); setModal(true)
  }
  function openEdit(p: Post) {
    const { id, ...rest } = p; setForm(rest); setEditing(id); setModal(true)
  }
  function closeModal() { setModal(false); setForm(emptyPost); setEditing(null) }
  function save() {
    if (!form.titulo.trim()) return
    const cor = PLATFORM_COLORS[form.plataforma]
    if (editing !== null) {
      setPosts(ps => ps.map(p => p.id === editing ? { ...form, cor, id: editing } : p))
    } else {
      setPosts(ps => [...ps, { ...form, cor, id: Date.now() }])
    }
    closeModal(); showToast('✅ Post salvo!')
  }
  function deleteConfirmed() {
    if (confirmDel === null) return
    setPosts(ps => ps.filter(p => p.id !== confirmDel))
    setConfirmDel(null); setModal(false); setEditing(null)
    showToast('🗑️ Post excluído')
  }

  // ── AI suggestion ────────────────────────────────────────────────────────
  async function gerarSugestao() {
    if (!form.cliente && !form.campanha && !form.titulo) {
      showToast('Preencha pelo menos o cliente ou título para gerar sugestão'); return
    }
    setAiLoading(true)
    try {
      const res = await fetch('/api/trafego/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Gere uma legenda profissional para um post de ${form.plataforma} (${form.tipo}) para o seguinte contexto:
Cliente: ${form.cliente || 'restaurante'}
Título/tema: ${form.titulo || form.campanha || 'promocional'}
Plataforma: ${form.plataforma}
Tipo: ${form.tipo}

Gere APENAS a legenda, com emojis, hashtags relevantes e CTA. Máximo 200 caracteres para Stories, 500 para Feed/Reels. Sem explicações adicionais.`
          }]
        })
      })
      if (res.ok && res.body) {
        const reader  = res.body.getReader()
        const decoder = new TextDecoder()
        let text = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          text += decoder.decode(value, { stream: true })
        }
        setForm(f => ({ ...f, legenda: text.trim() }))
        showToast('✨ Legenda gerada com IA!')
      }
    } catch { showToast('Erro ao gerar legenda', ) }
    finally { setAiLoading(false) }
  }

  // ── Filtered posts by day ────────────────────────────────────────────────
  function postsForDay(date: string) {
    return posts
      .filter(p => p.data === date)
      .filter(p => filterPlatform === 'Todas' || p.plataforma === filterPlatform)
      .filter(p => filterStatus === 'Todos' || p.status === filterStatus)
      .sort((a, b) => a.hora.localeCompare(b.hora))
  }

  const totalPosts   = posts.length
  const publicados   = posts.filter(p => p.status === 'publicado').length
  const agendados    = posts.filter(p => p.status === 'agendado').length
  const emProducao   = posts.filter(p => p.status === 'producao').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          padding: '10px 16px', borderRadius: 'var(--r2)', fontSize: 12, fontWeight: 600,
          background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)',
          color: 'var(--ok)', backdropFilter: 'blur(10px)', boxShadow: 'var(--sh)',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ padding: '16px 24px 12px', borderBottom: '1px solid var(--gr)', background: 'var(--bk2)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 0 16px rgba(236,72,153,.4)', flexShrink: 0,
            }}>📅</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wh)' }}>Social Media Planner</div>
              <div style={{ fontSize: 9, color: 'var(--gr3)' }}>Calendário de conteúdo + IA para legendas</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" style={{ fontSize: 10, padding: '6px 12px' }} onClick={today}>Hoje</button>
            <button className="btn btn-al" style={{ fontSize: 11, padding: '7px 14px' }} onClick={() => openNew()}>
              ➕ Novo Post
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', val: totalPosts, color: 'var(--lgt)' },
            { label: 'Publicados', val: publicados, color: 'var(--ok)' },
            { label: 'Agendados',  val: agendados,  color: '#3B82F6' },
            { label: 'Produção',   val: emProducao, color: '#F59E0B' },
          ].map(k => (
            <div key={k.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: k.color }}>{k.val}</span>
              <span style={{ fontSize: 10, color: 'var(--gr3)' }}>{k.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + Week nav */}
      <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--gr)', background: 'var(--bk2)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
        {/* Week navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <button className="btn" style={{ padding: '5px 10px', fontSize: 12 }} onClick={prevWeek}>‹</button>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--wh)', minWidth: 160, textAlign: 'center' }}>
            {fmtDisplay(days[0])} — {fmtDisplay(days[6])}
          </span>
          <button className="btn" style={{ padding: '5px 10px', fontSize: 12 }} onClick={nextWeek}>›</button>
        </div>

        {/* Platform filter */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(['Todas', ...PLATFORMS.map(p => p.id)] as const).map(p => (
            <button key={p} onClick={() => setFilterP(p as Platform | 'Todas')} style={{
              padding: '3px 8px', borderRadius: 20, fontSize: 9, fontWeight: 600, cursor: 'pointer',
              border: 'none',
              background: filterPlatform === p ? 'var(--al)' : 'var(--bk3)',
              color: filterPlatform === p ? '#fff' : 'var(--gr3)',
              outline: filterPlatform === p ? 'none' : '1px solid var(--gr)',
            }}>{PLATFORMS.find(x => x.id === p)?.icon ?? ''} {p}</button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {(['Todos', 'ideia', 'producao', 'agendado', 'publicado'] as const).map(s => (
            <button key={s} onClick={() => setFilterS(s)} style={{
              padding: '3px 8px', borderRadius: 20, fontSize: 9, fontWeight: 600, cursor: 'pointer',
              border: 'none',
              background: filterStatus === s ? STATUS_CONFIG[s as Status]?.color ?? 'var(--al)' : 'var(--bk3)',
              color: filterStatus === s ? '#fff' : 'var(--gr3)',
              outline: filterStatus === s ? 'none' : '1px solid var(--gr)',
            }}>{s === 'Todos' ? 'Todos' : STATUS_CONFIG[s].label}</button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, minHeight: 400 }}>
          {days.map((day, di) => {
            const dateStr  = fmtDate(day)
            const dayPosts = postsForDay(dateStr)
            const isToday  = dateStr === fmtDate(new Date())
            return (
              <div key={dateStr} style={{
                background: 'var(--bk2)', border: `1px solid ${isToday ? 'var(--al)' : 'var(--gr)'}`,
                borderRadius: 12, overflow: 'hidden', minHeight: 200,
              }}>
                {/* Day header */}
                <div style={{
                  padding: '8px 10px', borderBottom: '1px solid var(--gr)',
                  background: isToday ? 'var(--alb)' : 'transparent',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? 'var(--al)' : 'var(--gr3)' }}>
                      {DIAS_SEMANA[di]}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: isToday ? 'var(--al)' : 'var(--wh)' }}>
                      {day.getDate()}
                    </div>
                  </div>
                  <button onClick={() => openNew(dateStr)} style={{
                    width: 22, height: 22, borderRadius: 6, background: 'var(--bk4)',
                    border: '1px solid var(--gr)', cursor: 'pointer', color: 'var(--gr3)',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>+</button>
                </div>

                {/* Posts */}
                <div style={{ padding: '6px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {dayPosts.map(p => {
                    const stCfg = STATUS_CONFIG[p.status]
                    const plat  = PLATFORMS.find(x => x.id === p.plataforma)
                    return (
                      <div key={p.id}
                        onClick={() => openEdit(p)}
                        style={{
                          padding: '6px 8px', borderRadius: 7, cursor: 'pointer',
                          borderLeft: `3px solid ${p.cor}`,
                          background: `${p.cor}10`,
                          transition: 'opacity .15s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--gr3)' }}>{p.hora}</span>
                          <span style={{ fontSize: 9 }}>{plat?.icon}</span>
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--lgt)', lineHeight: 1.3, marginBottom: 3 }}>
                          {p.titulo.length > 28 ? p.titulo.slice(0, 28) + '…' : p.titulo}
                        </div>
                        <div style={{
                          display: 'inline-flex', padding: '1px 6px', borderRadius: 10,
                          background: stCfg.bg, color: stCfg.color,
                          fontSize: 7, fontWeight: 700,
                        }}>{stCfg.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing !== null ? '✏️ Editar Post' : '➕ Novo Post'}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field">
                <label>Título / Tema *</label>
                <input className="inp" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex: Promoção segunda-feira, Lançamento cardápio..." />
              </div>

              <div className="modal-grid">
                <div className="field">
                  <label>Data</label>
                  <input className="inp" type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Horário</label>
                  <input className="inp" type="time" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Plataforma</label>
                  <select className="inp" value={form.plataforma} onChange={e => setForm(f => ({ ...f, plataforma: e.target.value as Platform }))}>
                    {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.id}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Tipo</label>
                  <select className="inp" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as ContentType }))}>
                    {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="inp" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}>
                    <option value="ideia">Ideia</option>
                    <option value="producao">Em Produção</option>
                    <option value="agendado">Agendado</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
                <div className="field">
                  <label>Cliente</label>
                  <input className="inp" value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))}
                    placeholder="Nome do cliente" />
                </div>
              </div>

              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ margin: 0 }}>Legenda / Copy</label>
                  <button onClick={gerarSugestao} disabled={aiLoading} style={{
                    fontSize: 9, padding: '3px 10px', borderRadius: 20,
                    background: 'rgba(0,196,180,.15)', color: 'var(--al)',
                    border: '1px solid rgba(0,196,180,.3)', cursor: 'pointer', fontWeight: 700,
                  }}>{aiLoading ? '⟳ Gerando…' : '✨ Gerar com IA'}</button>
                </div>
                <textarea className="inp" rows={3} value={form.legenda}
                  onChange={e => setForm(f => ({ ...f, legenda: e.target.value }))}
                  placeholder="Legenda, copy, hashtags..." style={{ resize: 'vertical' }} />
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

      {/* Confirm delete */}
      {confirmDel !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color: 'var(--er)' }}>🗑️ Excluir Post</div>
            <p style={{ fontSize: 13, color: 'var(--gr3)', margin: '12px 0 20px' }}>
              Excluir <strong style={{ color: 'var(--wh)' }}>"{posts.find(p => p.id === confirmDel)?.titulo}"</strong>?
            </p>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="btn" style={{ background: 'var(--er)', color: '#fff', border: 'none' }} onClick={deleteConfirmed}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
