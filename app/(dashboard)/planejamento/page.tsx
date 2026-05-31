'use client'
import { useState, useEffect } from 'react'
import { seedAmorePaiva } from '@/lib/seed-amore-paiva'

// ─── Types ────────────────────────────────────────────────────────────────────

type CampStatus  = 'Briefing' | 'Planejamento' | 'Produção' | 'Ativa' | 'Pausada' | 'Concluída'
type ViewMode    = 'lista' | 'kanban' | 'detalhe'
type WizardStep  = 1 | 2 | 3 | 4 | 5 | 6

interface OrcPlat  { plataforma: string; valor: number; percentual: number }
interface Fase     { id: number; nome: string; dataInicio: string; dataFim: string; orcamento: number; objetivo: string; status: string }
interface Criativo { id: number; formato: string; plataforma: string; status: string; descricao: string; copy: string }

interface Campanha {
  id:              number
  nome:            string
  cliente:         string
  tipo:            string
  status:          CampStatus
  objetivo:        string
  mensagemChave:   string
  publicoAlvo:     string
  faixaEtaria:     string
  localizacao:     string
  interesses:      string[]
  dataInicio:      string
  dataFim:         string
  orcamentoTotal:  number
  orcPlataformas:  OrcPlat[]
  metaImpressoes:  number
  metaCliques:     number
  metaConversoes:  number
  metaROAS:        number
  impressoes:      number
  cliques:         number
  conversoes:      number
  gastoReal:       number
  diferenciais:    string[]
  concorrentes:    string[]
  observacoes:     string
  fases:           Fase[]
  criativos:       Criativo[]
  criado:          string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'alcance_planejamento_v1'

const STATUS_CFG: Record<CampStatus, { color: string; bg: string; border: string; icon: string }> = {
  Briefing:     { color: '#8892B0', bg: 'rgba(136,146,176,.12)', border: 'rgba(136,146,176,.3)', icon: '📝' },
  Planejamento: { color: '#8B5CF6', bg: 'rgba(139,92,246,.12)',  border: 'rgba(139,92,246,.3)',  icon: '📋' },
  Produção:     { color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  border: 'rgba(245,158,11,.3)',  icon: '⚙️' },
  Ativa:        { color: '#22C55E', bg: 'rgba(34,197,94,.12)',   border: 'rgba(34,197,94,.3)',   icon: '▶️' },
  Pausada:      { color: '#EF4444', bg: 'rgba(239,68,68,.12)',   border: 'rgba(239,68,68,.3)',   icon: '⏸️' },
  Concluída:    { color: '#00C4B4', bg: 'rgba(0,196,180,.12)',   border: 'rgba(0,196,180,.3)',   icon: '✅' },
}

const TIPOS = ['Lançamento', 'Promoção', 'Awareness', 'Evento', 'Retenção', 'Sazonal', 'Performance']
const OBJETIVOS = ['Vendas', 'Leads', 'Reconhecimento', 'Engajamento', 'Tráfego', 'Instalações', 'Reservas', 'Pedidos Delivery']
const PLATAFORMAS = ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Instagram Orgânico', 'YouTube', 'iFood Ads', 'Email Marketing', 'WhatsApp']
const FORMATOS = ['Feed', 'Story', 'Reels', 'Carrossel', 'Banner', 'Vídeo 15s', 'Vídeo 30s', 'Shorts']
const FASES_PADRAO = [
  { nome: 'Awareness',    objetivo: 'Gerar reconhecimento e alcance da marca/oferta' },
  { nome: 'Consideração', objetivo: 'Engajar público interessado e gerar intenção' },
  { nome: 'Conversão',    objetivo: 'Converter leads em clientes/pedidos' },
  { nome: 'Retenção',     objetivo: 'Fidelizar e gerar recompra' },
]
const CRIATIVO_STATUS = ['Briefado', 'Em Produção', 'Em Revisão', 'Aprovado', 'Publicado']

const INICIAL: Campanha[] = [
  {
    id: 1, nome: 'Campanha Dia dos Namorados — Amore', cliente: 'Amore Restaurante', tipo: 'Sazonal',
    status: 'Planejamento', objetivo: 'Reservas',
    mensagemChave: 'Celebre o amor com a melhor gastronomia da cidade. Reserve já!',
    publicoAlvo: 'Casais entre 25-45 anos, renda média-alta, que frequentam restaurantes',
    faixaEtaria: '25-45', localizacao: 'São Paulo — raio 8km',
    interesses: ['gastronomia', 'restaurante', 'casamentos', 'viagem', 'luxo'],
    dataInicio: '2026-06-01', dataFim: '2026-06-15', orcamentoTotal: 4500,
    orcPlataformas: [
      { plataforma: 'Meta Ads', valor: 2250, percentual: 50 },
      { plataforma: 'Google Ads', valor: 1125, percentual: 25 },
      { plataforma: 'Instagram Orgânico', valor: 675, percentual: 15 },
      { plataforma: 'iFood Ads', valor: 450, percentual: 10 },
    ],
    metaImpressoes: 180000, metaCliques: 4500, metaConversoes: 150, metaROAS: 8,
    impressoes: 62000, cliques: 1840, conversoes: 48, gastoReal: 1200,
    diferenciais: ['Ambiente exclusivo', 'Menu especial para o dia', 'Sobremesa inclusa', 'Vinho importado'],
    concorrentes: ['Restaurante Fasano', 'D.O.M', 'Spot'],
    observacoes: 'Focar em casais. Criativos com ambientação romântica. Evitar imagens muito formais.',
    fases: [
      { id:1, nome:'Teaser', dataInicio:'2026-06-01', dataFim:'2026-06-05', orcamento:900, objetivo:'Despertar curiosidade', status:'Planejamento' },
      { id:2, nome:'Ativação', dataInicio:'2026-06-06', dataFim:'2026-06-12', orcamento:2700, objetivo:'Gerar reservas', status:'Planejamento' },
      { id:3, nome:'Urgência', dataInicio:'2026-06-13', dataFim:'2026-06-15', orcamento:900, objetivo:'Últimas vagas', status:'Planejamento' },
    ],
    criativos: [
      { id:1, formato:'Feed', plataforma:'Instagram', status:'Em Produção', descricao:'Casal em mesa romântica com menu especial', copy:'Surpreenda quem você ama 🍷 Reserve sua mesa especial para o Dia dos Namorados' },
      { id:2, formato:'Story', plataforma:'Instagram', status:'Briefado', descricao:'Video curto do ambiente com música suave', copy:'Vagas limitadas! Reserve já ❤️' },
      { id:3, formato:'Banner', plataforma:'Google Ads', status:'Aprovado', descricao:'Banner display com oferta e foto do prato', copy:'Jantar romântico completo — Reserve agora' },
    ],
    criado: '2026-05-28',
  },
]

const emptyFase = (): Fase => ({ id: Date.now(), nome: '', dataInicio: '', dataFim: '', orcamento: 0, objetivo: '', status: 'Planejamento' })
const emptyCriativo = (): Criativo => ({ id: Date.now(), formato: 'Feed', plataforma: 'Instagram', status: 'Briefado', descricao: '', copy: '' })
const emptyForm = (): Omit<Campanha, 'id' | 'criado'> => ({
  nome: '', cliente: '', tipo: 'Lançamento', status: 'Briefing', objetivo: 'Leads',
  mensagemChave: '', publicoAlvo: '', faixaEtaria: '25-45', localizacao: '',
  interesses: [], dataInicio: '', dataFim: '',
  orcamentoTotal: 0,
  orcPlataformas: [
    { plataforma: 'Meta Ads', valor: 0, percentual: 50 },
    { plataforma: 'Google Ads', valor: 0, percentual: 25 },
    { plataforma: 'TikTok Ads', valor: 0, percentual: 15 },
    { plataforma: 'iFood Ads', valor: 0, percentual: 10 },
  ],
  metaImpressoes: 0, metaCliques: 0, metaConversoes: 0, metaROAS: 3,
  impressoes: 0, cliques: 0, conversoes: 0, gastoReal: 0,
  diferenciais: [''], concorrentes: [''], observacoes: '',
  fases: [], criativos: [],
})

// ─── Utils ────────────────────────────────────────────────────────────────────

function fmtMoeda(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }) }
function fmtNum(v: number)   { return v.toLocaleString('pt-BR') }
function fmtDate(d: string)  { if (!d) return '—'; const [y,m,day]=d.split('-'); return `${day}/${m}/${y}` }
function ctr(imp: number, clk: number) { return imp > 0 ? ((clk/imp)*100).toFixed(2) : '0' }
function roas(gasto: number, conv: number) { return gasto > 0 && conv > 0 ? (conv/gasto).toFixed(1) : '0' }
function pctBudget(gasto: number, orc: number) { return orc > 0 ? Math.min(100, Math.round((gasto/orc)*100)) : 0 }
function daysLeft(fim: string) {
  if (!fim) return null
  const d = Math.ceil((new Date(fim).getTime()-Date.now())/86400000)
  return d
}

// ─── Sub components ───────────────────────────────────────────────────────────

function StatusPill({ s }: { s: CampStatus }) {
  const c = STATUS_CFG[s]
  return <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 9px', borderRadius:20, fontSize:10, fontWeight:700, background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>{c.icon} {s}</span>
}

function MetricBox({ label, val, sub, color }: { label: string; val: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background:'var(--bk3)', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
      <div style={{ fontSize:11, color:'var(--gr3)', marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:900, color: color ?? 'var(--wh)' }}>{val}</div>
      {sub && <div style={{ fontSize:9, color:'var(--gr3)', marginTop:1 }}>{sub}</div>}
    </div>
  )
}

function ProgressBar({ pct, color }: { pct: number; color?: string }) {
  return (
    <div style={{ height:5, background:'var(--bk4)', borderRadius:5, overflow:'hidden' }}>
      <div style={{ width:`${pct}%`, height:'100%', borderRadius:5, background: color ?? 'var(--al)', transition:'width .4s ease' }} />
    </div>
  )
}

// ─── Card Campaign ────────────────────────────────────────────────────────────

function CampCard({ camp, onClick }: { camp: Campanha; onClick: () => void }) {
  const pct   = pctBudget(camp.gastoReal, camp.orcamentoTotal)
  const dl    = daysLeft(camp.dataFim)
  const convP = camp.metaConversoes > 0 ? Math.round((camp.conversoes / camp.metaConversoes) * 100) : 0
  const cfg   = STATUS_CFG[camp.status]

  return (
    <div onClick={onClick} style={{
      background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:14,
      padding:16, cursor:'pointer', transition:'border-color .15s',
      borderTop:`3px solid ${cfg.color}`,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--wh)', marginBottom:3, lineHeight:1.3 }}>{camp.nome}</div>
          <div style={{ fontSize:10, color:'var(--gr3)' }}>{camp.cliente}</div>
        </div>
        <StatusPill s={camp.status} />
      </div>

      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
        <span style={{ fontSize:9, padding:'2px 7px', borderRadius:10, background:'var(--bk4)', border:'1px solid var(--gr)', color:'var(--gr3)' }}>🎯 {camp.objetivo}</span>
        <span style={{ fontSize:9, padding:'2px 7px', borderRadius:10, background:'var(--bk4)', border:'1px solid var(--gr)', color:'var(--gr3)' }}>📦 {camp.tipo}</span>
        {dl !== null && (
          <span style={{ fontSize:9, padding:'2px 7px', borderRadius:10, background: dl < 0 ? 'rgba(239,68,68,.1)' : dl < 3 ? 'rgba(245,158,11,.1)' : 'var(--bk4)', border:'1px solid var(--gr)', color: dl < 0 ? '#EF4444' : dl < 3 ? '#F59E0B' : 'var(--gr3)' }}>
            {dl < 0 ? `⚠️ ${Math.abs(dl)}d atrás` : dl === 0 ? '🔴 Hoje' : `📅 ${dl}d restantes`}
          </span>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
        <div>
          <div style={{ fontSize:9, color:'var(--gr3)', marginBottom:3 }}>Orçamento</div>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--wh)' }}>{fmtMoeda(camp.orcamentoTotal)}</div>
        </div>
        <div>
          <div style={{ fontSize:9, color:'var(--gr3)', marginBottom:3 }}>Gasto ({pct}%)</div>
          <div style={{ fontSize:13, fontWeight:700, color: pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : 'var(--al)' }}>{fmtMoeda(camp.gastoReal)}</div>
        </div>
      </div>

      <ProgressBar pct={pct} color={pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : 'var(--al)'} />

      {camp.metaConversoes > 0 && (
        <div style={{ marginTop:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
            <span style={{ fontSize:9, color:'var(--gr3)' }}>Meta Conversões</span>
            <span style={{ fontSize:9, fontWeight:700, color: convP >= 100 ? 'var(--ok)' : 'var(--gr3)' }}>{camp.conversoes}/{camp.metaConversoes} ({convP}%)</span>
          </div>
          <ProgressBar pct={convP} color={convP >= 100 ? 'var(--ok)' : 'var(--pu)'} />
        </div>
      )}

      <div style={{ display:'flex', gap:5, marginTop:10, flexWrap:'wrap' }}>
        {camp.orcPlataformas.slice(0,3).map(p => (
          <span key={p.plataforma} style={{ fontSize:8, padding:'1px 6px', borderRadius:10, background:'var(--bk4)', border:'1px solid var(--gr)', color:'var(--gr3)' }}>
            {p.plataforma.replace(' Ads','').replace(' Orgânico','')} {p.percentual}%
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Campaign Detail ──────────────────────────────────────────────────────────

function CampDetail({ camp, onEdit, onClose, onDelete }: { camp: Campanha; onEdit: () => void; onClose: () => void; onDelete: () => void }) {
  const [tab, setTab] = useState<'overview'|'briefing'|'orcamento'|'fases'|'criativos'>('overview')
  const ctrVal    = ctr(camp.impressoes, camp.cliques)
  const roasVal   = roas(camp.gastoReal, camp.conversoes * 50) // estimativa ticket médio
  const pct       = pctBudget(camp.gastoReal, camp.orcamentoTotal)
  const convPct   = camp.metaConversoes > 0 ? Math.min(100, Math.round(camp.conversoes / camp.metaConversoes * 100)) : 0

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'20px 28px 0', borderBottom:'1px solid var(--gr)', background:'var(--bk2)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:14 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
              <StatusPill s={camp.status} />
              <span style={{ fontSize:9, padding:'2px 7px', borderRadius:10, background:'var(--bk3)', border:'1px solid var(--gr)', color:'var(--gr3)' }}>🎯 {camp.objetivo}</span>
              <span style={{ fontSize:9, padding:'2px 7px', borderRadius:10, background:'var(--bk3)', border:'1px solid var(--gr)', color:'var(--gr3)' }}>📦 {camp.tipo}</span>
            </div>
            <div style={{ fontSize:20, fontWeight:900, color:'var(--wh)' }}>{camp.nome}</div>
            <div style={{ fontSize:11, color:'var(--gr3)', marginTop:3 }}>🏢 {camp.cliente} · 📅 {fmtDate(camp.dataInicio)} — {fmtDate(camp.dataFim)}</div>
          </div>
          <div style={{ display:'flex', gap:8, flexShrink:0 }}>
            <button className="btn" style={{ padding:'7px 14px', fontSize:11 }} onClick={onEdit}>✏️ Editar</button>
            <button className="btn" style={{ padding:'7px 14px', fontSize:11, color:'var(--er)' }} onClick={onDelete}>🗑️</button>
            <button className="btn" style={{ padding:'7px 14px', fontSize:11 }} onClick={onClose}>✕ Fechar</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0 }}>
          {([
            { id:'overview',  label:'📊 Overview' },
            { id:'briefing',  label:'📋 Briefing' },
            { id:'orcamento', label:'💰 Orçamento' },
            { id:'fases',     label:'📅 Fases' },
            { id:'criativos', label:'🎨 Criativos' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'8px 16px', borderRadius:'8px 8px 0 0', border:'none', cursor:'pointer',
              fontSize:11, fontWeight:700,
              background: tab===t.id ? 'var(--bk)' : 'transparent',
              color: tab===t.id ? 'var(--al)' : 'var(--gr3)',
              borderBottom: tab===t.id ? '2px solid var(--al)' : '2px solid transparent',
              transition:'all .15s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 28px' }}>

        {/* ── OVERVIEW ── */}
        {tab==='overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* KPIs principais */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              <MetricBox label="Orçamento Total" val={fmtMoeda(camp.orcamentoTotal)} sub={`Gasto: ${fmtMoeda(camp.gastoReal)}`} />
              <MetricBox label="Impressões" val={fmtNum(camp.impressoes)} sub={`Meta: ${fmtNum(camp.metaImpressoes)}`} color="var(--bl)" />
              <MetricBox label="Cliques (CTR)" val={fmtNum(camp.cliques)} sub={`CTR: ${ctrVal}%`} color="var(--pu)" />
              <MetricBox label="Conversões" val={camp.conversoes} sub={`Meta: ${camp.metaConversoes} (${convPct}%)`} color="var(--ok)" />
            </div>

            {/* Budget progress */}
            <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--lgt)' }}>💰 Uso do Orçamento</span>
                <span style={{ fontSize:11, fontWeight:700, color: pct>90?'#EF4444':pct>70?'#F59E0B':'var(--ok)' }}>{pct}% — {fmtMoeda(camp.gastoReal)} / {fmtMoeda(camp.orcamentoTotal)}</span>
              </div>
              <ProgressBar pct={pct} color={pct>90?'#EF4444':pct>70?'#F59E0B':'var(--al)'} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:12 }}>
                {camp.orcPlataformas.map(p => (
                  <div key={p.plataforma} style={{ background:'var(--bk3)', borderRadius:8, padding:'8px 10px' }}>
                    <div style={{ fontSize:9, color:'var(--gr3)', marginBottom:3 }}>{p.plataforma}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--wh)' }}>{fmtMoeda(p.valor)}</div>
                    <div style={{ fontSize:9, color:'var(--al)' }}>{p.percentual}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metas vs Real */}
            <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--lgt)', marginBottom:12 }}>🎯 Metas vs Resultados</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { label:'Impressões', meta:camp.metaImpressoes, real:camp.impressoes },
                  { label:'Cliques',    meta:camp.metaCliques,    real:camp.cliques    },
                  { label:'Conversões', meta:camp.metaConversoes, real:camp.conversoes },
                ].map(m => {
                  const p = m.meta > 0 ? Math.min(100, Math.round(m.real/m.meta*100)) : 0
                  return (
                    <div key={m.label}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:10, color:'var(--lgt)' }}>{m.label}</span>
                        <span style={{ fontSize:10, color: p>=100?'var(--ok)':p>=50?'var(--wr)':'var(--gr3)' }}>
                          {fmtNum(m.real)} / {fmtNum(m.meta)} ({p}%)
                        </span>
                      </div>
                      <ProgressBar pct={p} color={p>=100?'var(--ok)':p>=50?'var(--wr)':'var(--er)'} />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Plataformas */}
            <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--lgt)', marginBottom:10 }}>📱 Plataformas Ativas</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {camp.orcPlataformas.map(p => (
                  <div key={p.plataforma} style={{
                    padding:'8px 14px', borderRadius:10, background:'var(--bk3)', border:'1px solid var(--gr)',
                    display:'flex', alignItems:'center', gap:8,
                  }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--wh)' }}>{p.plataforma}</div>
                    <div style={{ fontSize:10, color:'var(--al)' }}>{fmtMoeda(p.valor)} ({p.percentual}%)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BRIEFING ── */}
        {tab==='briefing' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--al)', marginBottom:8 }}>💬 Mensagem-Chave</div>
              <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.6, fontStyle:'italic' }}>
                "{camp.mensagemChave || '—'}"
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--gr3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.1em' }}>👥 Público-Alvo</div>
                <div style={{ fontSize:12, color:'var(--lgt)', lineHeight:1.6 }}>{camp.publicoAlvo || '—'}</div>
                <div style={{ marginTop:8, fontSize:10, color:'var(--gr3)' }}>Faixa: {camp.faixaEtaria} anos · {camp.localizacao}</div>
                {camp.interesses.length > 0 && (
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:8 }}>
                    {camp.interesses.map(i => <span key={i} style={{ fontSize:9, padding:'2px 7px', borderRadius:10, background:'var(--bk4)', border:'1px solid var(--gr)', color:'var(--gr3)' }}>#{i}</span>)}
                  </div>
                )}
              </div>
              <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--gr3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.1em' }}>⭐ Diferenciais</div>
                {camp.diferenciais.filter(Boolean).map((d,i) => (
                  <div key={i} style={{ display:'flex', gap:6, marginBottom:5, fontSize:12, color:'var(--lgt)' }}>
                    <span style={{ color:'var(--ok)' }}>✓</span>{d}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--gr3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.1em' }}>⚔️ Concorrentes</div>
                {camp.concorrentes.filter(Boolean).map((c,i) => <div key={i} style={{ fontSize:12, color:'var(--lgt)', marginBottom:5 }}>• {c}</div>)}
              </div>
              <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--gr3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.1em' }}>📝 Observações</div>
                <div style={{ fontSize:12, color:'var(--lgt)', lineHeight:1.6 }}>{camp.observacoes || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── ORÇAMENTO ── */}
        {tab==='orcamento' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              <MetricBox label="Orçamento Total" val={fmtMoeda(camp.orcamentoTotal)} color="var(--wh)" />
              <MetricBox label="Gasto Real" val={fmtMoeda(camp.gastoReal)} sub={`${pct}% do orçamento`} color={pct>90?'#EF4444':'var(--al)'} />
              <MetricBox label="Saldo Disponível" val={fmtMoeda(camp.orcamentoTotal - camp.gastoReal)} color="var(--ok)" />
            </div>
            <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--lgt)', marginBottom:14 }}>📊 Distribuição por Plataforma</div>
              {camp.orcPlataformas.map(p => (
                <div key={p.plataforma} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'var(--lgt)' }}>{p.plataforma}</span>
                    <div style={{ display:'flex', gap:12 }}>
                      <span style={{ fontSize:11, color:'var(--al)' }}>{p.percentual}%</span>
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--wh)', fontFamily:'var(--mono)' }}>{fmtMoeda(p.valor)}</span>
                    </div>
                  </div>
                  <ProgressBar pct={p.percentual * 2} color="var(--al)" />
                </div>
              ))}
            </div>
            <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--lgt)', marginBottom:10 }}>🎯 KPIs de Performance</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                <MetricBox label="Meta ROAS" val={`${camp.metaROAS}x`} color="var(--pu)" />
                <MetricBox label="Meta Impressões" val={fmtNum(camp.metaImpressoes)} />
                <MetricBox label="Meta Cliques" val={fmtNum(camp.metaCliques)} />
                <MetricBox label="Meta Conversões" val={fmtNum(camp.metaConversoes)} />
              </div>
            </div>
          </div>
        )}

        {/* ── FASES ── */}
        {tab==='fases' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {camp.fases.length === 0 && (
              <div style={{ textAlign:'center', padding:40, color:'var(--gr3)' }}>Nenhuma fase cadastrada</div>
            )}
            {camp.fases.map((f,i) => {
              const dl = daysLeft(f.dataFim)
              return (
                <div key={f.id} style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16, borderLeft:`4px solid var(--al)` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:24, height:24, borderRadius:8, background:'var(--alb)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--al)' }}>{i+1}</div>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--wh)' }}>{f.nome}</span>
                    </div>
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'rgba(34,197,94,.1)', color:'var(--ok)', border:'1px solid rgba(34,197,94,.2)' }}>{f.status}</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--gr3)', marginBottom:10, lineHeight:1.5 }}>{f.objetivo}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    <div style={{ background:'var(--bk3)', borderRadius:8, padding:'8px 10px' }}>
                      <div style={{ fontSize:9, color:'var(--gr3)' }}>Início</div>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--lgt)', fontFamily:'var(--mono)' }}>{fmtDate(f.dataInicio)}</div>
                    </div>
                    <div style={{ background:'var(--bk3)', borderRadius:8, padding:'8px 10px' }}>
                      <div style={{ fontSize:9, color:'var(--gr3)' }}>Fim</div>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--lgt)', fontFamily:'var(--mono)' }}>{fmtDate(f.dataFim)}</div>
                    </div>
                    <div style={{ background:'var(--bk3)', borderRadius:8, padding:'8px 10px' }}>
                      <div style={{ fontSize:9, color:'var(--gr3)' }}>Orçamento</div>
                      <div style={{ fontSize:12, fontWeight:700, color:'var(--al)' }}>{fmtMoeda(f.orcamento)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── CRIATIVOS ── */}
        {tab==='criativos' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {camp.criativos.length === 0 && (
              <div style={{ textAlign:'center', padding:40, color:'var(--gr3)' }}>Nenhum criativo cadastrado</div>
            )}
            {camp.criativos.map(c => {
              const sColors: Record<string, string> = { 'Briefado':'#8892B0','Em Produção':'#F59E0B','Em Revisão':'#3B82F6','Aprovado':'#8B5CF6','Publicado':'#22C55E' }
              const sColor = sColors[c.status] || '#8892B0'
              return (
                <div key={c.id} style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:14, display:'flex', gap:14 }}>
                  <div style={{ width:60, height:60, borderRadius:10, background:`${sColor}15`, border:`1px solid ${sColor}30`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <div style={{ fontSize:18 }}>{c.formato==='Story'?'📱':c.formato==='Reels'?'🎬':c.formato==='Vídeo 15s'||c.formato==='Vídeo 30s'?'📺':'🖼️'}</div>
                    <div style={{ fontSize:8, color:sColor, fontWeight:700, marginTop:2 }}>{c.formato}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <span style={{ fontSize:10, padding:'2px 7px', borderRadius:10, background:`${sColor}15`, color:sColor, fontWeight:700 }}>{c.status}</span>
                        <span style={{ fontSize:10, padding:'2px 7px', borderRadius:10, background:'var(--bk3)', border:'1px solid var(--gr)', color:'var(--gr3)' }}>{c.plataforma}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:'var(--lgt)', marginBottom:6 }}>{c.descricao}</div>
                    {c.copy && (
                      <div style={{ fontSize:11, color:'var(--gr3)', fontStyle:'italic', background:'var(--bk3)', borderRadius:8, padding:'6px 10px' }}>
                        "{c.copy}"
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Wizard form ──────────────────────────────────────────────────────────────

function CampWizard({ initial, onSave, onClose }: {
  initial: Omit<Campanha, 'id'|'criado'>
  onSave: (c: Omit<Campanha, 'id'|'criado'>) => void
  onClose: () => void
}) {
  const [step, setStep]     = useState<WizardStep>(1)
  const [form, setForm]     = useState(initial)
  const [newInt, setNewInt]  = useState('')
  const [newDif, setNewDif]  = useState('')
  const [newConc, setNewConc] = useState('')

  function upd<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(f => ({ ...f, [k]: v })) }

  // Distribui orçamento automaticamente ao digitar total
  function updOrc(total: number) {
    const plats = form.orcPlataformas.map(p => ({ ...p, valor: Math.round(total * p.percentual / 100) }))
    setForm(f => ({ ...f, orcamentoTotal: total, orcPlataformas: plats }))
  }
  function updPlatPct(idx: number, pct: number) {
    const plats = form.orcPlataformas.map((p,i) => i===idx ? { ...p, percentual:pct, valor: Math.round(form.orcamentoTotal*pct/100) } : p)
    setForm(f => ({ ...f, orcPlataformas: plats }))
  }
  function addFasePadrao() {
    const novas = FASES_PADRAO.map((fp, i) => ({
      id: Date.now()+i, nome: fp.nome, dataInicio: form.dataInicio,
      dataFim: form.dataFim, orcamento: Math.round(form.orcamentoTotal / FASES_PADRAO.length),
      objetivo: fp.objetivo, status: 'Planejamento',
    }))
    setForm(f => ({ ...f, fases: novas }))
  }
  function addCriativo() { setForm(f => ({ ...f, criativos: [...f.criativos, emptyCriativo()] })) }
  function updCriativo(idx: number, key: keyof Criativo, val: string) {
    setForm(f => ({ ...f, criativos: f.criativos.map((c,i) => i===idx ? { ...c, [key]: val } : c) }))
  }
  function rmCriativo(idx: number) { setForm(f => ({ ...f, criativos: f.criativos.filter((_,i) => i!==idx) })) }
  function updFase(idx: number, key: keyof Fase, val: string | number) {
    setForm(f => ({ ...f, fases: f.fases.map((fa,i) => i===idx ? { ...fa, [key]: val } : fa) }))
  }
  function rmFase(idx: number) { setForm(f => ({ ...f, fases: f.fases.filter((_,i) => i!==idx) })) }

  const STEPS = [
    { n:1 as WizardStep, label:'Básico'    },
    { n:2 as WizardStep, label:'Público'   },
    { n:3 as WizardStep, label:'Orçamento' },
    { n:4 as WizardStep, label:'Fases'     },
    { n:5 as WizardStep, label:'Criativos' },
    { n:6 as WizardStep, label:'Revisão'   },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--gr)', background:'var(--bk2)', flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:16, fontWeight:800, color:'var(--wh)' }}>
            {form.id ? '✏️ Editar Campanha' : '🆕 Nova Campanha'}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--gr3)', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>
        {/* Step indicator */}
        <div style={{ display:'flex', gap:4 }}>
          {STEPS.map(s => (
            <button key={s.n} onClick={() => setStep(s.n)} style={{
              flex:1, padding:'6px 4px', borderRadius:8, fontSize:9, fontWeight:700, cursor:'pointer',
              border:'none',
              background: step===s.n ? 'var(--al)' : step>s.n ? 'rgba(0,196,180,.15)' : 'var(--bk3)',
              color: step===s.n ? '#fff' : step>s.n ? 'var(--al)' : 'var(--gr3)',
            }}>{step>s.n ? '✓' : s.n} {s.label}</button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>

        {/* STEP 1: Básico */}
        {step===1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="field"><label>Nome da Campanha *</label>
              <input className="inp" value={form.nome} onChange={e => upd('nome',e.target.value)} placeholder="Ex: Campanha Dia dos Namorados 2026" autoFocus />
            </div>
            <div className="modal-grid">
              <div className="field"><label>Cliente *</label>
                <input className="inp" value={form.cliente} onChange={e => upd('cliente',e.target.value)} placeholder="Nome do cliente" />
              </div>
              <div className="field"><label>Tipo de Campanha</label>
                <select className="inp" value={form.tipo} onChange={e => upd('tipo',e.target.value)}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field"><label>Objetivo Principal</label>
                <select className="inp" value={form.objetivo} onChange={e => upd('objetivo',e.target.value)}>
                  {OBJETIVOS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="field"><label>Status</label>
                <select className="inp" value={form.status} onChange={e => upd('status',e.target.value as CampStatus)}>
                  {Object.keys(STATUS_CFG).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field"><label>Data de Início</label>
                <input className="inp" type="date" value={form.dataInicio} onChange={e => upd('dataInicio',e.target.value)} />
              </div>
              <div className="field"><label>Data de Fim</label>
                <input className="inp" type="date" value={form.dataFim} onChange={e => upd('dataFim',e.target.value)} />
              </div>
            </div>
            <div className="field"><label>Mensagem-Chave da Campanha</label>
              <textarea className="inp" rows={2} value={form.mensagemChave} onChange={e => upd('mensagemChave',e.target.value)}
                placeholder="A proposta principal da campanha em 1-2 frases..." style={{ resize:'vertical' }} />
            </div>
          </div>
        )}

        {/* STEP 2: Público */}
        {step===2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="field"><label>Descrição do Público-Alvo</label>
              <textarea className="inp" rows={3} value={form.publicoAlvo} onChange={e => upd('publicoAlvo',e.target.value)}
                placeholder="Ex: Mulheres de 30-45 anos, AB, interessadas em gastronomia, que moram no raio de 5km do restaurante..." style={{ resize:'vertical' }} />
            </div>
            <div className="modal-grid">
              <div className="field"><label>Faixa Etária</label>
                <input className="inp" value={form.faixaEtaria} onChange={e => upd('faixaEtaria',e.target.value)} placeholder="Ex: 25-45" />
              </div>
              <div className="field"><label>Localização</label>
                <input className="inp" value={form.localizacao} onChange={e => upd('localizacao',e.target.value)} placeholder="Ex: São Paulo — raio 8km" />
              </div>
            </div>
            <div className="field">
              <label>Interesses / Comportamentos</label>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
                {form.interesses.map(i => (
                  <span key={i} style={{ fontSize:10, padding:'3px 8px', borderRadius:10, background:'var(--bk3)', border:'1px solid var(--gr)', color:'var(--gr3)', display:'flex', alignItems:'center', gap:4 }}>
                    #{i} <button onClick={() => upd('interesses',form.interesses.filter(x=>x!==i))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--er)',fontSize:10,padding:0 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <input className="inp" value={newInt} onChange={e => setNewInt(e.target.value)}
                  onKeyDown={e => { if(e.key==='Enter'&&newInt.trim()){ e.preventDefault(); upd('interesses',[...form.interesses,newInt.trim()]); setNewInt('') }}}
                  placeholder="gastronomia, delivery, comida japonesa..." style={{ flex:1, fontSize:11 }} />
                <button className="btn btn-ghost" style={{ fontSize:10,padding:'6px 12px' }}
                  onClick={() => { if(newInt.trim()){ upd('interesses',[...form.interesses,newInt.trim()]); setNewInt('') }}}>+ Add</button>
              </div>
            </div>
            <div className="field">
              <label>Diferenciais do Produto/Serviço</label>
              {form.diferenciais.map((d,i) => (
                <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                  <input className="inp" value={d} onChange={e => upd('diferenciais',form.diferenciais.map((x,j)=>j===i?e.target.value:x))}
                    placeholder={`Diferencial ${i+1}`} style={{ flex:1,fontSize:11 }} />
                  {i>0&&<button onClick={() => upd('diferenciais',form.diferenciais.filter((_,j)=>j!==i))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--er)',fontSize:14,padding:'0 6px' }}>×</button>}
                </div>
              ))}
              <button className="btn btn-ghost" style={{ fontSize:10,padding:'5px 12px',marginTop:4 }}
                onClick={() => upd('diferenciais',[...form.diferenciais,''])}>+ Adicionar diferencial</button>
            </div>
            <div className="modal-grid">
              <div className="field">
                <label>Concorrentes Principais</label>
                {form.concorrentes.map((c,i) => (
                  <div key={i} style={{ display:'flex', gap:6, marginBottom:6 }}>
                    <input className="inp" value={c} onChange={e => upd('concorrentes',form.concorrentes.map((x,j)=>j===i?e.target.value:x))}
                      placeholder={`Concorrente ${i+1}`} style={{ flex:1,fontSize:11 }} />
                    {i>0&&<button onClick={() => upd('concorrentes',form.concorrentes.filter((_,j)=>j!==i))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--er)',fontSize:14,padding:'0 6px' }}>×</button>}
                  </div>
                ))}
                <button className="btn btn-ghost" style={{ fontSize:10,padding:'5px 12px',marginTop:4 }}
                  onClick={() => upd('concorrentes',[...form.concorrentes,''])}>+ Adicionar</button>
              </div>
              <div className="field">
                <label>Observações Gerais</label>
                <textarea className="inp" rows={5} value={form.observacoes} onChange={e => upd('observacoes',e.target.value)}
                  placeholder="Notas, restrições, tom de voz, referências visuais..." style={{ resize:'vertical' }} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Orçamento */}
        {step===3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="field"><label>Orçamento Total (R$)</label>
              <input className="inp" type="number" value={form.orcamentoTotal || ''}
                onChange={e => updOrc(Number(e.target.value))}
                placeholder="0,00" style={{ fontSize:18, fontWeight:700 }} />
            </div>
            <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--lgt)', marginBottom:12 }}>📊 Distribuição por Plataforma</div>
              {form.orcPlataformas.map((p,i) => (
                <div key={p.plataforma} style={{ marginBottom:14, display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:130, fontSize:11, color:'var(--lgt)', fontWeight:600, flexShrink:0 }}>{p.plataforma}</div>
                  <input type="range" min={0} max={100} value={p.percentual}
                    onChange={e => updPlatPct(i,Number(e.target.value))}
                    style={{ flex:1, accentColor:'var(--al)' }} />
                  <div style={{ width:40, textAlign:'right', fontSize:11, fontWeight:700, color:'var(--al)' }}>{p.percentual}%</div>
                  <div style={{ width:80, textAlign:'right', fontSize:11, fontFamily:'var(--mono)', color:'var(--wh)' }}>{fmtMoeda(p.valor)}</div>
                </div>
              ))}
              <div style={{ borderTop:'1px solid var(--gr)', paddingTop:10, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:11, color:'var(--gr3)' }}>Total distribuído</span>
                <span style={{ fontSize:13, fontWeight:700, color:'var(--wh)' }}>{fmtMoeda(form.orcPlataformas.reduce((s,p)=>s+p.valor,0))}</span>
              </div>
            </div>
            <div style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--lgt)', marginBottom:12 }}>🎯 Metas KPI</div>
              <div className="modal-grid">
                <div className="field"><label>Meta Impressões</label>
                  <input className="inp" type="number" value={form.metaImpressoes||''} onChange={e => upd('metaImpressoes',Number(e.target.value))} />
                </div>
                <div className="field"><label>Meta Cliques</label>
                  <input className="inp" type="number" value={form.metaCliques||''} onChange={e => upd('metaCliques',Number(e.target.value))} />
                </div>
                <div className="field"><label>Meta Conversões</label>
                  <input className="inp" type="number" value={form.metaConversoes||''} onChange={e => upd('metaConversoes',Number(e.target.value))} />
                </div>
                <div className="field"><label>Meta ROAS</label>
                  <input className="inp" type="number" step="0.1" value={form.metaROAS||''} onChange={e => upd('metaROAS',Number(e.target.value))} placeholder="3.0" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Fases */}
        {step===4 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {form.fases.length===0 && (
              <div style={{ textAlign:'center', padding:'30px 20px', background:'var(--bk2)', border:'1px dashed var(--gr)', borderRadius:12 }}>
                <div style={{ fontSize:12, color:'var(--gr3)', marginBottom:12 }}>Estruture as fases da campanha (Awareness → Conversão)</div>
                <button className="btn btn-al" style={{ fontSize:11 }} onClick={addFasePadrao}>⚡ Gerar Fases Padrão</button>
              </div>
            )}
            {form.fases.map((f,i) => (
              <div key={f.id} style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:24, height:24, borderRadius:8, background:'var(--alb)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--al)' }}>{i+1}</div>
                    <input className="inp" value={f.nome} onChange={e => updFase(i,'nome',e.target.value)}
                      placeholder="Nome da fase" style={{ fontWeight:700, fontSize:13, width:200 }} />
                  </div>
                  <button onClick={() => rmFase(i)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--er)',fontSize:14 }}>🗑️</button>
                </div>
                <div className="modal-grid">
                  <div className="field"><label>Início</label>
                    <input className="inp" type="date" value={f.dataInicio} onChange={e => updFase(i,'dataInicio',e.target.value)} />
                  </div>
                  <div className="field"><label>Fim</label>
                    <input className="inp" type="date" value={f.dataFim} onChange={e => updFase(i,'dataFim',e.target.value)} />
                  </div>
                  <div className="field"><label>Orçamento (R$)</label>
                    <input className="inp" type="number" value={f.orcamento||''} onChange={e => updFase(i,'orcamento',Number(e.target.value))} />
                  </div>
                  <div className="field"><label>Status</label>
                    <select className="inp" value={f.status} onChange={e => updFase(i,'status',e.target.value)}>
                      {['Planejamento','Produção','Ativa','Concluída'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="field" style={{ gridColumn:'1/-1' }}><label>Objetivo da fase</label>
                    <input className="inp" value={f.objetivo} onChange={e => updFase(i,'objetivo',e.target.value)} placeholder="O que esta fase deve alcançar?" />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" style={{ fontSize:11 }}
              onClick={() => setForm(f => ({ ...f, fases:[...f.fases,emptyFase()] }))}>+ Adicionar Fase</button>
          </div>
        )}

        {/* STEP 5: Criativos */}
        {step===5 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {form.criativos.map((c,i) => (
              <div key={c.id} style={{ background:'var(--bk2)', border:'1px solid var(--gr)', borderRadius:12, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--wh)' }}>Criativo #{i+1}</span>
                  <button onClick={() => rmCriativo(i)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--er)',fontSize:14 }}>🗑️</button>
                </div>
                <div className="modal-grid">
                  <div className="field"><label>Formato</label>
                    <select className="inp" value={c.formato} onChange={e => updCriativo(i,'formato',e.target.value)}>
                      {FORMATOS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Plataforma</label>
                    <select className="inp" value={c.plataforma} onChange={e => updCriativo(i,'plataforma',e.target.value)}>
                      {PLATAFORMAS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Status</label>
                    <select className="inp" value={c.status} onChange={e => updCriativo(i,'status',e.target.value)}>
                      {CRIATIVO_STATUS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field"><label>Descrição do Criativo</label>
                  <textarea className="inp" rows={2} value={c.descricao} onChange={e => updCriativo(i,'descricao',e.target.value)}
                    placeholder="Descreva o visual: imagem, vídeo, composição..." style={{ resize:'vertical' }} />
                </div>
                <div className="field"><label>Copy / Texto do Anúncio</label>
                  <textarea className="inp" rows={2} value={c.copy} onChange={e => updCriativo(i,'copy',e.target.value)}
                    placeholder="Headline, descrição, CTA..." style={{ resize:'vertical' }} />
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={addCriativo}>+ Adicionar Criativo</button>
          </div>
        )}

        {/* STEP 6: Revisão */}
        {step===6 && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'rgba(0,196,180,.08)', border:'1px solid rgba(0,196,180,.2)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--al)', marginBottom:12 }}>✅ Revisão Final</div>
              {[
                { label:'Campanha', val:form.nome || '—' },
                { label:'Cliente',  val:form.cliente || '—' },
                { label:'Objetivo', val:form.objetivo },
                { label:'Período',  val:`${fmtDate(form.dataInicio)} → ${fmtDate(form.dataFim)}` },
                { label:'Orçamento',val:fmtMoeda(form.orcamentoTotal) },
                { label:'Plataformas', val:form.orcPlataformas.map(p=>p.plataforma).join(', ') },
                { label:'Fases',    val:`${form.fases.length} fases` },
                { label:'Criativos',val:`${form.criativos.length} criativos` },
              ].map(r => (
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--bk4)' }}>
                  <span style={{ fontSize:11, color:'var(--gr3)' }}>{r.label}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:'var(--lgt)' }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:'14px 24px', borderTop:'1px solid var(--gr)', display:'flex', gap:8, background:'var(--bk2)', flexShrink:0 }}>
        {step>1 && <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={() => setStep(s => (s-1) as WizardStep)}>‹ Anterior</button>}
        <div style={{ flex:1 }} />
        {step<6
          ? <button className="btn btn-al" style={{ fontSize:11 }} onClick={() => setStep(s => (s+1) as WizardStep)}>Próximo ›</button>
          : <button className="btn btn-al" style={{ fontSize:12, padding:'9px 20px' }} onClick={() => onSave(form)}>💾 Salvar Campanha</button>
        }
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlanejamentoPage() {
  const [camps, setCamps]       = useState<Campanha[]>([])
  const [loaded, setLoaded]     = useState(false)
  const [mode, setMode]         = useState<'lista' | 'wizard' | 'detail'>('lista')
  const [detail, setDetail]     = useState<Campanha | null>(null)
  const [editForm, setEditForm] = useState<Omit<Campanha,'id'|'criado'> | null>(null)
  const [editId, setEditId]     = useState<number | null>(null)
  const [confirmDel, setConfirmDel] = useState<number | null>(null)
  const [filterStatus, setFS]   = useState<CampStatus | 'Todas'>('Todas')
  const [search, setSearch]     = useState('')
  const [toast, setToast]       = useState('')

  useEffect(() => {
    try { setCamps(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') ?? INICIAL) }
    catch { setCamps(INICIAL) }
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(camps)) }, [camps, loaded])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function saveCamp(form: Omit<Campanha,'id'|'criado'>) {
    const now = new Date().toISOString().split('T')[0]
    if (editId !== null) {
      const updated = camps.map(c => c.id===editId ? { ...form, id:editId, criado:c.criado } : c)
      setCamps(updated)
      showToast('✅ Campanha atualizada!')
    } else {
      const novo = { ...form, id: Date.now(), criado: now }
      setCamps(cs => [...cs, novo])
      showToast('✅ Campanha criada!')
    }
    setMode('lista'); setEditForm(null); setEditId(null)
  }

  function deleteConfirmed() {
    if (confirmDel===null) return
    setCamps(cs => cs.filter(c => c.id!==confirmDel))
    setConfirmDel(null); setMode('lista'); setDetail(null)
    showToast('🗑️ Campanha excluída')
  }

  const filtered = camps.filter(c => {
    const m = filterStatus==='Todas' || c.status===filterStatus
    const s = !search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.cliente.toLowerCase().includes(search.toLowerCase())
    return m && s
  })

  const totalOrc  = camps.reduce((s,c) => s+c.orcamentoTotal, 0)
  const totalGast = camps.reduce((s,c) => s+c.gastoReal, 0)
  const ativas    = camps.filter(c => c.status==='Ativa').length
  const planej    = camps.filter(c => c.status==='Planejamento' || c.status==='Briefing').length

  // Wizard/detail are fullscreen
  if (mode==='wizard' && editForm!==null) {
    return (
      <div style={{ height:'100vh', overflow:'hidden' }}>
        <CampWizard initial={editForm} onSave={saveCamp} onClose={() => { setMode('lista'); setEditForm(null); setEditId(null) }} />
      </div>
    )
  }
  if (mode==='detail' && detail!==null) {
    return (
      <div style={{ height:'100vh', overflow:'hidden' }}>
        <CampDetail
          camp={detail}
          onEdit={() => { const { id, criado, ...rest } = detail; setEditForm(rest); setEditId(id); setMode('wizard') }}
          onClose={() => setMode('lista')}
          onDelete={() => { setConfirmDel(detail.id); setMode('lista') }}
        />
        {confirmDel!==null && (
          <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
            <div className="modal" style={{ maxWidth:360 }} onClick={e => e.stopPropagation()}>
              <div className="modal-title" style={{ color:'var(--er)' }}>🗑️ Excluir Campanha</div>
              <p style={{ fontSize:13, color:'var(--gr3)', margin:'12px 0 20px' }}>Excluir <strong style={{ color:'var(--wh)' }}>"{camps.find(c=>c.id===confirmDel)?.nome}"</strong>?</p>
              <div className="modal-foot">
                <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
                <button className="btn" style={{ background:'var(--er)',color:'#fff',border:'none' }} onClick={deleteConfirmed}>Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding:'0', display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed',top:20,right:24,zIndex:9999,padding:'10px 16px',borderRadius:'var(--r2)',fontSize:12,fontWeight:600,background:'rgba(34,197,94,.15)',border:'1px solid rgba(34,197,94,.3)',color:'var(--ok)',backdropFilter:'blur(10px)',boxShadow:'var(--sh)' }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ padding:'16px 24px 12px', borderBottom:'1px solid var(--gr)', background:'var(--bk2)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:'linear-gradient(135deg,#3B82F6,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,boxShadow:'0 0 16px rgba(59,130,246,.4)',flexShrink:0 }}>📣</div>
            <div>
              <div style={{ fontSize:16,fontWeight:800,color:'var(--wh)' }}>Planejamento de Campanhas</div>
              <div style={{ fontSize:9,color:'var(--gr3)' }}>Briefing completo · Orçamento · Fases · Criativos · Performance</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn" style={{ padding:'8px 14px', fontSize:11, color:'var(--al)', border:'1px solid rgba(0,196,180,.3)', background:'rgba(0,196,180,.08)' }}
              onClick={() => {
                seedAmorePaiva()
                try { setCamps(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')) } catch {}
                showToast('✅ Campanha Amore Paiva importada! Verifique Tarefas e Social Planner também.')
              }}>
              📥 Importar Amore Paiva
            </button>
            <button className="btn btn-al" style={{ padding:'8px 18px',fontSize:12 }}
              onClick={() => { setEditForm(emptyForm()); setEditId(null); setMode('wizard') }}>
              ➕ Nova Campanha
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:20, marginTop:12, flexWrap:'wrap' }}>
          {[
            { label:'Total', val:camps.length, color:'var(--lgt)' },
            { label:'Ativas', val:ativas, color:'var(--ok)' },
            { label:'Planejando', val:planej, color:'#8B5CF6' },
            { label:'Orçamento total', val:fmtMoeda(totalOrc), color:'var(--al)' },
            { label:'Gasto real', val:fmtMoeda(totalGast), color:'var(--wr)' },
          ].map(k => (
            <div key={k.label} style={{ display:'flex', alignItems:'baseline', gap:5 }}>
              <span style={{ fontSize:18,fontWeight:800,color:k.color }}>{k.val}</span>
              <span style={{ fontSize:10,color:'var(--gr3)' }}>{k.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding:'10px 24px',borderBottom:'1px solid var(--gr)',background:'var(--bk2)',display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',flexShrink:0 }}>
        <input className="inp" placeholder="🔍 Buscar campanha ou cliente..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ width:240,fontSize:11,padding:'6px 10px' }} />
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {(['Todas',...Object.keys(STATUS_CFG)] as const).map(s => (
            <button key={s} onClick={() => setFS(s as CampStatus | 'Todas')} style={{
              padding:'4px 10px',borderRadius:20,fontSize:9,fontWeight:700,cursor:'pointer',border:'none',
              background: filterStatus===s ? (s==='Todas'?'var(--al)':STATUS_CFG[s as CampStatus]?.color??'var(--al)') : 'var(--bk3)',
              color: filterStatus===s ? '#fff' : 'var(--gr3)',
              outline: filterStatus===s ? 'none' : '1px solid var(--gr)',
            }}>{s==='Todas'?'Todas':STATUS_CFG[s as CampStatus].icon} {s}</button>
          ))}
        </div>
        <span style={{ fontSize:10,color:'var(--gr3)',marginLeft:'auto' }}>{filtered.length} campanha{filtered.length!==1?'s':''}</span>
      </div>

      {/* Campaign grid */}
      <div style={{ flex:1,overflowY:'auto',padding:'16px 24px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center',padding:60,color:'var(--gr3)' }}>
            <div style={{ fontSize:40,marginBottom:12 }}>📣</div>
            <div style={{ fontSize:14,fontWeight:700,color:'var(--lgt)',marginBottom:8 }}>Nenhuma campanha encontrada</div>
            <div style={{ fontSize:11,marginBottom:20 }}>Crie a primeira campanha clicando em "Nova Campanha"</div>
            <button className="btn btn-al" onClick={() => { setEditForm(emptyForm()); setEditId(null); setMode('wizard') }}>➕ Nova Campanha</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14 }}>
            {filtered.map(c => (
              <CampCard key={c.id} camp={c} onClick={() => { setDetail(c); setMode('detail') }} />
            ))}
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDel!==null && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="modal" style={{ maxWidth:360 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color:'var(--er)' }}>🗑️ Excluir Campanha</div>
            <p style={{ fontSize:13,color:'var(--gr3)',margin:'12px 0 20px' }}>Excluir <strong style={{ color:'var(--wh)' }}>"{camps.find(c=>c.id===confirmDel)?.nome}"</strong>?</p>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancelar</button>
              <button className="btn" style={{ background:'var(--er)',color:'#fff',border:'none' }} onClick={deleteConfirmed}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
