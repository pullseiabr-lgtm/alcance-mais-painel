'use client'
import { useState, useRef, useEffect, FormEvent } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

// ── Quick commands ────────────────────────────────────────────────────────────

const QUICK_GROUPS = [
  {
    label: 'Cardápio',
    color: '#E8002D',
    items: [
      {
        label: 'Analisar cardápio',
        cmd: 'Quero que você analise meu cardápio completo. Me diga quais produtos têm mais potencial de venda no iFood, o que devo remover, o que devo melhorar e como estruturar o cardápio para maximizar conversão e ticket médio.',
        icon: '📋',
      },
      {
        label: 'Produto campeão',
        cmd: 'Me ajude a criar um produto campeão irresistível para o iFood. Quero um item que seja fotogênico, gere desejo imediato, tenha boa margem e vire o carro-chefe da minha loja.',
        icon: '🏆',
      },
      {
        label: 'Combos estratégicos',
        cmd: 'Monte combos estratégicos para o meu cardápio que aumentem o ticket médio e facilitem a decisão do cliente. Quero preços, composição e nome de cada combo.',
        icon: '🎁',
      },
      {
        label: 'Nomes e descrições',
        cmd: 'Reescreva os nomes e descrições dos meus produtos de forma mais atrativa para o iFood. O nome deve ser criativo e a descrição deve despertar desejo e informar os ingredientes.',
        icon: '✍️',
      },
    ],
  },
  {
    label: 'Algoritmo & Ranking',
    color: '#FF6B00',
    items: [
      {
        label: 'Como ranquear melhor',
        cmd: 'Me explique como funciona o algoritmo do iFood e me dê um plano de ação para subir no ranqueamento da minha categoria nas próximas 4 semanas.',
        icon: '📈',
      },
      {
        label: 'Taxa de aceitação',
        cmd: 'Minha taxa de aceitação está baixa. Me dê um protocolo completo para melhorar essa taxa e evitar punições do algoritmo do iFood.',
        icon: '✅',
      },
      {
        label: 'Avaliações',
        cmd: 'Preciso de uma estratégia completa para aumentar o número de avaliações positivas na minha loja do iFood. Me dê respostas padrão para avaliações positivas, neutras e negativas, e como incentivar mais clientes a avaliarem.',
        icon: '⭐',
      },
    ],
  },
  {
    label: 'Precificação',
    color: '#2ECC71',
    items: [
      {
        label: 'Calcular preço ideal',
        cmd: 'Me ajude a calcular o preço ideal dos meus produtos para o iFood. Quero manter uma margem saudável mesmo com a comissão da plataforma e custos de embalagem. Me explique a fórmula e aplique no meu contexto.',
        icon: '💰',
      },
      {
        label: 'Estratégia de preço',
        cmd: 'Crie uma estratégia de precificação completa para minha loja no iFood: preço âncora, produto isca, produto de margem e como usar psicologia de preços para aumentar conversão.',
        icon: '📊',
      },
      {
        label: 'Planos do iFood',
        cmd: 'Explique os planos do iFood (Básico, Entrega, etc.) com as comissões de cada um e me recomende qual faz mais sentido para o meu negócio.',
        icon: '📑',
      },
    ],
  },
  {
    label: 'Fotos & Visual',
    color: '#9B59B6',
    items: [
      {
        label: 'Guia de fotografia',
        cmd: 'Me dê um guia completo de fotografia de comida para o iFood usando apenas o celular. Iluminação, ângulo, enquadramento, props e edição. Quero fotos que gerem desejo imediato.',
        icon: '📸',
      },
      {
        label: 'Banner da loja',
        cmd: 'Como deve ser o banner de capa e a foto de perfil ideal da minha loja no iFood para maximizar cliques e conversão? Me dê as especificações e o que incluir.',
        icon: '🖼️',
      },
    ],
  },
  {
    label: 'iFood Ads',
    color: '#E74C3C',
    items: [
      {
        label: 'Estratégia de anúncios',
        cmd: 'Crie uma estratégia completa de iFood Ads (Patrocinados) para minha loja. Orçamento, horários, produtos para anunciar, como medir ROAS e quando pausar ou escalar.',
        icon: '🎯',
      },
      {
        label: 'Horários de pico',
        cmd: 'Quais são os melhores horários para ativar anúncios no iFood na minha categoria? Me dê um calendário semanal de investimento com horários e dias prioritários.',
        icon: '⏰',
      },
    ],
  },
  {
    label: 'Crescimento',
    color: '#3498DB',
    items: [
      {
        label: 'Plano 30/60/90 dias',
        cmd: 'Crie um plano de crescimento de 90 dias para minha loja no iFood. Quero metas claras, ações semanais e KPIs para acompanhar em cada fase.',
        icon: '🚀',
      },
      {
        label: 'Análise de concorrência',
        cmd: 'Me ensine como analisar meus concorrentes no iFood e encontrar brechas e oportunidades para me diferenciar na categoria. Quero um método prático e repetível.',
        icon: '🔍',
      },
      {
        label: 'Embalagem e fidelização',
        cmd: 'Como usar a embalagem e o encarte dentro do pedido para fidelizar clientes, gerar avaliações e aumentar recompra? Me dê textos e ideias práticas.',
        icon: '📦',
      },
    ],
  },
]

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="color:#E8002D;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:16px 0 6px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:var(--wh);font-size:14px;font-weight:700;margin:16px 0 8px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:var(--wh);font-size:16px;font-weight:800;margin:16px 0 8px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--wh);font-weight:700">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bk4);padding:1px 6px;border-radius:4px;font-family:var(--mono);font-size:11px;color:#FF6B00">$1</code>')
    .replace(/^═+$/gm, '<hr style="border:none;border-top:2px solid rgba(232,0,45,.2);margin:16px 0">')
    .replace(/^─+$/gm, '<hr style="border:none;border-top:1px solid var(--gr);margin:12px 0">')
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--gr);margin:12px 0">')
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => c.trim())
      return '<tr>' + cells.map((c: string) => `<td style="padding:7px 12px;border-bottom:1px solid var(--gr)">${c}</td>`).join('') + '</tr>'
    })
    .replace(/<tr><td[^>]*>[-: ]+<\/td>(?:<td[^>]*>[-: ]+<\/td>)*<\/tr>/g, '')
    .replace(/^[-•□✅⚠️🔴🟡🟢] (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
    .replace(/^  [-•] (.+)$/gm, '<li style="margin:2px 0;padding-left:16px;color:var(--gr3)">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:5px 0;padding-left:4px">$1</li>')
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/g, m => `<ul style="padding-left:18px;margin:6px 0">${m}</ul>`)
    .replace(/(<tr>.*?<\/tr>\n?)+/g, m => `<table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:12px">${m}</table>`)
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

// ── Bubble ────────────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  if (msg.loading) {
    return (
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '14px 0' }}>
        <div className="if-avatar">🛵</div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6 }}>Expert iFood — Alcance+</div>
          <div className="bubble-if">
            <div className="typing-dots"><span /><span /><span /></div>
          </div>
        </div>
      </div>
    )
  }

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '14px 0' }}>
        <div className="bubble-user-if">{msg.content}</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '14px 0' }}>
      <div className="if-avatar">🛵</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6 }}>Expert iFood — Alcance+</div>
        <div
          className="bubble-if"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
        />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IFoodPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `## Olá! Sou o Expert iFood da Alcance+

Especialista completo em **iFood, delivery e cardápio** — aqui para transformar sua loja em campeã da plataforma.

**O que posso fazer por você:**

- 📋 Analisar e otimizar seu cardápio completo
- 🏆 Identificar os produtos com maior potencial de venda
- 💰 Calcular precificação ideal com margem saudável
- 📈 Estratégia para ranquear melhor no algoritmo do iFood
- ⭐ Protocolo de avaliações para chegar no 4.5+
- 📸 Guia de fotografia de comida com celular
- 🎯 Campanhas iFood Ads com ROI positivo
- 🚀 Plano de crescimento 30/60/90 dias
- 📦 Embalagem e fidelização de clientes

**Me conte sobre sua loja:** segmento, cidade, produtos que você vende e qual é o principal desafio hoje. Vou te dar um diagnóstico completo e um plano de ação.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeGroup, setActiveGroup] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: text }
    const loadingMsg: Message = { role: 'assistant', content: '', loading: true }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setLoading(true)

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/ifood/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: data.message },
      ])
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Erro desconhecido'
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: `**Erro:** ${errMsg}\n\nVerifique se ANTHROPIC_API_KEY está configurado no .env.local`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  const group = QUICK_GROUPS[activeGroup]

  return (
    <>
      <style>{`
        :root {
          --if: #E8002D;
          --ifb: rgba(232,0,45,.08);
          --if2: #FF6B00;
        }

        .ifood-wrap {
          display: flex; height: 100vh; flex-direction: column;
          background: var(--bk);
        }

        /* ── Header ── */
        .ifood-header {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(232,0,45,.12);
          background: var(--bk2);
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .ifood-header-left { display: flex; align-items: center; gap: 12px; }
        .ifood-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #E8002D, #FF6B00);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 16px rgba(232,0,45,.35);
        }
        .ifood-title { font-size: 16px; font-weight: 700; color: var(--wh); }
        .ifood-sub { font-size: 11px; color: var(--gr3); margin-top: 1px; }

        .if-stats {
          display: flex; gap: 8px;
        }
        .if-stat {
          padding: 5px 12px;
          background: var(--bk3);
          border: 1px solid var(--gr);
          border-radius: 8px;
          text-align: center;
        }
        .if-stat-val { font-size: 13px; font-weight: 800; color: var(--wh); }
        .if-stat-lbl { font-size: 9px; color: var(--gr3); text-transform: uppercase; letter-spacing: .06em; }

        /* ── Body ── */
        .ifood-body { display: flex; flex: 1; min-height: 0; }

        /* ── Panel ── */
        .if-panel {
          width: 236px; flex-shrink: 0;
          background: var(--bk2);
          border-right: 1px solid rgba(232,0,45,.08);
          display: flex; flex-direction: column;
          overflow: hidden;
        }

        .if-tabs {
          padding: 10px 8px 8px;
          border-bottom: 1px solid var(--gr);
          display: flex; flex-direction: column; gap: 2px;
        }
        .if-tab {
          width: 100%; text-align: left;
          padding: 7px 10px; border-radius: 7px;
          background: transparent; border: 1px solid transparent;
          cursor: pointer; font-size: 11px; font-weight: 600;
          color: var(--gr3); transition: .15s;
          display: flex; align-items: center; gap: 7px;
        }
        .if-tab:hover { color: var(--lgt); background: var(--bk3); }
        .if-tab--active { color: var(--wh) !important; background: var(--bk3) !important; border-color: var(--gr) !important; }
        .if-tab-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        .if-items { padding: 10px 8px; overflow-y: auto; flex: 1; }
        .if-item {
          width: 100%; text-align: left;
          padding: 10px; margin-bottom: 5px;
          background: var(--bk3); border: 1px solid var(--gr);
          border-radius: 8px; cursor: pointer;
          color: var(--lgt); font-size: 11.5px; line-height: 1.4;
          transition: .15s;
          display: flex; align-items: flex-start; gap: 8px;
        }
        .if-item:hover { background: var(--ifb); border-color: var(--if); color: var(--wh); }
        .if-item:disabled { opacity: .4; cursor: not-allowed; }
        .if-item-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }

        /* ── Dica rápida ── */
        .if-tip {
          margin: 0 8px 10px;
          padding: 10px 12px;
          background: rgba(232,0,45,.06);
          border: 1px solid rgba(232,0,45,.15);
          border-radius: 8px;
          font-size: 10.5px; color: var(--gr3); line-height: 1.5;
        }
        .if-tip strong { color: #E8002D; }

        /* ── Chat ── */
        .if-chat { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .if-scroll { flex: 1; overflow-y: auto; padding: 20px 28px; }

        /* ── Bubbles ── */
        .if-avatar {
          width: 32px; height: 32px; flex-shrink: 0;
          background: linear-gradient(135deg, #E8002D, #FF6B00);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .bubble-user-if {
          max-width: 65%;
          background: linear-gradient(135deg, #E8002D, #c0001f);
          color: #fff;
          padding: 10px 14px;
          border-radius: 16px 16px 4px 16px;
          font-size: 13px; line-height: 1.5; font-weight: 500;
        }
        .bubble-if {
          background: var(--bk3);
          border: 1px solid var(--gr);
          padding: 14px 18px;
          border-radius: 4px 16px 16px 16px;
          font-size: 13px; line-height: 1.7;
          color: var(--lgt);
          max-width: 820px;
        }
        .bubble-if table { font-size: 12px; }
        .bubble-if td { color: var(--lgt); }
        .bubble-if td:first-child { color: var(--wh); font-weight: 600; }

        /* ── Typing ── */
        .typing-dots { display: flex; gap: 4px; align-items: center; height: 20px; }
        .typing-dots span {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--if);
          animation: bounce .9s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: .15s; }
        .typing-dots span:nth-child(3) { animation-delay: .30s; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

        /* ── Input ── */
        .if-input-wrap {
          padding: 16px 28px;
          background: var(--bk2);
          border-top: 1px solid rgba(232,0,45,.08);
          flex-shrink: 0;
        }
        .if-form { display: flex; gap: 10px; align-items: flex-end; }
        .if-textarea {
          flex: 1;
          background: var(--bk3); border: 1px solid var(--gr);
          border-radius: 10px; padding: 10px 14px;
          color: var(--lgt); font-size: 13px; line-height: 1.5;
          resize: none; min-height: 42px; max-height: 140px;
          transition: .15s; font-family: var(--f);
        }
        .if-textarea:focus { outline: none; border-color: var(--if); box-shadow: 0 0 0 2px var(--ifb); }
        .if-textarea::placeholder { color: var(--gr2); }
        .if-send {
          width: 42px; height: 42px; flex-shrink: 0;
          background: linear-gradient(135deg, #E8002D, #FF6B00);
          border: none; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: .15s;
        }
        .if-send:hover { opacity: .85; }
        .if-send:disabled { opacity: .4; cursor: not-allowed; }
        .if-send svg { width: 18px; height: 18px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
        .if-hint { font-size: 10px; color: var(--gr3); margin-top: 6px; }
      `}</style>

      <div className="ifood-wrap">
        {/* Header */}
        <div className="ifood-header">
          <div className="ifood-header-left">
            <div className="ifood-icon">🛵</div>
            <div>
              <div className="ifood-title">Expert iFood & Delivery</div>
              <div className="ifood-sub">Claude Opus 4.7 · Estrategista de Cardápio e Performance · Alcance+</div>
            </div>
          </div>
          <div className="if-stats">
            <div className="if-stat">
              <div className="if-stat-val">4.5+</div>
              <div className="if-stat-lbl">Meta Avaliação</div>
            </div>
            <div className="if-stat">
              <div className="if-stat-val">90%+</div>
              <div className="if-stat-lbl">Aceitação</div>
            </div>
            <div className="if-stat">
              <div className="if-stat-val">5x</div>
              <div className="if-stat-lbl">ROAS Ads</div>
            </div>
          </div>
        </div>

        <div className="ifood-body">
          {/* Panel */}
          <div className="if-panel">
            <div className="if-tabs">
              {QUICK_GROUPS.map((g, i) => (
                <button
                  key={g.label}
                  className={`if-tab${activeGroup === i ? ' if-tab--active' : ''}`}
                  onClick={() => setActiveGroup(i)}
                >
                  <span className="if-tab-dot" style={{ background: g.color }} />
                  {g.label}
                </button>
              ))}
            </div>
            <div className="if-items">
              {group.items.map(item => (
                <button
                  key={item.label}
                  className="if-item"
                  disabled={loading}
                  onClick={() => send(item.cmd)}
                >
                  <span className="if-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="if-tip">
              <strong>💡 Dica do dia:</strong> Lojas com foto em 100% dos produtos vendem até <strong>40% mais</strong> do que lojas sem foto.
            </div>
          </div>

          {/* Chat */}
          <div className="if-chat">
            <div className="if-scroll">
              {messages.map((msg, i) => (
                <Bubble key={i} msg={msg} />
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="if-input-wrap">
              <form className="if-form" onSubmit={onSubmit}>
                <textarea
                  className="if-textarea"
                  placeholder="Ex: Tenho uma hamburgueria e quero saber quais produtos colocar no cardápio para vender mais no iFood..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={loading}
                  rows={1}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send(input)
                    }
                  }}
                />
                <button className="if-send" type="submit" disabled={loading || !input.trim()}>
                  <svg viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
              <div className="if-hint">Enter para enviar · Shift+Enter para nova linha</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
