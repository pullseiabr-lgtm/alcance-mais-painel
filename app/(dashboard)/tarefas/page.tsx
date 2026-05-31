'use client'
import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Prioridade = 'Urgente' | 'Alta' | 'Média' | 'Baixa'
type Status     = 'A Fazer' | 'Em Andamento' | 'Revisão' | 'Concluído'
type View       = 'kanban' | 'lista' | 'minhas'

interface CheckItem { id: number; texto: string; feito: boolean }

interface Tarefa {
  id:          number
  titulo:      string
  descricao:   string
  responsavel: string
  projeto:     string
  cliente:     string
  prioridade:  Prioridade
  status:      Status
  prazo:       string
  tags:        string[]
  checklist:   CheckItem[]
  criado:      string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'alcance_tarefas_v1'

const STATUS_COLS: Status[] = ['A Fazer', 'Em Andamento', 'Revisão', 'Concluído']

const STATUS_CFG: Record<Status, { icon: string; color: string; bg: string; border: string }> = {
  'A Fazer':      { icon: '○', color: '#8892B0', bg: 'rgba(136,146,176,.1)', border: 'rgba(136,146,176,.3)' },
  'Em Andamento': { icon: '◑', color: '#00C4B4', bg: 'rgba(0,196,180,.1)',   border: 'rgba(0,196,180,.3)'   },
  'Revisão':      { icon: '◕', color: '#F59E0B', bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.3)' },
  'Concluído':    { icon: '●', color: '#22C55E', bg: 'rgba(34,197,94,.1)',  border: 'rgba(34,197,94,.3)'  },
}

const PRIORIDADE_CFG: Record<Prioridade, { color: string; bg: string; dot: string }> = {
  Urgente: { color: '#EF4444', bg: 'rgba(239,68,68,.12)',   dot: '#EF4444' },
  Alta:    { color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  dot: '#F59E0B' },
  Média:   { color: '#3B82F6', bg: 'rgba(59,130,246,.12)',  dot: '#3B82F6' },
  Baixa:   { color: '#8892B0', bg: 'rgba(136,146,176,.12)', dot: '#8892B0' },
}

const RESPONSAVEIS = ['Marina', 'Carlos', 'Ana', 'João', 'Lucia', 'Pedro', 'Sofia']

const PROJETOS = [
  'Rebranding TechNova', 'Campanha Meta Ads', 'SEO Construtora',
  'Social Media Amore', 'Google Ads Dr. Marcos', 'Conteúdo Instagram',
  'Gestão iFood', 'Campanha Evento',
]

const emptyTarefa: Omit<Tarefa, 'id' | 'criado'> = {
  titulo: '', descricao: '', responsavel: '', projeto: '',
  cliente: '', prioridade: 'Média', status: 'A Fazer',
  prazo: '', tags: [], checklist: [],
}

const INICIAL: Tarefa[] = [
  { id: 1, titulo: 'Criar criativos para campanha Meta Ads', descricao: 'Desenvolver 5 variações de anúncio para o cliente Amore', responsavel: 'Marina', projeto: 'Social Media Amore', cliente: 'Amore Restaurante', prioridade: 'Alta', status: 'Em Andamento', prazo: '2026-06-05', tags: ['design', 'meta-ads'], checklist: [{ id:1, texto:'Brief criativo', feito: true }, { id:2, texto:'Rascunhos', feito: true }, { id:3, texto:'Revisão cliente', feito: false }], criado: '2026-05-28' },
  { id: 2, titulo: 'Relatório mensal de performance', descricao: 'Compilar métricas de todas as campanhas ativas', responsavel: 'Carlos', projeto: 'Campanha Meta Ads', cliente: 'TechNova Solutions', prioridade: 'Urgente', status: 'A Fazer', prazo: '2026-06-01', tags: ['relatório', 'analytics'], checklist: [], criado: '2026-05-29' },
  { id: 3, titulo: 'Revisar landing page imobiliária', descricao: 'Ajustes de SEO e velocidade', responsavel: 'Ana', projeto: 'SEO Construtora', cliente: 'Construtora Viva Mais', prioridade: 'Média', status: 'Revisão', prazo: '2026-06-03', tags: ['seo', 'website'], checklist: [{ id:1, texto:'Análise técnica', feito: true }], criado: '2026-05-27' },
  { id: 4, titulo: 'Configurar pixel Meta Ads', descricao: 'Instalar e validar o pixel de conversão', responsavel: 'João', projeto: 'Campanha Meta Ads', cliente: 'Dr. Marcos Cardiologia', prioridade: 'Alta', status: 'Concluído', prazo: '2026-05-30', tags: ['meta-ads', 'pixel'], checklist: [{ id:1, texto:'Instalação', feito: true }, { id:2, texto:'Validação', feito: true }], criado: '2026-05-25' },
  { id: 5, titulo: 'Planejar calendário junho', descricao: 'Criar calendário editorial para Instagram e Facebook', responsavel: 'Marina', projeto: 'Social Media Amore', cliente: 'Amore Restaurante', prioridade: 'Média', status: 'A Fazer', prazo: '2026-06-02', tags: ['social', 'planejamento'], checklist: [], criado: '2026-05-30' },
  { id: 6, titulo: 'Otimizar campanha Google Ads', descricao: 'Revisar palavras-chave negativas e lances', responsavel: 'Carlos', projeto: 'Google Ads Dr. Marcos', cliente: 'Dr. Marcos Cardiologia', prioridade: 'Alta', status: 'Em Andamento', prazo: '2026-06-04', tags: ['google-ads', 'otimização'], checklist: [], criado: '2026-05-29' },
]

// ─── Utils ────────────────────────────────────────────────────────────────────

function isOverdue(prazo: string) {
  if (!prazo) return false
  return new Date(prazo) < new Date(new Date().toDateString())
}

function daysUntil(prazo: string) {
  if (!prazo) return null
  const diff = Math.ceil((new Date(prazo).getTime() - new Date().getTime()) / 86400000)
  return diff
}

function fmtDate(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PrioridadeBadge({ p }: { p: Prioridade }) {
  const cfg = PRIORIDADE_CFG[p]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {p}
    </span>
  )
}

function StatusBadge({ s }: { s: Status }) {
  const cfg = STATUS_CFG[s]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 20, fontSize: 9, fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>{cfg.icon} {s}</span>
  )
}

function AvatarBubble({ name, size = 26 }: { name: string; size?: number }) {
  const colors = ['#00C4B4', '#8B5CF6', '#F59E0B', '#3B82F6', '#EC4899', '#22C55E', '#EF4444']
  const idx = name.charCodeAt(0) % colors.length
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: '50%',
      background: colors[idx], display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>{getInitials(name)}</div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TarefasPage() {
  const [tarefas, setTarefas]     = useState<Tarefa[]>([])
  const [loaded, setLoaded]       = useState(false)
  const [view, setView]           = useState<View>('kanban')
  const [modal, setModal]         = useState(false)
  const [detail, setDetail]       = useState<Tarefa | null>(null)
  const [form, setForm]           = useState<Omit<Tarefa, 'id' | 'criado'>>(emptyTarefa)
  const [editing, setEditing]     = useState<number | null>(null)
  const [confirmDel, setConfirmDel] = useState<number | null>(null)
  const [search, setSearch]       = useState('')
  const [filterResp, setFilterR]  = useState('Todos')
  const [filterPrior, setFilterP] = useState<Prioridade | 'Todas'>('Todas')
  const [filterStatus, setFilterS] = useState<Status | 'Todos'>('Todos')
  const [newTag, setNewTag]       = useState('')
  const [newCheck, setNewCheck]   = useState('')
  const [toast, setToast]         = useState('')

  // Persistence
  useEffect(() => {
    try { setTarefas(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? INICIAL) }
    catch { setTarefas(INICIAL) }
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas)) }, [tarefas, loaded])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // ── Filter ──────────────────────────────────────────────────────────────
  const filtered = tarefas.filter(t => {
    const matchSearch = !search || t.titulo.toLowerCase().includes(search.toLowerCase()) ||
      t.cliente.toLowerCase().includes(search.toLowerCase()) ||
      t.projeto.toLowerCase().includes(search.toLowerCase())
    const matchResp   = filterResp === 'Todos' || t.responsavel === filterResp
    const matchPrior  = filterPrior === 'Todas' || t.prioridade === filterPrior
    const matchStatus = filterStatus === 'Todos' || t.status === filterStatus
    const matchView   = view !== 'minhas' || t.responsavel === 'Marina' // TODO: dynamic user
    return matchSearch && matchResp && matchPrior && matchStatus && (view !== 'minhas' || matchView)
  })

  // ── CRUD ────────────────────────────────────────────────────────────────
  function openNew(status?: Status) {
    setForm({ ...emptyTarefa, status: status ?? 'A Fazer' })
    setEditing(null); setModal(true)
  }
  function openEdit(t: Tarefa) {
    const { id, criado, ...rest } = t
    setForm(rest); setEditing(id); setDetail(null); setModal(true)
  }
  function closeModal() { setModal(false); setForm(emptyTarefa); setEditing(null); setNewTag(''); setNewCheck('') }

  function save() {
    if (!form.titulo.trim()) return
    const now = new Date().toISOString().split('T')[0]
    if (editing !== null) {
      setTarefas(ts => ts.map(t => t.id === editing ? { ...form, id: editing, criado: t.criado } : t))
      showToast('✅ Tarefa atualizada!')
    } else {
      setTarefas(ts => [...ts, { ...form, id: Date.now(), criado: now }])
      showToast('✅ Tarefa criada!')
    }
    closeModal()
  }

  function deleteConfirmed() {
    if (confirmDel === null) return
    setTarefas(ts => ts.filter(t => t.id !== confirmDel))
    setConfirmDel(null); setDetail(null); setModal(false)
    showToast('🗑️ Tarefa excluída')
  }

  function changeStatus(id: number, status: Status) {
    setTarefas(ts => ts.map(t => t.id === id ? { ...t, status } : t))
    if (detail?.id === id) setDetail(d => d ? { ...d, status } : null)
  }

  function toggleCheck(tarefaId: number, checkId: number) {
    setTarefas(ts => ts.map(t => t.id === tarefaId
      ? { ...t, checklist: t.checklist.map(c => c.id === checkId ? { ...c, feito: !c.feito } : c) }
      : t
    ))
    if (detail?.id === tarefaId) {
      setDetail(d => d ? { ...d, checklist: d.checklist.map(c => c.id === checkId ? { ...c, feito: !c.feito } : c) } : null)
    }
  }

  // Form helpers
  function addTag() {
    const t = newTag.trim()
    if (t && !form.tags.includes(t)) { setForm(f => ({ ...f, tags: [...f.tags, t] })); setNewTag('') }
  }
  function removeTag(tag: string) { setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) })) }
  function addCheck() {
    const t = newCheck.trim()
    if (t) { setForm(f => ({ ...f, checklist: [...f.checklist, { id: Date.now(), texto: t, feito: false }] })); setNewCheck('') }
  }
  function removeCheck(id: number) { setForm(f => ({ ...f, checklist: f.checklist.filter(c => c.id !== id) })) }

  // ── Stats ────────────────────────────────────────────────────────────────
  const total    = tarefas.length
  const urgentes = tarefas.filter(t => t.prioridade === 'Urgente' && t.status !== 'Concluído').length
  const vencidas = tarefas.filter(t => isOverdue(t.prazo) && t.status !== 'Concluído').length
  const concl    = tarefas.filter(t => t.status === 'Concluído').length

  // ─── Render ───────────────────────────────────────────────────────────────
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
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 0 16px rgba(59,130,246,.4)', flexShrink: 0,
            }}>✓</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--wh)' }}>Tarefas</div>
              <div style={{ fontSize: 9, color: 'var(--gr3)' }}>Gestão de tarefas da equipe — Kanban, Lista, Minhas Tarefas</div>
            </div>
          </div>
          <button className="btn btn-al" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => openNew()}>
            ➕ Nova Tarefa
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',    val: total,    color: 'var(--lgt)' },
            { label: 'Urgentes', val: urgentes, color: '#EF4444' },
            { label: 'Vencidas', val: vencidas, color: '#F59E0B' },
            { label: 'Concluídas', val: concl,  color: 'var(--ok)' },
          ].map(k => (
            <div key={k.label} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.val}</span>
              <span style={{ fontSize: 10, color: 'var(--gr3)' }}>{k.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--gr)', background: 'var(--bk2)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
        {/* View tabs */}
        <div style={{ display: 'flex', background: 'var(--bk3)', borderRadius: 'var(--r2)', padding: 3, gap: 2 }}>
          {([
            { id: 'kanban', label: '⬜ Kanban' },
            { id: 'lista',  label: '☰ Lista'  },
            { id: 'minhas', label: '👤 Minhas' },
          ] as { id: View; label: string }[]).map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 10, fontWeight: 700,
              background: view === v.id ? 'var(--bk2)' : 'transparent',
              color: view === v.id ? 'var(--wh)' : 'var(--gr3)',
            }}>{v.label}</button>
          ))}
        </div>

        {/* Search */}
        <input className="inp" placeholder="🔍 Buscar tarefa..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 200, fontSize: 11, padding: '6px 10px' }} />

        {/* Filters */}
        <select className="inp" value={filterResp} onChange={e => setFilterR(e.target.value)}
          style={{ fontSize: 10, padding: '6px 8px', width: 120 }}>
          <option value="Todos">👤 Todos</option>
          {RESPONSAVEIS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select className="inp" value={filterPrior} onChange={e => setFilterP(e.target.value as Prioridade | 'Todas')}
          style={{ fontSize: 10, padding: '6px 8px', width: 110 }}>
          <option value="Todas">🏷 Prioridade</option>
          {(['Urgente','Alta','Média','Baixa'] as Prioridade[]).map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select className="inp" value={filterStatus} onChange={e => setFilterS(e.target.value as Status | 'Todos')}
          style={{ fontSize: 10, padding: '6px 8px', width: 130 }}>
          <option value="Todos">○ Status</option>
          {STATUS_COLS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <span style={{ fontSize: 10, color: 'var(--gr3)', marginLeft: 'auto' }}>
          {filtered.length} tarefa{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>

        {/* ── KANBAN ── */}
        {(view === 'kanban' || view === 'minhas') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, alignItems: 'start' }}>
            {STATUS_COLS.map(col => {
              const cards = filtered.filter(t => t.status === col)
              const cfg   = STATUS_CFG[col]
              return (
                <div key={col}>
                  {/* Column header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 10, padding: '0 4px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 14, color: cfg.color }}>{cfg.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--lgt)' }}>{col}</span>
                      <span style={{
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        borderRadius: 20, fontSize: 9, fontWeight: 700, padding: '1px 7px',
                      }}>{cards.length}</span>
                    </div>
                    <button onClick={() => openNew(col)} style={{
                      background: 'none', border: 'none', color: 'var(--gr3)', cursor: 'pointer',
                      fontSize: 16, padding: '0 3px', lineHeight: 1,
                    }}>+</button>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cards.map(t => {
                      const overdue = isOverdue(t.prazo) && t.status !== 'Concluído'
                      const days    = daysUntil(t.prazo)
                      const done    = t.checklist.filter(c => c.feito).length
                      return (
                        <div key={t.id}
                          onClick={() => setDetail(t)}
                          style={{
                            background: 'var(--bk2)', border: `1px solid ${overdue ? 'rgba(239,68,68,.35)' : 'var(--gr)'}`,
                            borderRadius: 10, padding: '12px', cursor: 'pointer',
                            transition: 'border-color .15s, transform .15s',
                            borderLeft: `3px solid ${PRIORIDADE_CFG[t.prioridade].dot}`,
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--wh)', marginBottom: 6, lineHeight: 1.35 }}>
                            {t.titulo}
                          </div>

                          {t.projeto && (
                            <div style={{ fontSize: 9, color: 'var(--al)', marginBottom: 6 }}>📁 {t.projeto}</div>
                          )}

                          {/* Tags */}
                          {t.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                              {t.tags.slice(0,3).map(tag => (
                                <span key={tag} style={{
                                  fontSize: 8, padding: '1px 6px', borderRadius: 10,
                                  background: 'var(--bk4)', border: '1px solid var(--gr)', color: 'var(--gr3)',
                                }}>#{tag}</span>
                              ))}
                            </div>
                          )}

                          {/* Checklist progress */}
                          {t.checklist.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ fontSize: 8, color: 'var(--gr3)' }}>✓ {done}/{t.checklist.length}</span>
                              </div>
                              <div style={{ height: 3, background: 'var(--bk4)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{
                                  width: `${t.checklist.length > 0 ? (done / t.checklist.length) * 100 : 0}%`,
                                  height: '100%', background: 'var(--ok)', borderRadius: 3,
                                  transition: 'width .3s',
                                }} />
                              </div>
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                            <PrioridadeBadge p={t.prioridade} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {t.prazo && (
                                <span style={{
                                  fontSize: 9, fontFamily: 'var(--mono)',
                                  color: overdue ? '#EF4444' : days !== null && days <= 2 ? '#F59E0B' : 'var(--gr3)',
                                  fontWeight: overdue ? 700 : 400,
                                }}>
                                  {overdue ? '⚠️ ' : ''}{fmtDate(t.prazo)}
                                </span>
                              )}
                              {t.responsavel && <AvatarBubble name={t.responsavel} size={22} />}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Empty col add button */}
                    {cards.length === 0 && (
                      <button onClick={() => openNew(col)} style={{
                        padding: '12px', borderRadius: 10, cursor: 'pointer',
                        background: 'transparent', border: '1px dashed var(--gr)',
                        color: 'var(--gr3)', fontSize: 11, fontWeight: 600,
                        transition: 'border-color .15s',
                      }}>+ Adicionar tarefa</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── LISTA ── */}
        {view === 'lista' && (
          <div className="card" style={{ overflow: 'visible' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 24 }}>✓</th>
                  <th>Tarefa</th>
                  <th>Responsável</th>
                  <th>Projeto</th>
                  <th>Prioridade</th>
                  <th>Prazo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const overdue = isOverdue(t.prazo) && t.status !== 'Concluído'
                  const done    = t.checklist.filter(c => c.feito).length
                  return (
                    <tr key={t.id} style={{ opacity: t.status === 'Concluído' ? 0.6 : 1 }}>
                      <td>
                        <div style={{
                          width: 16, height: 16, borderRadius: 4, cursor: 'pointer',
                          border: `2px solid ${STATUS_CFG[t.status].color}`,
                          background: t.status === 'Concluído' ? STATUS_CFG[t.status].color : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }} onClick={() => changeStatus(t.id, t.status === 'Concluído' ? 'A Fazer' : 'Concluído')}>
                          {t.status === 'Concluído' && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>✓</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--wh)', cursor: 'pointer' }} onClick={() => setDetail(t)}>
                          {t.titulo}
                        </div>
                        {t.checklist.length > 0 && (
                          <div style={{ fontSize: 9, color: 'var(--gr3)', marginTop: 2 }}>
                            ✓ {done}/{t.checklist.length} checklist
                          </div>
                        )}
                      </td>
                      <td>
                        {t.responsavel && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AvatarBubble name={t.responsavel} size={24} />
                            <span style={{ fontSize: 11 }}>{t.responsavel}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--gr3)' }}>{t.projeto || '—'}</td>
                      <td><PrioridadeBadge p={t.prioridade} /></td>
                      <td style={{
                        fontSize: 11, fontFamily: 'var(--mono)',
                        color: overdue ? '#EF4444' : 'var(--gr3)', fontWeight: overdue ? 700 : 400,
                      }}>
                        {overdue ? '⚠️ ' : ''}{fmtDate(t.prazo)}
                      </td>
                      <td><StatusBadge s={t.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--er)' }} onClick={() => setConfirmDel(t.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--gr3)' }}>
                Nenhuma tarefa encontrada
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DETAIL MODAL ── */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" style={{ maxWidth: 560, maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  <PrioridadeBadge p={detail.prioridade} />
                  <StatusBadge s={detail.status} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--wh)', lineHeight: 1.3 }}>
                  {detail.titulo}
                </div>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--gr3)', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
            </div>

            {/* Meta info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Responsável', val: detail.responsavel || '—' },
                { label: 'Prazo', val: fmtDate(detail.prazo) },
                { label: 'Projeto', val: detail.projeto || '—' },
                { label: 'Cliente', val: detail.cliente || '—' },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: 'var(--bk3)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: 'var(--gr3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lgt)' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {detail.descricao && (
              <div style={{ background: 'var(--bk3)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 9, color: 'var(--gr3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>Descrição</div>
                <div style={{ fontSize: 12, color: 'var(--lgt)', lineHeight: 1.6 }}>{detail.descricao}</div>
              </div>
            )}

            {/* Checklist */}
            {detail.checklist.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                    Checklist
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--ok)' }}>
                    {detail.checklist.filter(c => c.feito).length}/{detail.checklist.length}
                  </span>
                </div>
                <div style={{ height: 3, background: 'var(--bk4)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{
                    width: `${detail.checklist.length ? (detail.checklist.filter(c => c.feito).length / detail.checklist.length) * 100 : 0}%`,
                    height: '100%', background: 'var(--ok)', borderRadius: 3, transition: 'width .3s',
                  }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {detail.checklist.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
                      <div onClick={() => toggleCheck(detail.id, c.id)} style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        border: `2px solid ${c.feito ? 'var(--ok)' : 'var(--gr)'}`,
                        background: c.feito ? 'var(--ok)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}>
                        {c.feito && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 12, color: c.feito ? 'var(--gr3)' : 'var(--lgt)', textDecoration: c.feito ? 'line-through' : 'none' }}>
                        {c.texto}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {detail.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                {detail.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 9, padding: '2px 8px', borderRadius: 10,
                    background: 'var(--bk3)', border: '1px solid var(--gr)', color: 'var(--gr3)',
                  }}>#{tag}</span>
                ))}
              </div>
            )}

            {/* Status change */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {STATUS_COLS.map(s => (
                <button key={s} onClick={() => changeStatus(detail.id, s)} style={{
                  padding: '5px 10px', borderRadius: 20, fontSize: 9, fontWeight: 700, cursor: 'pointer',
                  border: 'none',
                  background: detail.status === s ? STATUS_CFG[s].bg : 'var(--bk3)',
                  color: detail.status === s ? STATUS_CFG[s].color : 'var(--gr3)',
                  outline: detail.status === s ? `1px solid ${STATUS_CFG[s].border}` : '1px solid var(--gr)',
                  transition: 'all .15s',
                }}>{STATUS_CFG[s].icon} {s}</button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--gr)', paddingTop: 14 }}>
              <button className="btn btn-ghost" style={{ color: 'var(--er)' }} onClick={() => { setDetail(null); setConfirmDel(detail.id) }}>🗑️ Excluir</button>
              <button className="btn btn-al" style={{ marginLeft: 'auto' }} onClick={() => openEdit(detail)}>✏️ Editar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FORM MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 580, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing !== null ? '✏️ Editar Tarefa' : '➕ Nova Tarefa'}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field">
                <label>Título *</label>
                <input className="inp" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="O que precisa ser feito?" autoFocus />
              </div>

              <div className="field">
                <label>Descrição</label>
                <textarea className="inp" rows={2} value={form.descricao}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  placeholder="Detalhes, contexto, links..." style={{ resize: 'vertical' }} />
              </div>

              <div className="modal-grid">
                <div className="field">
                  <label>Responsável</label>
                  <select className="inp" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))}>
                    <option value="">Selecionar...</option>
                    {RESPONSAVEIS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Prioridade</label>
                  <select className="inp" value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: e.target.value as Prioridade }))}>
                    {(['Urgente','Alta','Média','Baixa'] as Prioridade[]).map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="inp" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}>
                    {STATUS_COLS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Prazo</label>
                  <input className="inp" type="date" value={form.prazo} onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Projeto</label>
                  <select className="inp" value={form.projeto} onChange={e => setForm(f => ({ ...f, projeto: e.target.value }))}>
                    <option value="">Selecionar...</option>
                    {PROJETOS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Cliente</label>
                  <input className="inp" value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))}
                    placeholder="Nome do cliente" />
                </div>
              </div>

              {/* Tags */}
              <div className="field">
                <label>Tags</label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                  {form.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 10,
                      background: 'var(--bk3)', border: '1px solid var(--gr)', color: 'var(--gr3)',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      #{tag}
                      <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gr3)', fontSize: 10, padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="inp" value={newTag} onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                    placeholder="Adicionar tag..." style={{ flex: 1, fontSize: 11 }} />
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 10 }} onClick={addTag}>+ Adicionar</button>
                </div>
              </div>

              {/* Checklist */}
              <div className="field">
                <label>Checklist</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 6 }}>
                  {form.checklist.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: 3, border: '2px solid var(--gr)', flexShrink: 0,
                        cursor: 'pointer', background: c.feito ? 'var(--ok)' : 'transparent',
                      }} onClick={() => setForm(f => ({ ...f, checklist: f.checklist.map(ch => ch.id === c.id ? { ...ch, feito: !ch.feito } : ch) }))} />
                      <span style={{ fontSize: 11, flex: 1, color: 'var(--lgt)', textDecoration: c.feito ? 'line-through' : 'none' }}>{c.texto}</span>
                      <button onClick={() => removeCheck(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--er)', fontSize: 12, padding: 0 }}>×</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="inp" value={newCheck} onChange={e => setNewCheck(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCheck() } }}
                    placeholder="Item do checklist..." style={{ flex: 1, fontSize: 11 }} />
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 10 }} onClick={addCheck}>+ Item</button>
                </div>
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

      {/* ── CONFIRM DELETE ── */}
      {confirmDel !== null && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color: 'var(--er)' }}>🗑️ Excluir Tarefa</div>
            <p style={{ fontSize: 13, color: 'var(--gr3)', margin: '12px 0 20px' }}>
              Excluir <strong style={{ color: 'var(--wh)' }}>"{tarefas.find(t => t.id === confirmDel)?.titulo}"</strong>?
              <br/><span style={{ fontSize: 11 }}>Esta ação não pode ser desfeita.</span>
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
