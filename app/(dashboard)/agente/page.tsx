'use client'
import { useState, useRef, useEffect, FormEvent } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string
  toolsUsed?: string[]
  loading?: boolean
}

// ── Quick-action commands ─────────────────────────────────────────────────────

const QUICK_COMMANDS = [
  { label: 'Listar todas as contas', cmd: 'Liste todas as contas de anúncios disponíveis no Meta Ads, Google Ads e TikTok Ads', icon: '🏢' },
  { label: 'Campanhas ativas', cmd: 'Liste todas as campanhas ativas de todas as plataformas com status e orçamento', icon: '📢' },
  { label: 'Análise 30 dias', cmd: 'Faça uma análise completa de performance dos últimos 30 dias em todas as plataformas com recomendações', icon: '📊' },
  { label: 'Relatório semanal', cmd: 'Gere um relatório executivo comparativo dos últimos 7 dias entre Meta Ads, Google Ads e TikTok Ads', icon: '📋' },
  { label: 'Diagnóstico geral', cmd: 'Faça um diagnóstico completo de todas as campanhas em todas as plataformas — identifique problemas e oportunidades de otimização', icon: '🔍' },
  { label: 'Campanhas pausadas', cmd: 'Liste todas as campanhas pausadas em todas as plataformas e explique se devo reativá-las', icon: '⏸️' },
  { label: 'Comparar plataformas', cmd: 'Compare a performance entre Meta Ads, Google Ads e TikTok Ads — onde estou tendo melhor ROI?', icon: '⚖️' },
  { label: 'Top campanhas', cmd: 'Quais são as 5 campanhas com melhor e pior performance nos últimos 30 dias em todas as plataformas?', icon: '🏆' },
]

// ── Tool label map ────────────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  // Meta Ads
  meta_listar_contas: '📘 Meta · Listando contas',
  meta_listar_campanhas: '📘 Meta · Buscando campanhas',
  meta_obter_insights: '📘 Meta · Carregando métricas',
  meta_pausar_campanha: '📘 Meta · Pausando campanha',
  meta_ativar_campanha: '📘 Meta · Ativando campanha',
  meta_atualizar_orcamento: '📘 Meta · Atualizando orçamento',
  meta_criar_campanha: '📘 Meta · Criando campanha',
  meta_analisar_performance: '📘 Meta · Analisando performance',
  // Google Ads
  google_listar_contas: '🔵 Google · Listando contas',
  google_listar_campanhas: '🔵 Google · Buscando campanhas',
  google_obter_insights: '🔵 Google · Carregando métricas',
  google_pausar_campanha: '🔵 Google · Pausando campanha',
  google_ativar_campanha: '🔵 Google · Ativando campanha',
  google_atualizar_orcamento: '🔵 Google · Atualizando orçamento',
  google_criar_campanha: '🔵 Google · Criando campanha',
  // TikTok Ads
  tiktok_listar_contas: '🎵 TikTok · Listando contas',
  tiktok_listar_campanhas: '🎵 TikTok · Buscando campanhas',
  tiktok_obter_insights: '🎵 TikTok · Carregando métricas',
  tiktok_pausar_campanha: '🎵 TikTok · Pausando campanha',
  tiktok_ativar_campanha: '🎵 TikTok · Ativando campanha',
  tiktok_atualizar_orcamento: '🎵 TikTok · Atualizando orçamento',
  tiktok_criar_campanha: '🎵 TikTok · Criando campanha',
  // Multicanal
  relatorio_multicanal: '📊 Gerando relatório multicanal',
}

// ── Markdown-lite renderer ────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    // headers
    .replace(/^### (.+)$/gm, '<h3 style="color:var(--al);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:14px 0 6px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:var(--wh);font-size:14px;font-weight:700;margin:16px 0 8px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:var(--wh);font-size:16px;font-weight:800;margin:16px 0 8px">$1</h1>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--wh);font-weight:700">$1</strong>')
    // inline code
    .replace(/`([^`]+)`/g, '<code style="background:var(--bk4);padding:1px 5px;border-radius:4px;font-family:var(--mono);font-size:11px;color:var(--al2)">$1</code>')
    // table rows
    .replace(/^\|(.+)\|$/gm, (_, row) => {
      const cells = row.split('|').map((c: string) => c.trim())
      return '<tr>' + cells.map((c: string) => `<td style="padding:5px 10px;border-bottom:1px solid var(--gr)">${c}</td>`).join('') + '</tr>'
    })
    // separator rows inside tables
    .replace(/<tr><td[^>]*>[-: ]+<\/td>(?:<td[^>]*>[-: ]+<\/td>)*<\/tr>/g, '')
    // bullet points
    .replace(/^[-•] (.+)$/gm, '<li style="margin:3px 0;padding-left:4px">$1</li>')
    .replace(/^  [-•] (.+)$/gm, '<li style="margin:2px 0;padding-left:16px;color:var(--gr3)">$1</li>')
    // numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0;padding-left:4px;list-style-type:decimal">$1</li>')
    // wrap consecutive li tags
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/g, m => `<ul style="padding-left:16px;margin:6px 0">${m}</ul>`)
    // wrap table rows
    .replace(/(<tr>.*?<\/tr>\n?)+/g, m => `<table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:12px">${m}</table>`)
    // horizontal rule
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--gr);margin:12px 0">')
    // line breaks
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

// ── Chat bubble ───────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  if (msg.loading) {
    return (
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '12px 0' }}>
        <div className="agent-avatar">IA</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6 }}>
            Agente Alcance+
          </div>
          <div className="bubble-agent">
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </div>
          {msg.toolsUsed && msg.toolsUsed.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {msg.toolsUsed.map(t => (
                <span key={t} className="tool-chip tool-chip--active">
                  ⚡ {TOOL_LABELS[t] || t}…
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '12px 0' }}>
        <div className="bubble-user">{msg.content}</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '12px 0' }}>
      <div className="agent-avatar">IA</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6 }}>
          Agente Alcance+
        </div>
        <div
          className="bubble-agent"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
        />
        {msg.toolsUsed && msg.toolsUsed.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {msg.toolsUsed.map(t => (
              <span key={t} className="tool-chip">
                ✓ {TOOL_LABELS[t] || t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgentePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '## Olá! Sou o Agente IA da Alcance+\n\nEstou conectado às APIs do **Meta Ads**, **Google Ads** e **TikTok Ads** e posso gerenciar todas as campanhas dos seus clientes em tempo real.\n\n**O que posso fazer agora:**\n\n- 📊 Analisar performance com dados reais em todas as plataformas\n- ⚡ Pausar ou ativar campanhas (Meta, Google, TikTok)\n- 💰 Ajustar orçamentos\n- 🆕 Criar novas campanhas\n- 📋 Gerar relatórios executivos comparativos\n- 🔍 Diagnosticar problemas e oportunidades\n- ⚖️ Comparar performance entre plataformas\n\nComo posso ajudar você hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', content: text }
    const loadingMsg: Message = {
      role: 'assistant',
      content: '',
      loading: true,
      toolsUsed: [],
    }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setLoading(true)

    // Build conversation history (exclude the loading placeholder)
    const history = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await fetch('/api/agente/chat', {
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
        {
          role: 'assistant',
          content: data.message,
          toolsUsed: data.toolsUsed || [],
        },
      ])
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Erro desconhecido'
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: `**Erro:** ${errMsg}\n\nVerifique se as credenciais estão configuradas no .env.local:\n- ANTHROPIC_API_KEY\n- META_ADS_ACCESS_TOKEN\n- GOOGLE_ADS_DEVELOPER_TOKEN + CLIENT_ID + CLIENT_SECRET + REFRESH_TOKEN\n- TIKTOK_ADS_ACCESS_TOKEN`,
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

  return (
    <>
      <style>{`
        .agente-wrap {
          display: flex;
          height: 100vh;
          flex-direction: column;
          background: var(--bk);
        }
        /* ── Header ── */
        .agente-header {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(0,196,180,.08);
          background: var(--bk2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .agente-header-left { display: flex; align-items: center; gap: 12px; }
        .agente-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, var(--al), #006B8A);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 16px rgba(0,196,180,.3);
        }
        .agente-title { font-size: 16px; font-weight: 700; color: var(--wh); }
        .agente-sub { font-size: 11px; color: var(--gr3); margin-top: 1px; }
        .status-pill {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          background: rgba(34,197,94,.1);
          border: 1px solid rgba(34,197,94,.2);
          border-radius: 20px;
          font-size: 10px; font-weight: 700; color: var(--ok);
        }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--ok);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        /* ── Body ── */
        .agente-body { display: flex; flex: 1; min-height: 0; }

        /* ── Sidebar quick commands ── */
        .quick-panel {
          width: 220px; flex-shrink: 0;
          background: var(--bk2);
          border-right: 1px solid rgba(0,196,180,.08);
          padding: 16px 12px;
          overflow-y: auto;
        }
        .quick-title {
          font-size: 9px; font-weight: 700; color: var(--gr3);
          text-transform: uppercase; letter-spacing: .12em;
          margin-bottom: 10px; padding-left: 4px;
        }
        .quick-btn {
          width: 100%; text-align: left;
          padding: 9px 10px; margin-bottom: 4px;
          background: var(--bk3);
          border: 1px solid var(--gr);
          border-radius: 8px;
          color: var(--lgt); font-size: 11.5px; cursor: pointer;
          transition: .15s;
          display: flex; align-items: center; gap: 7px;
        }
        .quick-btn:hover {
          border-color: var(--al);
          background: var(--alb);
          color: var(--wh);
        }
        .quick-btn:disabled { opacity: .4; cursor: not-allowed; }
        .quick-icon { font-size: 14px; flex-shrink: 0; }

        /* ── Chat area ── */
        .chat-area {
          flex: 1; display: flex; flex-direction: column; min-width: 0;
        }
        .chat-scroll {
          flex: 1; overflow-y: auto; padding: 20px 24px;
        }

        /* ── Bubbles ── */
        .agent-avatar {
          width: 30px; height: 30px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--al), #006B8A);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 800; color: #fff;
        }
        .bubble-user {
          max-width: 65%;
          background: var(--al);
          color: #000;
          padding: 10px 14px;
          border-radius: 16px 16px 4px 16px;
          font-size: 13px; line-height: 1.5;
          font-weight: 500;
        }
        .bubble-agent {
          background: var(--bk3);
          border: 1px solid var(--gr);
          padding: 12px 16px;
          border-radius: 4px 16px 16px 16px;
          font-size: 13px; line-height: 1.65;
          color: var(--lgt);
          max-width: 780px;
        }
        .bubble-agent table { font-size: 12px; }
        .bubble-agent td { color: var(--lgt); }
        .bubble-agent td:first-child { color: var(--wh); font-weight: 600; }

        /* ── Typing indicator ── */
        .typing-dots { display: flex; gap: 4px; align-items: center; height: 20px; }
        .typing-dots span {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--al);
          animation: bounce .9s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: .15s; }
        .typing-dots span:nth-child(3) { animation-delay: .30s; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

        /* ── Tool chips ── */
        .tool-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px;
          background: var(--bk4);
          border: 1px solid var(--gr);
          border-radius: 20px;
          font-size: 10px; color: var(--gr3);
          font-family: var(--mono);
        }
        .tool-chip--active {
          border-color: var(--al);
          color: var(--al);
          background: var(--alb);
        }

        /* ── Input ── */
        .chat-input-wrap {
          padding: 16px 24px;
          background: var(--bk2);
          border-top: 1px solid rgba(0,196,180,.08);
          flex-shrink: 0;
        }
        .chat-form { display: flex; gap: 10px; align-items: flex-end; }
        .chat-textarea {
          flex: 1;
          background: var(--bk3);
          border: 1px solid var(--gr);
          border-radius: 10px;
          padding: 10px 14px;
          color: var(--lgt);
          font-size: 13px; line-height: 1.5;
          resize: none; min-height: 42px; max-height: 140px;
          transition: .15s;
          font-family: var(--f);
        }
        .chat-textarea:focus { outline: none; border-color: var(--al); box-shadow: 0 0 0 2px var(--alb); }
        .chat-textarea::placeholder { color: var(--gr2); }
        .chat-send {
          width: 42px; height: 42px; flex-shrink: 0;
          background: var(--al);
          border: none; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: .15s;
        }
        .chat-send:hover { background: var(--al2); }
        .chat-send:disabled { opacity: .4; cursor: not-allowed; }
        .chat-send svg { width: 18px; height: 18px; fill: none; stroke: #000; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }

        .chat-hint { font-size: 10px; color: var(--gr3); margin-top: 6px; }
      `}</style>

      <div className="agente-wrap">
        {/* Header */}
        <div className="agente-header">
          <div className="agente-header-left">
            <div className="agente-icon">🤖</div>
            <div>
              <div className="agente-title">Agente IA — Gestor de Tráfego</div>
              <div className="agente-sub">Claude Opus 4.7 · Meta · Google · TikTok · Alcance+</div>
            </div>
          </div>
          <div className="status-pill">
            <div className="status-dot" />
            Online
          </div>
        </div>

        <div className="agente-body">
          {/* Quick commands sidebar */}
          <div className="quick-panel">
            <div className="quick-title">Ações Rápidas</div>
            {QUICK_COMMANDS.map(q => (
              <button
                key={q.label}
                className="quick-btn"
                disabled={loading}
                onClick={() => send(q.cmd)}
              >
                <span className="quick-icon">{q.icon}</span>
                {q.label}
              </button>
            ))}

            <div style={{ marginTop: 20 }}>
              <div className="quick-title">Configuração</div>
              <div style={{ fontSize: 10.5, color: 'var(--gr3)', lineHeight: 1.6, padding: '4px 4px' }}>
                Configure no <code style={{ color: 'var(--al)', fontFamily: 'var(--mono)', fontSize: 10 }}>.env.local</code>:
                <br /><br />
                <code style={{ color: 'var(--lgt)', fontFamily: 'var(--mono)', fontSize: 10, display: 'block', marginBottom: 3 }}>ANTHROPIC_API_KEY=</code>
                <code style={{ color: 'var(--lgt)', fontFamily: 'var(--mono)', fontSize: 10, display: 'block', marginBottom: 3 }}>META_ADS_ACCESS_TOKEN=</code>
                <code style={{ color: 'var(--lgt)', fontFamily: 'var(--mono)', fontSize: 10, display: 'block', marginBottom: 3 }}>GOOGLE_ADS_DEVELOPER_TOKEN=</code>
                <code style={{ color: 'var(--lgt)', fontFamily: 'var(--mono)', fontSize: 10, display: 'block' }}>TIKTOK_ADS_ACCESS_TOKEN=</code>
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div className="chat-area">
            <div className="chat-scroll">
              {messages.map((msg, i) => (
                <Bubble key={i} msg={msg} />
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="chat-input-wrap">
              <form className="chat-form" onSubmit={onSubmit}>
                <textarea
                  className="chat-textarea"
                  placeholder="Pergunte ao agente... (ex: Analise as campanhas do cliente X nos últimos 30 dias)"
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
                <button className="chat-send" type="submit" disabled={loading || !input.trim()}>
                  <svg viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
              <div className="chat-hint">Enter para enviar · Shift+Enter para nova linha</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
