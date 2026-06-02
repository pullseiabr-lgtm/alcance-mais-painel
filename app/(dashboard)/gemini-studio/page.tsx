'use client'
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Modo = 'copy_card' | 'legenda_post' | 'script_video' | 'ideia_conteudo' | 'briefing_campanha'

interface Resultado {
  tipo:  Modo
  data:  Record<string, unknown>
  ts:    number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODOS: { id: Modo; label: string; icon: string; desc: string; color: string }[] = [
  { id: 'copy_card',         label: 'Copy para Card',      icon: '🎨', desc: 'Título, subtítulo e CTA para cards',        color: '#8B5CF6' },
  { id: 'legenda_post',      label: 'Legenda de Post',     icon: '📱', desc: 'Legenda completa com emojis e hashtags',    color: '#E1306C' },
  { id: 'script_video',      label: 'Roteiro de Vídeo',    icon: '🎬', desc: 'Script completo para Reels e TikTok',      color: '#3B82F6' },
  { id: 'ideia_conteudo',    label: 'Ideias de Conteúdo',  icon: '💡', desc: '5 ideias criativas com formatos',           color: '#F59E0B' },
  { id: 'briefing_campanha', label: 'Briefing Campanha',   icon: '📋', desc: 'Conceito + copies para todas as plataformas', color: '#00C4B4' },
]

const PLATAFORMAS = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'WhatsApp', 'iFood']
const TIPOS_POST  = ['Feed', 'Story', 'Reels', 'Shorts', 'Carrossel', 'Vídeo']
const ESTILOS     = ['Premium Dark', 'Vibrante', 'Moderno', 'Rústico', 'Festivo', 'Elegante']
const OBJETIVOS   = ['Engajamento', 'Vendas', 'Reservas', 'Reconhecimento', 'Delivery', 'Tráfego']

// ─── Helper to render result ──────────────────────────────────────────────────

function RenderResult({ tipo, data }: { tipo: Modo; data: Record<string, unknown> }) {
  const C = {
    copy_card:         '#8B5CF6',
    legenda_post:      '#E1306C',
    script_video:      '#3B82F6',
    ideia_conteudo:    '#F59E0B',
    briefing_campanha: '#00C4B4',
  }
  const color = C[tipo]

  // Copyable field
  function Field({ label, value, big }: { label: string; value: string; big?: boolean }) {
    const [copied, setCopied] = useState(false)
    if (!value) return null
    return (
      <div style={{ background:'var(--bk3)', border:'1px solid var(--gr)', borderRadius:10, padding:12, marginBottom:8 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <span style={{ fontSize:9, fontWeight:700, color, textTransform:'uppercase', letterSpacing:'.1em' }}>{label}</span>
          <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
            style={{ fontSize:9, padding:'2px 8px', borderRadius:10, background:copied?`${color}20`:'var(--bk4)', border:`1px solid ${copied?color:'var(--gr)'}`, color:copied?color:'var(--gr3)', cursor:'pointer' }}>
            {copied ? '✅ Copiado!' : '📋 Copiar'}
          </button>
        </div>
        <div style={{ fontSize: big?13:12, color:'var(--lgt)', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{value}</div>
      </div>
    )
  }

  // ── copy_card ──
  if (tipo === 'copy_card') {
    return (
      <div>
        <Field label="Título Principal" value={String(data.titulo||'')} big />
        <Field label="Subtítulo" value={String(data.subtitulo||'')} />
        <Field label="CTA (Botão)" value={String(data.cta||'')} />
        <Field label="Legenda do Post" value={String(data.legenda||'')} big />
        {Array.isArray(data.hashtags) && (
          <Field label="Hashtags" value={(data.hashtags as string[]).map(h=>`#${h}`).join(' ')} />
        )}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:4 }}>
          <Field label="Variação 2" value={String(data.variacao_2||'')} />
          <Field label="Variação 3" value={String(data.variacao_3||'')} />
        </div>
      </div>
    )
  }

  // ── legenda_post ──
  if (tipo === 'legenda_post') {
    return (
      <div>
        <Field label="Legenda Curta (Stories)" value={String(data.legenda_curta||'')} big />
        <Field label="Legenda Completa (Feed)" value={String(data.legenda_completa||'')} big />
        {Array.isArray(data.hashtags) && (
          <Field label="Hashtags" value={(data.hashtags as string[]).map(h=>`#${h}`).join(' ')} />
        )}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <Field label="CTA Sugerido" value={String(data.cta||'')} />
          <Field label="Melhor Horário" value={String(data.melhor_horario||'')} />
        </div>
      </div>
    )
  }

  // ── script_video ──
  if (tipo === 'script_video') {
    return (
      <div>
        <Field label="🎣 Hook (0-3s) — Gancho" value={String(data.hook||'')} big />
        <Field label="🎬 Desenvolvimento (3-25s)" value={String(data.desenvolvimento||'')} big />
        <Field label="📣 CTA Final (25-30s)" value={String(data.cta_final||'')} />
        <Field label="🤖 Prompt IA (fal.ai)" value={String(data.descricao_ia||'')} big />
        <Field label="📱 Legenda do Post" value={String(data.legenda||'')} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <Field label="🎵 Música Sugerida" value={String(data.musica_sugerida||'')} />
        </div>
        {Array.isArray(data.dicas_producao) && (
          <div style={{ background:'var(--bk3)', border:'1px solid var(--gr)', borderRadius:10, padding:12 }}>
            <div style={{ fontSize:9, fontWeight:700, color, marginBottom:8, textTransform:'uppercase', letterSpacing:'.1em' }}>💡 Dicas de Produção</div>
            {(data.dicas_producao as string[]).map((d,i) => (
              <div key={i} style={{ fontSize:11, color:'var(--lgt)', marginBottom:4 }}>• {d}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── ideia_conteudo ──
  if (tipo === 'ideia_conteudo') {
    const ideias = (data.ideias as Record<string,string>[] | undefined) ?? []
    return (
      <div>
        {data.tema_semana && (
          <div style={{ background:`${color}15`, border:`1px solid ${color}30`, borderRadius:10, padding:12, marginBottom:12 }}>
            <div style={{ fontSize:9, fontWeight:700, color, marginBottom:4 }}>🗓️ TEMA DA SEMANA</div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--wh)' }}>{String(data.tema_semana)}</div>
            {data.data_ideal && <div style={{ fontSize:10, color:'var(--gr3)', marginTop:3 }}>⏰ {String(data.data_ideal)}</div>}
          </div>
        )}
        {ideias.map((idea, i) => (
          <div key={i} style={{ background:'var(--bk3)', border:'1px solid var(--gr)', borderRadius:10, padding:12, marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--wh)' }}>#{i+1} {idea.titulo}</span>
              <div style={{ display:'flex', gap:5 }}>
                <span style={{ fontSize:8, padding:'2px 7px', borderRadius:10, background:`${color}15`, color, border:`1px solid ${color}30` }}>{idea.formato}</span>
                <span style={{ fontSize:8, padding:'2px 7px', borderRadius:10,
                  background: idea.potencial_viral==='alto' ? 'rgba(34,197,94,.1)' : idea.potencial_viral==='médio' ? 'rgba(245,158,11,.1)' : 'var(--bk4)',
                  color: idea.potencial_viral==='alto' ? 'var(--ok)' : idea.potencial_viral==='médio' ? 'var(--wr)' : 'var(--gr3)',
                  border:'1px solid transparent',
                }}>🔥 {idea.potencial_viral}</span>
              </div>
            </div>
            <div style={{ fontSize:11, color:'var(--lgt)', marginBottom:6, lineHeight:1.5 }}>{idea.descricao}</div>
            <div style={{ fontSize:10, color:'var(--gr3)', fontStyle:'italic' }}>"{idea.texto}"</div>
          </div>
        ))}
      </div>
    )
  }

  // ── briefing_campanha ──
  if (tipo === 'briefing_campanha') {
    const copies = data.copies as Record<string,string> | undefined
    return (
      <div>
        <Field label="💡 Conceito Criativo" value={String(data.conceito||'')} big />
        <Field label="💬 Mensagem-Chave" value={String(data.mensagem_chave||'')} big />
        <Field label="🗣️ Tom de Voz" value={String(data.tom_de_voz||'')} />
        {copies && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <Field label="Feed" value={String(copies.feed||'')} />
            <Field label="Story" value={String(copies.story||'')} />
            <Field label="Reels" value={String(copies.reels||'')} />
            <Field label="WhatsApp" value={String(copies.whatsapp||'')} />
          </div>
        )}
        {Array.isArray(data.hashtags_campanha) && (
          <Field label="Hashtags da Campanha" value={(data.hashtags_campanha as string[]).map(h=>`#${h}`).join(' ')} />
        )}
        {Array.isArray(data.ideias_criativas) && (
          <div style={{ background:'var(--bk3)', border:'1px solid var(--gr)', borderRadius:10, padding:12 }}>
            <div style={{ fontSize:9, fontWeight:700, color, marginBottom:8, textTransform:'uppercase', letterSpacing:'.1em' }}>✨ Ideias Criativas</div>
            {(data.ideias_criativas as string[]).map((ideia,i) => (
              <div key={i} style={{ fontSize:11, color:'var(--lgt)', marginBottom:4 }}>• {ideia}</div>
            ))}
          </div>
        )}
        <Field label="🎨 Referências Visuais" value={String(data.referencias_visuais||'')} />
      </div>
    )
  }

  return <pre style={{ fontSize:10, color:'var(--gr3)', overflowX:'auto' }}>{JSON.stringify(data, null, 2)}</pre>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeminiStudioPage() {
  const [modo, setModo]         = useState<Modo>('copy_card')
  const [loading, setLoading]   = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [historico, setHistorico] = useState<Resultado[]>([])
  const [toast, setToast]       = useState('')
  const [erro, setErro]         = useState('')

  // Form fields
  const [cliente, setCliente]     = useState('Amore Paiva')
  const [produto, setProduto]     = useState('')
  const [campanha, setCampanha]   = useState('')
  const [plataforma, setPlataforma] = useState('Instagram')
  const [tipoPost, setTipoPost]   = useState('Feed')
  const [estilo, setEstilo]       = useState('Premium Dark')
  const [objetivo, setObjetivo]   = useState('Engajamento')
  const [duracao, setDuracao]     = useState('30')
  const [periodo, setPeriodo]     = useState('Junho 2026')
  const [tema, setTema]           = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function gerar() {
    setLoading(true); setErro('')
    try {
      const contexto: Record<string, string> = {
        cliente, produto, campanha, plataforma,
        tipo: tipoPost, estilo, objetivo, duracao,
        periodo, tema, titulo: tema,
        tom: 'animado, próximo e profissional',
        plataformas: 'Instagram, TikTok, Facebook',
        campanhas: campanha,
        budget: 'R$ 3.500',
      }

      const res = await fetch('/api/gemini/conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: modo, contexto }),
      })

      if (!res.ok) {
        const err = await res.json()
        setErro(err.error || 'Erro ao gerar conteúdo')
        return
      }

      const { data } = await res.json()
      const r: Resultado = { tipo: modo, data, ts: Date.now() }
      setResultado(r)
      setHistorico(prev => [r, ...prev.slice(0, 9)])
      showToast('✅ Conteúdo gerado pelo Gemini!')
    } catch (e) {
      setErro('Erro de conexão. Verifique GEMINI_API_KEY.')
    } finally {
      setLoading(false)
    }
  }

  const modoAtual = MODOS.find(m => m.id === modo)!

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:24, zIndex:9999, padding:'10px 16px', borderRadius:'var(--r2)', fontSize:12, fontWeight:600, background:'rgba(34,197,94,.15)', border:'1px solid rgba(34,197,94,.3)', color:'var(--ok)', backdropFilter:'blur(10px)', boxShadow:'var(--sh)' }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ padding:'16px 24px 12px', borderBottom:'1px solid var(--gr)', background:'var(--bk2)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#4285F4,#0F9D58)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 0 16px rgba(66,133,244,.4)', flexShrink:0 }}>🟣</div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16, fontWeight:800, color:'var(--wh)' }}>Gemini Studio</span>
              <span style={{ fontSize:8, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', background:'rgba(66,133,244,.12)', color:'#4285F4', border:'1px solid rgba(66,133,244,.3)', borderRadius:20, padding:'2px 8px' }}>Google AI</span>
            </div>
            <div style={{ fontSize:9, color:'var(--gr3)' }}>Geração de conteúdo para Cards, Posts, Vídeos e Campanhas</div>
          </div>
        </div>

        {/* Modo selector */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {MODOS.map(m => (
            <button key={m.id} onClick={() => { setModo(m.id); setResultado(null); setErro('') }} style={{
              padding:'6px 12px', borderRadius:20, fontSize:10, fontWeight:700, cursor:'pointer', border:'none',
              background: modo===m.id ? `${m.color}20` : 'var(--bk3)',
              color: modo===m.id ? m.color : 'var(--gr3)',
              outline: modo===m.id ? `1px solid ${m.color}50` : '1px solid var(--gr)',
              transition:'all .15s',
              display:'flex', alignItems:'center', gap:5,
            }}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'320px 1fr', gap:0 }}>

        {/* LEFT: Form */}
        <div style={{ borderRight:'1px solid var(--gr)', overflowY:'auto', padding:'16px 16px' }}>
          <div style={{ fontSize:10, fontWeight:700, color:modoAtual.color, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
            {modoAtual.icon} {modoAtual.label.toUpperCase()}
            <span style={{ fontSize:9, color:'var(--gr3)', fontWeight:400 }}>— {modoAtual.desc}</span>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div className="field">
              <label>Cliente / Marca</label>
              <input className="inp" value={cliente} onChange={e=>setCliente(e.target.value)} placeholder="Ex: Amore Paiva" style={{ fontSize:12 }} />
            </div>

            {(modo === 'copy_card' || modo === 'legenda_post' || modo === 'script_video') && (
              <>
                <div className="field">
                  <label>Produto / Tema</label>
                  <input className="inp" value={produto} onChange={e=>setProduto(e.target.value)} placeholder="Ex: Happy Hour, Feijoada, Barca de Sushi" style={{ fontSize:12 }} />
                </div>
                <div className="field">
                  <label>Plataforma</label>
                  <select className="inp" value={plataforma} onChange={e=>setPlataforma(e.target.value)} style={{ fontSize:12 }}>
                    {PLATAFORMAS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Tipo de Conteúdo</label>
                  <select className="inp" value={tipoPost} onChange={e=>setTipoPost(e.target.value)} style={{ fontSize:12 }}>
                    {TIPOS_POST.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </>
            )}

            {modo === 'copy_card' && (
              <>
                <div className="field">
                  <label>Estilo Visual</label>
                  <select className="inp" value={estilo} onChange={e=>setEstilo(e.target.value)} style={{ fontSize:12 }}>
                    {ESTILOS.map(e=><option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Objetivo</label>
                  <select className="inp" value={objetivo} onChange={e=>setObjetivo(e.target.value)} style={{ fontSize:12 }}>
                    {OBJETIVOS.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              </>
            )}

            {modo === 'script_video' && (
              <div className="field">
                <label>Duração (segundos)</label>
                <select className="inp" value={duracao} onChange={e=>setDuracao(e.target.value)} style={{ fontSize:12 }}>
                  {['15','30','60','90'].map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
            )}

            {(modo === 'ideia_conteudo' || modo === 'briefing_campanha') && (
              <>
                <div className="field">
                  <label>Campanha / Tema</label>
                  <input className="inp" value={campanha} onChange={e=>setCampanha(e.target.value)} placeholder="Ex: Happy Hour Copa do Mundo" style={{ fontSize:12 }} />
                </div>
                <div className="field">
                  <label>Período</label>
                  <input className="inp" value={periodo} onChange={e=>setPeriodo(e.target.value)} placeholder="Ex: Junho 2026" style={{ fontSize:12 }} />
                </div>
              </>
            )}

            {modo === 'legenda_post' && (
              <div className="field">
                <label>Tema do Post</label>
                <input className="inp" value={tema} onChange={e=>setTema(e.target.value)} placeholder="Ex: Lançamento Festival de Massas" style={{ fontSize:12 }} />
              </div>
            )}

            {erro && (
              <div style={{ padding:'10px 12px', borderRadius:10, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', fontSize:11, color:'var(--er)', lineHeight:1.5 }}>
                ⚠️ {erro}
              </div>
            )}

            <button
              onClick={gerar}
              disabled={loading}
              style={{
                padding:'12px', borderRadius:'var(--r)', border:'none', cursor: loading?'not-allowed':'pointer',
                fontSize:12, fontWeight:800, color:'#fff',
                background: loading ? 'var(--bk4)' : `linear-gradient(135deg,#4285F4,#0F9D58)`,
                boxShadow: loading ? 'none' : '0 4px 16px rgba(66,133,244,.4)',
                transition:'all .2s',
              }}
            >
              {loading ? '⟳ Gemini gerando...' : `🟣 Gerar com Gemini`}
            </button>

            <div style={{ fontSize:9, color:'var(--gr3)', textAlign:'center', lineHeight:1.6 }}>
              Powered by <strong style={{ color:'#4285F4' }}>Google Gemini 1.5 Flash</strong><br/>
              Rápido • Grátis até 1M tokens/mês
            </div>
          </div>

          {/* Histórico */}
          {historico.length > 0 && (
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:9, fontWeight:700, color:'var(--gr3)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8 }}>HISTÓRICO</div>
              {historico.map((h,i) => {
                const m = MODOS.find(x=>x.id===h.tipo)!
                return (
                  <button key={i} onClick={()=>setResultado(h)} style={{
                    width:'100%', padding:'7px 10px', borderRadius:8, border:'1px solid var(--gr)',
                    background: resultado?.ts===h.ts ? `${m.color}10` : 'var(--bk3)',
                    cursor:'pointer', textAlign:'left', marginBottom:5,
                    display:'flex', alignItems:'center', gap:7, transition:'all .15s',
                  }}>
                    <span style={{ fontSize:14 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color: resultado?.ts===h.ts ? m.color : 'var(--lgt)' }}>{m.label}</div>
                      <div style={{ fontSize:8, color:'var(--gr3)' }}>{new Date(h.ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Result */}
        <div style={{ overflowY:'auto', padding:'16px 20px' }}>
          {!resultado && !loading && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--gr3)', textAlign:'center' }}>
              <div style={{ fontSize:52, marginBottom:16 }}>🟣</div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--lgt)', marginBottom:8 }}>Gemini Studio</div>
              <div style={{ fontSize:11, maxWidth:360, lineHeight:1.6, marginBottom:20 }}>
                Selecione o tipo de conteúdo, preencha as informações e clique em <strong>Gerar com Gemini</strong>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxWidth:400 }}>
                {MODOS.map(m => (
                  <button key={m.id} onClick={()=>setModo(m.id)} style={{
                    padding:'10px 12px', borderRadius:10, cursor:'pointer',
                    background:`${m.color}08`, border:`1px solid ${m.color}25`,
                    display:'flex', alignItems:'center', gap:8, textAlign:'left',
                    transition:'all .15s',
                  }}>
                    <span style={{ fontSize:20 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:m.color }}>{m.label}</div>
                      <div style={{ fontSize:8, color:'var(--gr3)' }}>{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:16 }}>
              <div style={{ width:56, height:56, borderRadius:'50%', border:'3px solid rgba(66,133,244,.15)', borderTop:'3px solid #4285F4', animation:'gmspin 1s linear infinite' }} />
              <div style={{ fontSize:14, fontWeight:700, color:'var(--wh)' }}>Gemini está gerando...</div>
              <div style={{ fontSize:10, color:'var(--gr3)' }}>Google Gemini 1.5 Flash • Normalmente &lt; 3s</div>
            </div>
          )}

          {resultado && !loading && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:20 }}>{MODOS.find(m=>m.id===resultado.tipo)?.icon}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:'var(--wh)' }}>{MODOS.find(m=>m.id===resultado.tipo)?.label}</div>
                    <div style={{ fontSize:9, color:'var(--gr3)' }}>Gerado por Gemini 1.5 Flash • {new Date(resultado.ts).toLocaleTimeString('pt-BR')}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn" style={{ fontSize:10, padding:'5px 12px' }} onClick={gerar}>🔄 Regerar</button>
                  <button className="btn" style={{ fontSize:10, padding:'5px 10px', color:'var(--er)' }} onClick={()=>setResultado(null)}>✕</button>
                </div>
              </div>
              <RenderResult tipo={resultado.tipo} data={resultado.data} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes gmspin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
