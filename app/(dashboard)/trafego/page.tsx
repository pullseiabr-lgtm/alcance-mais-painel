'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

const ATALHOS = [
  { icon: '🍕', label: 'Planejar campanha restaurante', prompt: 'Quero planejar uma campanha completa de tráfego pago para um restaurante. Me guie pelo processo passo a passo, começando pelas perguntas que você precisa saber.' },
  { icon: '🎪', label: 'Campanha para evento', prompt: 'Preciso montar uma estratégia de tráfego pago para divulgar um evento. Por favor, me faça as perguntas necessárias e crie um plano completo com fases, orçamento e plataformas.' },
  { icon: '📦', label: 'Campanha iFood/Delivery', prompt: 'Quero aumentar os pedidos de delivery pelo iFood e outros apps. Como devo estruturar as campanhas de tráfego pago para maximizar os pedidos?' },
  { icon: '📊', label: 'Analisar performance', prompt: 'Quero analisar a performance das minhas campanhas atuais. Quais métricas devo verificar e como identificar o que está funcionando e o que precisa melhorar?' },
  { icon: '💰', label: 'Calcular orçamento ideal', prompt: 'Ajude-me a calcular o orçamento ideal para tráfego pago. Qual o investimento mínimo recomendado para cada plataforma e como distribuir o budget?' },
  { icon: '🎯', label: 'Segmentação de público', prompt: 'Como devo segmentar meu público-alvo nas campanhas de Meta Ads e Google Ads para um restaurante/delivery? Quero entender os melhores públicos e interesses para usar.' },
  { icon: '✍️', label: 'Criar copies de anúncios', prompt: 'Preciso de copies (textos) para anúncios de um restaurante. Me ajude a criar headlines, descrições e CTAs que geram cliques e conversões.' },
  { icon: '📅', label: 'Calendário de campanhas', prompt: 'Quero montar um calendário de campanhas para os próximos 3 meses considerando datas comemorativas brasileiras, sazonalidade e estratégia para restaurante/delivery.' },
]

const PLATAFORMAS = [
  { id: 'meta', label: 'Meta Ads', icon: '📘', color: '#1877F2' },
  { id: 'google', label: 'Google Ads', icon: '🔍', color: '#4285F4' },
  { id: 'tiktok', label: 'TikTok Ads', icon: '🎵', color: '#000' },
  { id: 'ifood', label: 'iFood Ads', icon: '🛵', color: '#E8002D' },
  { id: 'youtube', label: 'YouTube', icon: '📺', color: '#FF0000' },
  { id: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C' },
]

function MsgBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 14,
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginRight: 10, marginTop: 2,
          background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, boxShadow: '0 0 12px rgba(245,158,11,.3)',
        }}>🎯</div>
      )}
      <div style={{
        maxWidth: '76%',
        padding: '12px 16px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'linear-gradient(135deg,var(--al),var(--al3))' : 'var(--bk3)',
        border: isUser ? 'none' : '1px solid var(--gr)',
        color: isUser ? '#fff' : 'var(--lgt)',
        fontSize: 13, lineHeight: 1.65,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>{msg.content}</div>
    </div>
  )
}

export default function TrafegoPage() {
  const [msgs, setMsgs]       = useState<Msg[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [segmento, setSegmento] = useState<'restaurante' | 'evento' | 'delivery'>('restaurante')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send(texto?: string) {
    const msg = (texto ?? input).trim()
    if (!msg || loading) return
    setInput('')

    const newMsgs: Msg[] = [...msgs, { role: 'user', content: msg }]
    setMsgs(newMsgs)
    setLoading(true)

    try {
      const res = await fetch('/api/trafego/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs }),
      })
      if (!res.ok || !res.body) throw new Error('Erro na resposta')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let reply = ''

      setMsgs(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        reply += decoder.decode(value, { stream: true })
        setMsgs(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: reply }
          return copy
        })
      }
    } catch (err) {
      setMsgs(prev => [...prev, { role: 'assistant', content: '❌ Erro de conexão. Tente novamente.' }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const isEmpty = msgs.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0 0 0 0', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '20px 28px 16px',
        borderBottom: '1px solid var(--gr)',
        background: 'var(--bk2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 0 20px rgba(245,158,11,.4)', flexShrink: 0,
          }}>🎯</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--wh)', letterSpacing: '-.03em' }}>TRÁFEGO PRO</span>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                background: 'rgba(245,158,11,.15)', color: '#F59E0B',
                border: '1px solid rgba(245,158,11,.3)', borderRadius: 20, padding: '2px 8px',
              }}>ALCANCE+</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>
              Especialista em Tráfego Pago para Restaurantes, Delivery e Eventos
            </div>
          </div>
        </div>

        {/* Segmento selector */}
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            { id: 'restaurante', label: '🍽️ Restaurante' },
            { id: 'delivery',    label: '📦 Delivery' },
            { id: 'evento',      label: '🎪 Evento' },
          ] as const).map(s => (
            <button key={s.id} onClick={() => setSegmento(s.id)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer',
              border: 'none',
              background: segmento === s.id ? 'rgba(245,158,11,.2)' : 'var(--bk3)',
              color: segmento === s.id ? '#F59E0B' : 'var(--gr3)',
              outline: segmento === s.id ? '1px solid rgba(245,158,11,.4)' : '1px solid var(--gr)',
              transition: 'all .15s',
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Plataformas */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 28px',
        borderBottom: '1px solid var(--gr)',
        background: 'var(--bk2)', flexWrap: 'wrap',
      }}>
        {PLATAFORMAS.map(p => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20,
            background: 'var(--bk3)', border: '1px solid var(--gr)',
            fontSize: 9, fontWeight: 600, color: 'var(--gr3)',
          }}>
            {p.icon} {p.label}
          </div>
        ))}
        <div style={{ fontSize: 9, color: 'var(--gr)', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          6 plataformas disponíveis
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>

        {/* Empty state with atalhos */}
        {isEmpty && (
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--wh)', marginBottom: 8 }}>
                TRÁFEGO PRO — Especialista em Restaurantes e Eventos
              </div>
              <div style={{ fontSize: 12, color: 'var(--gr3)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                Planejamento estratégico, gestão de campanhas, análise de performance e execução de tráfego pago especializado para o mercado de food service e eventos.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {ATALHOS.map((a, i) => (
                <button key={i} onClick={() => send(a.prompt)} style={{
                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                  background: 'var(--bk2)', border: '1px solid var(--gr)',
                  textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 10,
                  transition: 'border-color .15s, background .15s',
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--lgt)', marginBottom: 2 }}>{a.label}</div>
                    <div style={{ fontSize: 9, color: 'var(--gr3)', lineHeight: 1.4 }}>
                      {a.prompt.slice(0, 65)}…
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* KPIs de referência */}
            <div style={{
              background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 16,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
                📊 Benchmarks do Mercado
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { label: 'ROAS mínimo restaurante', val: '3x', color: 'var(--ok)' },
                  { label: 'CPP ideal delivery', val: '< R$8', color: 'var(--al)' },
                  { label: 'CTR bom Meta Ads', val: '> 2%', color: 'var(--pu)' },
                  { label: 'CPL ideal evento', val: '< R$5', color: 'var(--ok)' },
                  { label: 'ROAS mínimo evento', val: '5x', color: 'var(--al)' },
                  { label: 'Taxa conv. LP evento', val: '> 5%', color: 'var(--pu)' },
                ].map(k => (
                  <div key={k.label} style={{ background: 'var(--bk3)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 8, color: 'var(--gr3)', marginBottom: 3 }}>{k.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: k.color }}>{k.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {msgs.map((m, i) => <MsgBubble key={i} msg={m} />)}
        {loading && msgs[msgs.length - 1]?.role === 'user' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>🎯</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#F59E0B',
                  animation: `tpbounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '14px 28px 20px',
        borderTop: '1px solid var(--gr)',
        background: 'var(--bk2)',
      }}>
        {!isEmpty && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {ATALHOS.slice(0, 4).map((a, i) => (
              <button key={i} onClick={() => send(a.prompt)} style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 9, fontWeight: 600, cursor: 'pointer',
                background: 'var(--bk3)', border: '1px solid var(--gr)', color: 'var(--gr3)',
              }}>{a.icon} {a.label}</button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={`Pergunte ao TRÁFEGO PRO sobre ${segmento === 'restaurante' ? 'campanhas para restaurante' : segmento === 'evento' ? 'divulgação de eventos' : 'campanhas de delivery'}…`}
            rows={2}
            className="inp"
            style={{ flex: 1, resize: 'none', fontSize: 13, lineHeight: 1.5 }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              padding: '10px 18px', borderRadius: 'var(--r)', border: 'none', cursor: 'pointer',
              background: (!input.trim() || loading) ? 'var(--bk4)' : 'linear-gradient(135deg,#F59E0B,#EF4444)',
              color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
              transition: 'all .2s',
            }}
          >
            {loading ? '⟳' : '↑'}
          </button>
        </div>
        <div style={{ fontSize: 9, color: 'var(--gr)', marginTop: 6, textAlign: 'center' }}>
          Enter para enviar • Shift+Enter nova linha • Especializado em Meta Ads, Google Ads, TikTok, iFood Ads
        </div>
      </div>

      <style>{`
        @keyframes tpbounce {
          0%,80%,100% { transform: scale(0.7); opacity: .4 }
          40% { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  )
}
