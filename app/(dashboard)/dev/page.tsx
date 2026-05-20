'use client'
import { useState, useRef, useEffect, FormEvent } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

const QUICK_GROUPS = [
  {
    label: 'Instalação',
    color: '#00D4AA',
    items: [
      { label: 'Instalar Alcance+', cmd: 'Me dê o passo a passo completo para instalar o sistema Alcance+ no meu computador Windows do zero, incluindo Node.js, dependências e como rodar o projeto.', icon: '💻' },
      { label: 'Instalar Node.js', cmd: 'Como instalar o Node.js no Windows 11? Me dê o passo a passo completo com onde baixar e como configurar.', icon: '📦' },
      { label: 'Configurar .env', cmd: 'Me explique como criar e configurar o arquivo .env.local para o Alcance+. Quais variáveis são obrigatórias e onde pego cada chave.', icon: '🔑' },
      { label: 'Corrigir erros npm', cmd: 'Ao rodar npm install ou npm run dev estou recebendo erros. Como diagnosticar e resolver os erros mais comuns do Node.js/Next.js?', icon: '🔧' },
    ],
  },
  {
    label: 'WhatsApp',
    color: '#25D366',
    items: [
      { label: 'Instalar Evolution API', cmd: 'Me dê o passo a passo completo para instalar a Evolution API no Windows ou em um servidor, conectar meu WhatsApp e integrar com o Alcance+.', icon: '💬' },
      { label: 'Configurar webhook', cmd: 'Como configurar o webhook do WhatsApp no Evolution API para receber mensagens e responder automaticamente com o Agente IA da Alcance+?', icon: '🪝' },
      { label: 'Testar integração', cmd: 'Como testar se a integração do WhatsApp com o Agente IA está funcionando corretamente? Me dê um checklist completo.', icon: '✅' },
    ],
  },
  {
    label: 'Deploy',
    color: '#6366F1',
    items: [
      { label: 'Deploy na Vercel', cmd: 'Como fazer o deploy do Alcance+ na Vercel de graça? Me dê o passo a passo completo desde criar a conta até o site estar no ar.', icon: '🚀' },
      { label: 'Deploy no Railway', cmd: 'Como fazer o deploy do Alcance+ no Railway? Me dê o passo a passo completo incluindo configuração de banco de dados e variáveis de ambiente.', icon: '🚂' },
      { label: 'Configurar domínio', cmd: 'Como conectar um domínio personalizado ao meu projeto na Vercel? Me explique como apontar o DNS e configurar HTTPS.', icon: '🌐' },
      { label: 'VPS Ubuntu', cmd: 'Como instalar e rodar o Alcance+ em um servidor VPS Ubuntu do zero? Inclua instalação do Node.js, PM2, Nginx e SSL com Let\'s Encrypt.', icon: '🖥️' },
    ],
  },
  {
    label: 'Supabase',
    color: '#3ECF8E',
    items: [
      { label: 'Configurar Supabase', cmd: 'Me dê o passo a passo completo para criar um projeto no Supabase, criar as tabelas do Alcance+ e configurar a autenticação.', icon: '🗄️' },
      { label: 'Criar tabelas SQL', cmd: 'Como executar o SQL de migration do Alcance+ no Supabase para criar todas as tabelas? Me mostre o processo completo.', icon: '📊' },
      { label: 'Resolver erro Supabase', cmd: 'Estou com erro de conexão com o Supabase. Como diagnosticar e resolver problemas de URL, chave anon e autenticação?', icon: '❌' },
    ],
  },
  {
    label: 'Desenvolvimento',
    color: '#F59E0B',
    items: [
      { label: 'Nova página', cmd: 'Como criar uma nova página no Alcance+ com Next.js App Router? Me mostre o código completo com layout, componentes e estilo do sistema.', icon: '📄' },
      { label: 'Nova API route', cmd: 'Como criar uma nova rota de API no Next.js dentro do Alcance+? Me mostre o código completo com tratamento de erros e tipagem TypeScript.', icon: '⚡' },
      { label: 'Novo agente IA', cmd: 'Como criar um novo agente IA no Alcance+ seguindo o mesmo padrão dos agentes existentes? Me mostre o código completo da API route e da página de chat.', icon: '🤖' },
      { label: 'Integrar nova API', cmd: 'Como integrar uma nova API externa no Alcance+? Me explique o padrão usado no projeto e mostre um exemplo completo.', icon: '🔌' },
    ],
  },
  {
    label: 'Erros & Debug',
    color: '#EF4444',
    items: [
      { label: 'Erro TypeScript', cmd: 'Estou com erros de TypeScript no projeto. Como identificar, entender e corrigir os erros mais comuns em um projeto Next.js com strict mode?', icon: '🐛' },
      { label: 'Erro de build', cmd: 'O comando npm run build está falhando. Como diagnosticar erros de build no Next.js e corrigi-los?', icon: '💥' },
      { label: 'Erro de CORS', cmd: 'Estou recebendo erro de CORS nas chamadas de API. Como configurar o Next.js para resolver problemas de CORS corretamente?', icon: '🚫' },
    ],
  },
]

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 style="color:#00D4AA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:16px 0 6px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:var(--wh);font-size:14px;font-weight:700;margin:16px 0 8px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:var(--wh);font-size:16px;font-weight:800;margin:16px 0 8px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--wh);font-weight:700">$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code style="background:#0D1117;border:1px solid #30363d;padding:1px 6px;border-radius:4px;font-family:var(--mono);font-size:11px;color:#79C0FF">$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/gm, (_, lang, code) =>
      `<pre style="background:#0D1117;border:1px solid #30363d;border-radius:8px;padding:14px 16px;margin:10px 0;overflow-x:auto;font-family:var(--mono);font-size:12px;line-height:1.6;color:#E6EDF3">${lang ? `<span style="color:#8B949E;font-size:10px;display:block;margin-bottom:8px">${lang.toUpperCase()}</span>` : ''}${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`,
    )
    .replace(/^[-•] (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
    .replace(/^  [-•] (.+)$/gm, '<li style="margin:2px 0;padding-left:16px;color:var(--gr3)">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:5px 0;padding-left:4px">$1</li>')
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/g, m => `<ul style="padding-left:18px;margin:6px 0">${m}</ul>`)
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--gr);margin:12px 0">')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'

  if (msg.loading) {
    return (
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '14px 0' }}>
        <div className="dev-avatar">{'</>'}</div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6 }}>Dev IA — Alcance+</div>
          <div className="bubble-dev">
            <div className="typing-dots"><span /><span /><span /></div>
          </div>
        </div>
      </div>
    )
  }

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '14px 0' }}>
        <div className="bubble-user-dev">{msg.content}</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '14px 0' }}>
      <div className="dev-avatar">{'</>'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6 }}>Dev IA — Alcance+</div>
        <div
          className="bubble-dev"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
        />
      </div>
    </div>
  )
}

export default function DevPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `## Olá! Sou o Developer IA da Alcance+

Sou um programador sênior full-stack e posso fazer **todo o trabalho técnico** por você — instalar, configurar, desenvolver e corrigir erros.

**O que posso fazer:**

- 💻 Instalar o Alcance+ no seu computador passo a passo
- 💬 Integrar WhatsApp com os agentes IA (Evolution API)
- 🚀 Fazer deploy na Vercel, Railway ou VPS
- 🗄️ Configurar Supabase do zero
- 🤖 Criar novos agentes e páginas no sistema
- 🔧 Corrigir erros de TypeScript, build e dependências
- 🔌 Integrar qualquer API externa

**Como usar:** descreva o que você quer instalar ou desenvolver, ou clique em uma ação rápida. Vou entregar o código e os comandos completos prontos para executar.`,
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
      const res = await fetch('/api/dev/chat', {
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
        :root { --dv: #00D4AA; --dvb: rgba(0,212,170,.08); --dv2: #6366F1; }

        .dev-wrap { display:flex; height:100vh; flex-direction:column; background:var(--bk); }

        /* ── Header ── */
        .dev-header {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(0,212,170,.1);
          background: var(--bk2);
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0;
        }
        .dev-header-left { display:flex; align-items:center; gap:12px; }
        .dev-icon {
          width:40px; height:40px;
          background: linear-gradient(135deg, #00D4AA, #6366F1);
          border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          font-size:14px; font-weight:800; color:#000; font-family:var(--mono);
          box-shadow: 0 0 16px rgba(0,212,170,.3);
          letter-spacing:-.5px;
        }
        .dev-title { font-size:16px; font-weight:700; color:var(--wh); }
        .dev-sub { font-size:11px; color:var(--gr3); margin-top:1px; }
        .dev-pills { display:flex; gap:6px; }
        .dev-pill {
          padding:3px 9px; border-radius:20px; font-size:9px; font-weight:700;
          border:1px solid;
        }
        .dev-pill--g { color:#00D4AA; border-color:rgba(0,212,170,.3); background:rgba(0,212,170,.08); }
        .dev-pill--p { color:#6366F1; border-color:rgba(99,102,241,.3); background:rgba(99,102,241,.08); }
        .dev-pill--y { color:#F59E0B; border-color:rgba(245,158,11,.3); background:rgba(245,158,11,.08); }

        /* ── Body ── */
        .dev-body { display:flex; flex:1; min-height:0; }

        /* ── Panel ── */
        .dv-panel {
          width:230px; flex-shrink:0;
          background:var(--bk2);
          border-right:1px solid rgba(0,212,170,.08);
          display:flex; flex-direction:column; overflow:hidden;
        }
        .dv-tabs {
          padding:10px 8px 8px;
          border-bottom:1px solid var(--gr);
          display:flex; flex-direction:column; gap:2px;
        }
        .dv-tab {
          width:100%; text-align:left; padding:7px 10px; border-radius:7px;
          background:transparent; border:1px solid transparent;
          cursor:pointer; font-size:11px; font-weight:600;
          color:var(--gr3); transition:.15s;
          display:flex; align-items:center; gap:7px;
        }
        .dv-tab:hover { color:var(--lgt); background:var(--bk3); }
        .dv-tab--active { color:var(--wh) !important; background:var(--bk3) !important; border-color:var(--gr) !important; }
        .dv-tab-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }

        .dv-items { padding:10px 8px; overflow-y:auto; flex:1; }
        .dv-item {
          width:100%; text-align:left;
          padding:10px; margin-bottom:5px;
          background:var(--bk3); border:1px solid var(--gr);
          border-radius:8px; cursor:pointer;
          color:var(--lgt); font-size:11.5px; line-height:1.4;
          transition:.15s; display:flex; align-items:flex-start; gap:8px;
        }
        .dv-item:hover { background:var(--dvb); border-color:var(--dv); color:var(--wh); }
        .dv-item:disabled { opacity:.4; cursor:not-allowed; }
        .dv-item-icon { font-size:15px; flex-shrink:0; margin-top:1px; }

        /* ── Chat ── */
        .dev-chat { flex:1; display:flex; flex-direction:column; min-width:0; }
        .dev-scroll { flex:1; overflow-y:auto; padding:20px 28px; }

        /* ── Bubbles ── */
        .dev-avatar {
          width:32px; height:32px; flex-shrink:0;
          background:linear-gradient(135deg, #00D4AA, #6366F1);
          border-radius:9px;
          display:flex; align-items:center; justify-content:center;
          font-size:10px; font-weight:800; color:#000; font-family:var(--mono);
          letter-spacing:-.5px;
        }
        .bubble-user-dev {
          max-width:65%;
          background:linear-gradient(135deg, #00D4AA, #0099aa);
          color:#000;
          padding:10px 14px;
          border-radius:16px 16px 4px 16px;
          font-size:13px; line-height:1.5; font-weight:600;
        }
        .bubble-dev {
          background:#0D1117;
          border:1px solid #30363d;
          padding:14px 18px;
          border-radius:4px 16px 16px 16px;
          font-size:13px; line-height:1.7;
          color:#E6EDF3;
          max-width:860px;
          font-family:var(--f);
        }
        .bubble-dev pre { white-space:pre-wrap; word-break:break-all; }
        .bubble-dev strong { color:#fff; }
        .bubble-dev ul { color:#E6EDF3; }

        /* ── Typing ── */
        .typing-dots { display:flex; gap:4px; align-items:center; height:20px; }
        .typing-dots span {
          width:7px; height:7px; border-radius:50%;
          background:var(--dv); animation:bounce .9s infinite;
        }
        .typing-dots span:nth-child(2){animation-delay:.15s}
        .typing-dots span:nth-child(3){animation-delay:.30s}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}

        /* ── Input ── */
        .dev-input-wrap {
          padding:16px 28px;
          background:var(--bk2);
          border-top:1px solid rgba(0,212,170,.08);
          flex-shrink:0;
        }
        .dev-form { display:flex; gap:10px; align-items:flex-end; }
        .dev-textarea {
          flex:1; background:var(--bk3); border:1px solid var(--gr);
          border-radius:10px; padding:10px 14px;
          color:var(--lgt); font-size:13px; line-height:1.5;
          resize:none; min-height:42px; max-height:140px;
          transition:.15s; font-family:var(--f);
        }
        .dev-textarea:focus { outline:none; border-color:var(--dv); box-shadow:0 0 0 2px var(--dvb); }
        .dev-textarea::placeholder { color:var(--gr2); }
        .dev-send {
          width:42px; height:42px; flex-shrink:0;
          background:linear-gradient(135deg,#00D4AA,#6366F1);
          border:none; border-radius:10px;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:.15s;
        }
        .dev-send:hover { opacity:.85; }
        .dev-send:disabled { opacity:.4; cursor:not-allowed; }
        .dev-send svg { width:18px; height:18px; fill:none; stroke:#fff; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; }
        .dev-hint { font-size:10px; color:var(--gr3); margin-top:6px; }
      `}</style>

      <div className="dev-wrap">
        <div className="dev-header">
          <div className="dev-header-left">
            <div className="dev-icon">{'</>'}</div>
            <div>
              <div className="dev-title">Developer IA — Programador & Instalador</div>
              <div className="dev-sub">Claude Opus 4.7 · Full-Stack · DevOps · WhatsApp · Alcance+</div>
            </div>
          </div>
          <div className="dev-pills">
            <span className="dev-pill dev-pill--g">Next.js</span>
            <span className="dev-pill dev-pill--p">Deploy</span>
            <span className="dev-pill dev-pill--y">WhatsApp</span>
          </div>
        </div>

        <div className="dev-body">
          <div className="dv-panel">
            <div className="dv-tabs">
              {QUICK_GROUPS.map((g, i) => (
                <button
                  key={g.label}
                  className={`dv-tab${activeGroup === i ? ' dv-tab--active' : ''}`}
                  onClick={() => setActiveGroup(i)}
                >
                  <span className="dv-tab-dot" style={{ background: g.color }} />
                  {g.label}
                </button>
              ))}
            </div>
            <div className="dv-items">
              {group.items.map(item => (
                <button
                  key={item.label}
                  className="dv-item"
                  disabled={loading}
                  onClick={() => send(item.cmd)}
                >
                  <span className="dv-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="dev-chat">
            <div className="dev-scroll">
              {messages.map((msg, i) => (
                <Bubble key={i} msg={msg} />
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="dev-input-wrap">
              <form className="dev-form" onSubmit={onSubmit}>
                <textarea
                  className="dev-textarea"
                  placeholder="Ex: Como instalo o Alcance+ no Windows? / Quero integrar o WhatsApp / Estou com erro de build..."
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
                <button className="dev-send" type="submit" disabled={loading || !input.trim()}>
                  <svg viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
              <div className="dev-hint">Enter para enviar · Shift+Enter para nova linha</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
