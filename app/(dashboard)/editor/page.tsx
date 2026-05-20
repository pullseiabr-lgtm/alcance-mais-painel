'use client'
import { useState, useRef, useEffect, FormEvent } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

// ── Quick commands por nicho ──────────────────────────────────────────────────

const QUICK_GROUPS = [
  {
    label: 'Reels & TikTok',
    color: '#FF2D55',
    items: [
      { label: 'Reel viral', cmd: 'Crie um roteiro completo para um Reel viral de alto engajamento. Quero hook forte, cortes dinâmicos e estratégia de viralização.', icon: '🔥' },
      { label: 'Hook de 3 segundos', cmd: 'Me dê 5 opções de hooks irresistíveis para os primeiros 3 segundos de um Reel — deve parar o scroll imediatamente.', icon: '⚡' },
      { label: 'Legendas virais', cmd: 'Crie legendas no estilo TikTok viral para um vídeo de produto. Quero palavras destacadas, animadas e impactantes.', icon: '📝' },
    ],
  },
  {
    label: 'Anúncios & Vendas',
    color: '#FF9500',
    items: [
      { label: 'Anúncio de produto', cmd: 'Crie um roteiro completo para anúncio de produto para tráfego pago. Estrutura: Hook → Problema → Desejo → Solução → CTA. Duração: 30 segundos.', icon: '🎯' },
      { label: 'Story de vendas', cmd: 'Monte uma sequência de Stories de vendas com urgência, prova social e CTA irresistível.', icon: '📱' },
      { label: 'Anúncio A/B', cmd: 'Crie duas versões (A e B) de anúncio em vídeo para testar. Versão A mais emocional, versão B mais racional.', icon: '⚖️' },
    ],
  },
  {
    label: 'Food & Restaurante',
    color: '#FF6B35',
    items: [
      { label: 'Vídeo de comida', cmd: 'Crie roteiro cinematográfico para vídeo de comida — slow motion, ASMR, queijo puxando, vapor. Quero fazer o cliente salivar.', icon: '🍔' },
      { label: 'Reel de delivery', cmd: 'Monte roteiro de Reel para delivery com foco em velocidade, praticidade e desejo imediato pela comida.', icon: '🛵' },
      { label: 'Lançamento de prato', cmd: 'Roteiro completo para lançamento de novo prato no Instagram — deve gerar filas e reservas imediatas.', icon: '🍽️' },
    ],
  },
  {
    label: 'Moda & Lifestyle',
    color: '#BF5AF2',
    items: [
      { label: 'Look do dia', cmd: 'Crie roteiro de Reel "look do dia" cinematográfico para moda — walking shot, transições de roupa, música atual.', icon: '👗' },
      { label: 'Vídeo lifestyle', cmd: 'Monte sequência de vídeo lifestyle premium para marca — estética clean, cinematográfica e aspiracional.', icon: '✨' },
    ],
  },
  {
    label: 'Eventos',
    color: '#30D158',
    items: [
      { label: 'Teaser de evento', cmd: 'Crie teaser misterioso e urgente para divulgar evento — deve gerar curiosidade e antecipação máxima.', icon: '🎪' },
      { label: 'Highlight pós-evento', cmd: 'Monte roteiro de highlight pós-evento com os melhores momentos — dinâmico, épico e emocional.', icon: '🎬' },
    ],
  },
]

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="color:var(--ed);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:16px 0 6px;display:flex;align-items:center;gap:6px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:var(--wh);font-size:14px;font-weight:700;margin:16px 0 8px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:var(--wh);font-size:16px;font-weight:800;margin:16px 0 8px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--wh);font-weight:700">$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bk4);padding:1px 6px;border-radius:4px;font-family:var(--mono);font-size:11px;color:#FF9500">$1</code>')
    .replace(/^───+$/gm, '<hr style="border:none;border-top:1px solid var(--gr);margin:14px 0">')
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => c.trim())
      return '<tr>' + cells.map((c: string) => `<td style="padding:6px 12px;border-bottom:1px solid var(--gr)">${c}</td>`).join('') + '</tr>'
    })
    .replace(/<tr><td[^>]*>[-: ]+<\/td>(?:<td[^>]*>[-: ]+<\/td>)*<\/tr>/g, '')
    .replace(/^[-•] (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
    .replace(/^  [-•] (.+)$/gm, '<li style="margin:2px 0;padding-left:16px;color:var(--gr3)">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:5px 0;padding-left:4px">$1</li>')
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/g, m => `<ul style="padding-left:18px;margin:6px 0">${m}</ul>`)
    .replace(/(<tr>.*?<\/tr>\n?)+/g, m => `<table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:12px">${m}</table>`)
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--gr);margin:12px 0">')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

// ── Bubble ────────────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  if (msg.loading) {
    return (
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '14px 0' }}>
        <div className="ed-avatar">🎬</div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6 }}>Editor IA — Alcance+</div>
          <div className="bubble-ed">
            <div className="typing-dots"><span /><span /><span /></div>
          </div>
        </div>
      </div>
    )
  }

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '14px 0' }}>
        <div className="bubble-user-ed">{msg.content}</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '14px 0' }}>
      <div className="ed-avatar">🎬</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6 }}>Editor IA — Alcance+</div>
        <div
          className="bubble-ed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
        />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `## Olá! Sou o Editor de Vídeos IA da Alcance+

Penso como um **diretor criativo** e edito como um profissional das maiores agências do mundo.

**O que posso criar para você:**

- 🔥 Reels e TikToks virais com hooks irresistíveis
- 🎯 Anúncios em vídeo de alta conversão
- 🍔 Vídeos cinematográficos para food & restaurantes
- 👗 Conteúdo premium de moda e lifestyle
- 🎪 Teasers e highlights de eventos
- ✂️ Roteiros de edição completos — cena por cena
- 📝 Legendas animadas estilo viral
- 🎵 Seleção de música e sound design

**Me conte sobre o seu vídeo:** qual o produto, nicho, objetivo e plataforma. Eu entrego o roteiro completo e pronto para executar.`,
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
      const res = await fetch('/api/editor/chat', {
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
        { role: 'assistant', content: `**Erro:** ${errMsg}\n\nVerifique se ANTHROPIC_API_KEY está configurado no .env.local` },
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
        :root { --ed: #FF9500; --edb: rgba(255,149,0,.08); --ed2: #FF6B35; }

        .editor-wrap {
          display: flex; height: 100vh; flex-direction: column;
          background: var(--bk);
        }

        /* ── Header ── */
        .editor-header {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255,149,0,.1);
          background: var(--bk2);
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .editor-header-left { display: flex; align-items: center; gap: 12px; }
        .editor-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #FF9500, #FF2D55);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 16px rgba(255,149,0,.3);
        }
        .editor-title { font-size: 16px; font-weight: 700; color: var(--wh); }
        .editor-sub { font-size: 11px; color: var(--gr3); margin-top: 1px; }
        .ed-badges { display: flex; gap: 6px; }
        .ed-badge {
          padding: 3px 8px; border-radius: 20px;
          font-size: 9px; font-weight: 700;
          border: 1px solid;
        }
        .ed-badge--r { color: #FF2D55; border-color: rgba(255,45,85,.3); background: rgba(255,45,85,.08); }
        .ed-badge--g { color: #FF9500; border-color: rgba(255,149,0,.3); background: rgba(255,149,0,.08); }
        .ed-badge--t { color: #BF5AF2; border-color: rgba(191,90,242,.3); background: rgba(191,90,242,.08); }

        /* ── Body ── */
        .editor-body { display: flex; flex: 1; min-height: 0; }

        /* ── Quick panel ── */
        .ed-panel {
          width: 230px; flex-shrink: 0;
          background: var(--bk2);
          border-right: 1px solid rgba(255,149,0,.08);
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .ed-tabs {
          display: flex; flex-direction: column; gap: 2px;
          padding: 12px 10px 8px;
          border-bottom: 1px solid var(--gr);
        }
        .ed-tab {
          width: 100%; text-align: left; padding: 7px 10px;
          background: transparent; border: 1px solid transparent;
          border-radius: 7px; cursor: pointer;
          font-size: 11px; font-weight: 600;
          color: var(--gr3); transition: .15s;
          display: flex; align-items: center; gap: 6px;
        }
        .ed-tab:hover { color: var(--lgt); background: var(--bk3); }
        .ed-tab--active { color: var(--wh) !important; background: var(--bk3) !important; border-color: var(--gr) !important; }
        .ed-tab-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        .ed-items { padding: 10px; overflow-y: auto; flex: 1; }
        .ed-item {
          width: 100%; text-align: left;
          padding: 10px 10px; margin-bottom: 5px;
          background: var(--bk3); border: 1px solid var(--gr);
          border-radius: 8px; cursor: pointer;
          color: var(--lgt); font-size: 11.5px; line-height: 1.4;
          transition: .15s;
          display: flex; align-items: flex-start; gap: 8px;
        }
        .ed-item:hover {
          background: var(--edb);
          color: var(--wh);
        }
        .ed-item:hover { border-color: var(--ed); }
        .ed-item:disabled { opacity: .4; cursor: not-allowed; }
        .ed-item-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

        /* ── Chat area ── */
        .ed-chat { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .ed-scroll { flex: 1; overflow-y: auto; padding: 20px 28px; }

        /* ── Bubbles ── */
        .ed-avatar {
          width: 32px; height: 32px; flex-shrink: 0;
          background: linear-gradient(135deg, #FF9500, #FF2D55);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .bubble-user-ed {
          max-width: 65%;
          background: linear-gradient(135deg, #FF9500, #FF6B35);
          color: #000;
          padding: 10px 14px;
          border-radius: 16px 16px 4px 16px;
          font-size: 13px; line-height: 1.5; font-weight: 600;
        }
        .bubble-ed {
          background: var(--bk3);
          border: 1px solid var(--gr);
          padding: 14px 18px;
          border-radius: 4px 16px 16px 16px;
          font-size: 13px; line-height: 1.7;
          color: var(--lgt);
          max-width: 820px;
        }
        .bubble-ed table { font-size: 12px; }
        .bubble-ed td { color: var(--lgt); }
        .bubble-ed td:first-child { color: var(--wh); font-weight: 600; }
        .bubble-ed ul { color: var(--lgt); }
        .bubble-ed strong { color: var(--wh); }

        /* ── Typing ── */
        .typing-dots { display: flex; gap: 4px; align-items: center; height: 20px; }
        .typing-dots span {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--ed);
          animation: bounce .9s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: .15s; }
        .typing-dots span:nth-child(3) { animation-delay: .30s; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

        /* ── Input ── */
        .ed-input-wrap {
          padding: 16px 28px;
          background: var(--bk2);
          border-top: 1px solid rgba(255,149,0,.08);
          flex-shrink: 0;
        }
        .ed-form { display: flex; gap: 10px; align-items: flex-end; }
        .ed-textarea {
          flex: 1;
          background: var(--bk3); border: 1px solid var(--gr);
          border-radius: 10px; padding: 10px 14px;
          color: var(--lgt); font-size: 13px; line-height: 1.5;
          resize: none; min-height: 42px; max-height: 140px;
          transition: .15s; font-family: var(--f);
        }
        .ed-textarea:focus { outline: none; border-color: var(--ed); box-shadow: 0 0 0 2px var(--edb); }
        .ed-textarea::placeholder { color: var(--gr2); }
        .ed-send {
          width: 42px; height: 42px; flex-shrink: 0;
          background: linear-gradient(135deg, #FF9500, #FF2D55);
          border: none; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: .15s;
        }
        .ed-send:hover { opacity: .85; }
        .ed-send:disabled { opacity: .4; cursor: not-allowed; }
        .ed-send svg { width: 18px; height: 18px; fill: none; stroke: #fff; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
        .ed-hint { font-size: 10px; color: var(--gr3); margin-top: 6px; }
      `}</style>

      <div className="editor-wrap">
        {/* Header */}
        <div className="editor-header">
          <div className="editor-header-left">
            <div className="editor-icon">🎬</div>
            <div>
              <div className="editor-title">Editor de Vídeos IA</div>
              <div className="editor-sub">Claude Opus 4.7 · Diretor Criativo Premium · Alcance+</div>
            </div>
          </div>
          <div className="ed-badges">
            <span className="ed-badge ed-badge--r">Reels</span>
            <span className="ed-badge ed-badge--g">Anúncios</span>
            <span className="ed-badge ed-badge--t">TikTok</span>
          </div>
        </div>

        <div className="editor-body">
          {/* Quick panel */}
          <div className="ed-panel">
            <div className="ed-tabs">
              {QUICK_GROUPS.map((g, i) => (
                <button
                  key={g.label}
                  className={`ed-tab${activeGroup === i ? ' ed-tab--active' : ''}`}
                  onClick={() => setActiveGroup(i)}
                >
                  <span className="ed-tab-dot" style={{ background: g.color }} />
                  {g.label}
                </button>
              ))}
            </div>
            <div className="ed-items">
              {group.items.map(item => (
                <button
                  key={item.label}
                  className="ed-item"
                  disabled={loading}
                  onClick={() => send(item.cmd)}
                >
                  <span className="ed-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="ed-chat">
            <div className="ed-scroll">
              {messages.map((msg, i) => (
                <Bubble key={i} msg={msg} />
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="ed-input-wrap">
              <form className="ed-form" onSubmit={onSubmit}>
                <textarea
                  className="ed-textarea"
                  placeholder="Descreva o vídeo: produto, nicho, objetivo e plataforma... (ex: Reel viral para hamburguer artesanal no Instagram)"
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
                <button className="ed-send" type="submit" disabled={loading || !input.trim()}>
                  <svg viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
              <div className="ed-hint">Enter para enviar · Shift+Enter para nova linha</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
