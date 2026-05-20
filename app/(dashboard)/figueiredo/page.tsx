'use client'
import { useState, useRef, useEffect, FormEvent } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

const AGENTS = [
  { id: 'copy', label: 'COPYMASTER', icon: '📝', color: '#F59E0B' },
  { id: 'social', label: 'SOCIAL MEDIA', icon: '📱', color: '#8B5CF6' },
  { id: 'design', label: 'DESIGNER', icon: '🎨', color: '#EC4899' },
  { id: 'video', label: 'VIDEO EDITOR', icon: '🎬', color: '#EF4444' },
  { id: 'traffic', label: 'TRÁFEGO PAGO', icon: '💰', color: '#3B82F6' },
  { id: 'comercial', label: 'COMERCIAL', icon: '💼', color: '#10B981' },
  { id: 'finance', label: 'FINANCEIRO', icon: '💳', color: '#6366F1' },
]

const QUICK = [
  {
    cat: 'Operações',
    items: [
      { label: 'Briefing de cliente novo', cmd: 'Preciso montar um briefing completo para um novo cliente restaurante. Me ajude a estruturar todas as informações necessárias para começar a trabalhar.', icon: '📋' },
      { label: 'Planejamento mensal', cmd: 'Crie um planejamento operacional completo para o próximo mês para uma agência de marketing com 8 clientes ativos.', icon: '📅' },
      { label: 'Onboarding de cliente', cmd: 'Crie um processo de onboarding completo para um novo cliente de marketing digital — da proposta à primeira entrega.', icon: '🚀' },
    ],
  },
  {
    cat: 'Campanhas',
    items: [
      { label: 'Campanha completa', cmd: 'Crie uma campanha completa de marketing digital para um restaurante com orçamento de R$500 — copy, criativos, tráfego e calendário de conteúdo.', icon: '📢' },
      { label: 'Campanha de lançamento', cmd: 'Monte uma campanha de lançamento de produto para uma loja de roupas femininas — do teaser ao pós-lançamento.', icon: '🎯' },
      { label: 'Black Friday urgente', cmd: 'Preciso de uma campanha agressiva de Black Friday para amanhã com orçamento de R$300. Monte tudo: copy, criativos, tráfego e stories.', icon: '🔥' },
    ],
  },
  {
    cat: 'Conteúdo',
    items: [
      { label: '10 Reels virais', cmd: 'Crie 10 ideias de Reels virais com roteiro completo, legenda e CTA para um restaurante de comida japonesa no Instagram.', icon: '🎬' },
      { label: 'Calendário 30 dias', cmd: 'Crie um calendário editorial completo de 30 dias para um e-commerce de moda feminina com posts diários para Instagram e TikTok.', icon: '📆' },
      { label: 'Pack de stories', cmd: 'Crie 15 stories estratégicos para vender um serviço de estética — com sequência de aquecimento, prova social e fechamento.', icon: '✨' },
    ],
  },
  {
    cat: 'Comercial',
    items: [
      { label: 'Script de vendas', cmd: 'Crie um script completo de vendas pelo WhatsApp para uma clínica de estética — desde o primeiro contato até o fechamento.', icon: '💬' },
      { label: 'Recuperar leads frios', cmd: 'Tenho 50 leads que não responderam há mais de 15 dias. Crie uma estratégia completa de reaquecimento com mensagens, conteúdo e oferta.', icon: '♻️' },
      { label: 'Proposta comercial', cmd: 'Monte uma proposta comercial completa para uma agência de marketing digital oferecer gestão de redes sociais + tráfego por R$2.500/mês.', icon: '📄' },
    ],
  },
  {
    cat: 'Financeiro',
    items: [
      { label: 'Relatório executivo', cmd: 'Monte um modelo de relatório executivo mensal para apresentar aos clientes com métricas de redes sociais, tráfego pago e resultados comerciais.', icon: '📊' },
      { label: 'Precificação de serviços', cmd: 'Me ajude a precificar todos os serviços da agência: gestão de redes sociais, tráfego pago, criação de conteúdo e branding.', icon: '💲' },
    ],
  },
]

const PRIORITIES = [
  { label: '🔴 URGENTE', val: 'urgente' },
  { label: '🟠 ALTA', val: 'alta' },
  { label: '🟡 MÉDIA', val: 'media' },
  { label: '🟢 BAIXA', val: 'baixa' },
]

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#1a2332;padding:1px 6px;border-radius:4px;font-family:var(--mono);font-size:11px;color:#64D2FF">$1</code>')
    .replace(/^#{1,3} (.+)$/gm, '<div style="font-size:13px;font-weight:800;color:#C9A227;margin:14px 0 6px;letter-spacing:.5px;text-transform:uppercase">$1</div>')
    .replace(/^• (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0"><span style="color:#C9A227;flex-shrink:0">•</span><span>$1</span></div>')
    .replace(/^\d+\. (.+)$/gm, (m, p1, offset, str) => {
      const prev = str.slice(0, offset)
      const n = (prev.match(/^\d+\./gm) || []).length + 1
      return `<div style="display:flex;gap:10px;margin:4px 0"><span style="color:#C9A227;font-weight:700;min-width:18px">${n}.</span><span>${p1}</span></div>`
    })
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #1e2d3d;margin:12px 0"/>')
    .replace(/\n{2,}/g, '</p><p style="margin:8px 0">')
    .replace(/\n/g, '<br/>')
}

export default function FigueiredoPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [openCat, setOpenCat] = useState<string | null>('Operações')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', loading: true }])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/figueiredo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: data.content || data.error || 'Erro ao processar.' },
      ])
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Erro de conexão.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  return (
    <>
      {/* Header */}
      <div className="topbar" style={{ borderBottom: '1px solid #1a2332' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'linear-gradient(135deg, #B8860B 0%, #C9A227 50%, #FFD700 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 900, color: '#0a0f1a', boxShadow: '0 0 20px #C9A22740',
          }}>F</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 900, fontSize: 16, color: '#C9A227', letterSpacing: 1 }}>FIGUEIREDO</span>
              <span style={{ fontSize: 9, fontWeight: 700, background: '#C9A22720', color: '#C9A227', border: '1px solid #C9A22740', borderRadius: 20, padding: '2px 8px', letterSpacing: 1 }}>ALCANCE CORE</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gr3)' }}>Gerente de Operações Inteligente · 7 Agentes Internos</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {AGENTS.map(a => (
            <div key={a.id} title={a.label} style={{
              width: 28, height: 28, borderRadius: 6,
              background: `${a.color}18`, border: `1px solid ${a.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, cursor: 'default',
            }}>{a.icon}</div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 57px)', overflow: 'hidden' }}>

        {/* Sidebar de comandos */}
        <div style={{
          width: 260, borderRight: '1px solid #1a2332', overflowY: 'auto',
          background: '#080d14', flexShrink: 0,
        }}>
          <div style={{ padding: '14px 14px 6px', fontSize: 9, fontWeight: 800, color: '#C9A227', letterSpacing: 2, textTransform: 'uppercase' }}>
            Comandos Operacionais
          </div>

          {QUICK.map(cat => (
            <div key={cat.cat}>
              <button
                onClick={() => setOpenCat(openCat === cat.cat ? null : cat.cat)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 10, fontWeight: 800, color: openCat === cat.cat ? '#C9A227' : 'var(--gr3)',
                  letterSpacing: 1, textTransform: 'uppercase',
                }}
              >
                {cat.cat}
                <span style={{ opacity: .6 }}>{openCat === cat.cat ? '▾' : '▸'}</span>
              </button>
              {openCat === cat.cat && cat.items.map(item => (
                <button
                  key={item.label}
                  onClick={() => send(item.cmd)}
                  disabled={loading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8,
                    padding: '7px 14px 7px 20px', background: 'none', border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer', textAlign: 'left',
                    opacity: loading ? .4 : 1,
                  }}
                >
                  <span style={{ fontSize: 13 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, color: 'var(--gr2)', lineHeight: 1.4 }}>{item.label}</span>
                </button>
              ))}
            </div>
          ))}

          <div style={{ padding: '14px 14px 6px', marginTop: 8, fontSize: 9, fontWeight: 800, color: '#C9A227', letterSpacing: 2, textTransform: 'uppercase', borderTop: '1px solid #1a2332' }}>
            Prioridades
          </div>
          {PRIORITIES.map(p => (
            <button
              key={p.val}
              onClick={() => send(`Classifique como ${p.label} e execute: `)}
              style={{
                width: '100%', textAlign: 'left', padding: '6px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, color: 'var(--gr3)',
              }}
            >{p.label}</button>
          ))}

          <div style={{ padding: '14px 14px 6px', marginTop: 8, fontSize: 9, fontWeight: 800, color: 'var(--gr3)', letterSpacing: 2, textTransform: 'uppercase', borderTop: '1px solid #1a2332' }}>
            Agentes Internos
          </div>
          {AGENTS.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 14px', fontSize: 10, color: 'var(--gr3)',
            }}>
              <span style={{ fontSize: 12 }}>{a.icon}</span>
              <span style={{ fontWeight: 700, color: a.color }}>{a.label}</span>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20,
                  background: 'linear-gradient(135deg, #B8860B, #FFD700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, fontWeight: 900, color: '#0a0f1a',
                  boxShadow: '0 0 40px #C9A22730',
                }}>F</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#C9A227', letterSpacing: 2 }}>FIGUEIREDO</div>
                  <div style={{ fontSize: 12, color: 'var(--gr3)', marginTop: 4 }}>ALCANCE CORE — Gerente de Operações</div>
                  <div style={{ fontSize: 11, color: 'var(--gr3)', marginTop: 16, maxWidth: 400, lineHeight: 1.6, opacity: .7 }}>
                    Envie qualquer demanda operacional, comercial, de conteúdo ou estratégica.<br/>
                    Coordenarei os 7 agentes internos e entregarei o plano completo.
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 500, marginTop: 8 }}>
                  {[
                    { label: 'Campanha completa', cmd: 'Crie uma campanha completa de marketing para um restaurante japonês com orçamento de R$300 para esta semana.' },
                    { label: 'Planejamento mensal', cmd: 'Monte um planejamento operacional completo para o próximo mês para uma agência com 5 clientes.' },
                    { label: 'Aumentar vendas agora', cmd: 'Preciso aumentar as vendas do meu cliente (academia fitness) essa semana. Monte uma estratégia completa e urgente.' },
                    { label: 'Script de vendas', cmd: 'Crie um script de vendas completo pelo WhatsApp para um serviço de assessoria de redes sociais por R$1.500/mês.' },
                  ].map(s => (
                    <button
                      key={s.label}
                      onClick={() => send(s.cmd)}
                      style={{
                        padding: '10px 14px', background: '#0d1520', border: '1px solid #1a2d45',
                        borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                        fontSize: 11, color: 'var(--gr2)', fontWeight: 600,
                      }}
                    >{s.label}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg,#6366F1,#8B5CF6)'
                    : 'linear-gradient(135deg,#B8860B,#FFD700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 900,
                  color: m.role === 'user' ? '#fff' : '#0a0f1a',
                }}>
                  {m.role === 'user' ? 'VC' : 'F'}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '80%',
                  background: m.role === 'user' ? '#1a2440' : '#0d1520',
                  border: m.role === 'user' ? '1px solid #2a3a60' : '1px solid #1a2d45',
                  borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                  padding: '12px 16px',
                  fontSize: 13,
                  color: 'var(--gr1)',
                  lineHeight: 1.65,
                }}>
                  {m.loading ? (
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', color: '#C9A227' }}>
                      <span style={{ animation: 'pulse 1s infinite' }}>⚙</span>
                      <span style={{ fontSize: 11 }}>FIGUEIREDO está coordenando os agentes...</span>
                    </div>
                  ) : m.role === 'assistant' ? (
                    <div dangerouslySetInnerHTML={{ __html: `<p style="margin:0">${renderMarkdown(m.content)}</p>` }} />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 28px 20px', borderTop: '1px solid #1a2332', background: '#080d14' }}>
            <form onSubmit={onSubmit} style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Envie uma demanda para o FIGUEIREDO... (campanha, conteúdo, comercial, financeiro...)"
                  disabled={loading}
                  style={{
                    width: '100%', background: '#0d1520', border: '1px solid #1a2d45',
                    borderRadius: 10, padding: '12px 16px', color: 'var(--gr1)',
                    fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{
                  padding: '12px 20px', borderRadius: 10, border: 'none',
                  background: loading || !input.trim()
                    ? '#1a2332'
                    : 'linear-gradient(135deg,#B8860B,#C9A227)',
                  color: loading || !input.trim() ? 'var(--gr3)' : '#0a0f1a',
                  fontWeight: 800, fontSize: 13, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap', letterSpacing: .5,
                }}
              >
                {loading ? '⚙ Operando...' : 'Executar →'}
              </button>
            </form>
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Campanha urgente 🔴', 'Planejamento mensal', 'Conteúdo semanal', 'Fechar caixa', 'Script de vendas'].map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  style={{
                    padding: '3px 10px', background: '#0d1520', border: '1px solid #1a2d45',
                    borderRadius: 20, fontSize: 10, color: 'var(--gr3)', cursor: 'pointer',
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
