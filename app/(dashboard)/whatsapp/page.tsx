'use client'
import { useState, useEffect } from 'react'
import { clientesIniciais } from '@/lib/types/cliente'

type ApiStatus = {
  configured: boolean
  connected: boolean
  state?: string
  instanceName?: string
  evolutionUrl?: string
  message?: string
}

type MsgModal = { open: boolean; nome: string; phone: string }

function waLink(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, '')
  const num = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

const AGENTES = [
  {
    nome: 'FIGUEIREDO',
    sub: 'Gerente de Operações — agente padrão',
    cor: '#C9A227',
    keywords: ['alcance', 'figueiredo', 'campanha', 'briefing', 'proposta', 'cliente', 'estratégia', 'relatório', 'reunião', 'comercial'],
  },
  {
    nome: 'Tráfego',
    sub: 'Meta Ads · Google Ads · TikTok Ads',
    cor: '#1877F2',
    keywords: ['meta ads', 'google ads', 'tráfego', 'roas', 'ctr', 'cpc', 'orçamento', 'pausar', 'anúncio'],
  },
  {
    nome: 'Editor de Vídeos',
    sub: 'Reels · TikTok · Anúncios em vídeo',
    cor: '#FF9500',
    keywords: ['reel', 'vídeo', 'editar', 'edição', 'corte', 'legenda', 'criativo', 'viral'],
  },
  {
    nome: 'Expert iFood',
    sub: 'Delivery · Cardápio · Algoritmo',
    cor: '#E8002D',
    keywords: ['ifood', 'cardápio', 'delivery', 'pedido', 'marmita', 'hamburguer', 'avaliação', 'ranqueamento'],
  },
  {
    nome: 'Developer IA',
    sub: 'Programação · Instalação · Setup',
    cor: '#00D4AA',
    keywords: ['instalar', 'instalação', 'erro', 'bug', 'código', 'deploy', 'servidor', 'api', 'configurar'],
  },
]

const SETUP_STEPS = [
  {
    n: 1,
    titulo: 'Instalar a Evolution API',
    desc: 'Use Docker (local) ou o serviço gerenciado em evolution-api.com',
    cmd: 'docker run -d --name evolution-api -p 8080:8080 atendai/evolution-api:latest',
  },
  {
    n: 2,
    titulo: 'Preencher o .env.local',
    desc: 'Edite o arquivo .env.local na raiz do projeto com suas credenciais:',
    cmd: 'EVOLUTION_API_URL=http://localhost:8080\nEVOLUTION_API_KEY=sua-chave-aqui\nEVOLUTION_INSTANCE_NAME=alcance',
  },
  {
    n: 3,
    titulo: 'Criar instância e escanear QR Code',
    desc: 'Acesse o painel da Evolution API, crie uma instância chamada "alcance" e escaneie o QR Code com o WhatsApp da agência.',
  },
  {
    n: 4,
    titulo: 'Configurar o Webhook',
    desc: 'No painel da Evolution API, adicione o webhook apontando para sua URL de produção com o evento messages.upsert:',
    cmd: 'https://seu-dominio.com/api/whatsapp/webhook',
  },
]

export default function WhatsAppPage() {
  const [tab, setTab] = useState<'clientes' | 'config' | 'agentes'>('clientes')
  const [status, setStatus] = useState<ApiStatus | null>(null)
  const [msgModal, setMsgModal] = useState<MsgModal>({ open: false, nome: '', phone: '' })
  const [msgText, setMsgText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qr, setQr] = useState<{ base64: string | null; count: number | null; error?: string } | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  const comWpp = clientesIniciais.filter(c => c.whatsapp || c.telefone)

  useEffect(() => {
    fetch('/api/whatsapp/status')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ configured: false, connected: false, message: 'Erro ao verificar status' }))
  }, [])

  async function enviar() {
    if (!msgText.trim() || !msgModal.phone) return
    setSending(true)
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: msgModal.phone, message: msgText }),
      })
      if (res.ok) {
        setSent(true)
        setTimeout(() => {
          setSent(false)
          setMsgModal({ open: false, nome: '', phone: '' })
          setMsgText('')
        }, 1500)
      }
    } finally {
      setSending(false)
    }
  }

  async function fetchQr() {
    setQrLoading(true)
    try {
      const res = await fetch('/api/whatsapp/qr')
      const data = await res.json()
      setQr(data)
    } catch {
      setQr({ base64: null, count: null, error: 'Erro ao buscar QR code' })
    } finally {
      setQrLoading(false)
    }
  }

  function copyWebhook() {
    navigator.clipboard.writeText('https://seu-dominio.com/api/whatsapp/webhook')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusLabel = status === null
    ? 'Verificando...'
    : status.connected ? 'Conectado'
    : status.configured ? 'Desconectado'
    : 'Não configurado'

  const statusColor = status?.connected ? 'var(--ok)' : status?.configured ? 'var(--wr)' : 'var(--er)'
  const statusBadge = status?.connected ? 'badge-ok' : status?.configured ? 'badge-wr' : 'badge-er'

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">WhatsApp</span>
          <span className="tb-sub">{comWpp.length} clientes com número · Bot {statusLabel.toLowerCase()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge ${statusBadge}`} style={{ fontSize: 11 }}>
            ● {statusLabel}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            setStatus(null)
            fetch('/api/whatsapp/status').then(r => r.json()).then(setStatus)
          }}>
            Atualizar
          </button>
        </div>
      </div>

      <div className="content">
        {/* KPIs */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            { label: 'Clientes com WPP', val: comWpp.length, color: '#25D366' },
            { label: 'Status do Bot', val: statusLabel, color: statusColor },
            { label: 'Agentes IA', val: 5, color: 'var(--al)' },
            { label: 'Webhook', val: status?.configured ? 'Configurado' : 'Pendente', color: status?.configured ? 'var(--ok)' : 'var(--wr)' },
          ].map(k => (
            <div key={k.label} className="kpi">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val" style={{ fontSize: 20, color: k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        <div className="tabs">
          <button className={`tab${tab === 'clientes' ? ' act' : ''}`} onClick={() => setTab('clientes')}>Clientes</button>
          <button className={`tab${tab === 'config' ? ' act' : ''}`} onClick={() => setTab('config')}>Configuração</button>
          <button className={`tab${tab === 'agentes' ? ' act' : ''}`} onClick={() => setTab('agentes')}>Agentes Bot</button>
        </div>

        {/* ── Tab: Clientes ── */}
        {tab === 'clientes' && (
          <div className="card">
            {comWpp.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--gr3)', fontSize: 13 }}>
                Nenhum cliente com WhatsApp cadastrado. Adicione números na página de Clientes.
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>WhatsApp</th>
                    <th>Segmento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {comWpp.map(c => {
                    const phone = c.whatsapp || c.telefone
                    const statusCls = c.status === 'Ativo' ? 'badge-ok' : c.status === 'Onboarding' ? 'badge-al' : 'badge-wr'
                    return (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="av">{c.nome.charAt(0)}</div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--wh)' }}>{c.nomeFantasia || c.nome}</div>
                              <div style={{ fontSize: 10, color: 'var(--gr3)' }}>{c.responsavel}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--mono)', color: '#25D366', fontSize: 12 }}>{phone}</td>
                        <td><span className="badge badge-gr">{c.segmento}</span></td>
                        <td><span className={`badge ${statusCls}`}>{c.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <a
                              href={waLink(phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-sm"
                              style={{ background: '#25D36618', borderColor: '#25D36644', color: '#25D366' }}
                            >
                              Abrir Chat
                            </a>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => { setMsgModal({ open: true, nome: c.nomeFantasia || c.nome, phone }); setMsgText('') }}
                            >
                              Mensagem
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab: Configuração ── */}
        {tab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* QR Code card */}
            {!status?.connected && (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: 28 }}>
                <div style={{ fontWeight: 700, color: 'var(--wh)', fontSize: 14, alignSelf: 'flex-start' }}>
                  Conectar WhatsApp
                </div>
                <p style={{ fontSize: 12, color: 'var(--gr3)', textAlign: 'center', lineHeight: 1.7, margin: 0 }}>
                  Clique em <strong style={{ color: 'var(--wh)' }}>Gerar QR Code</strong>, depois abra o WhatsApp no celular →{' '}
                  <strong style={{ color: 'var(--wh)' }}>⋮ → Dispositivos conectados → Conectar dispositivo</strong> e escaneie.
                </p>

                {/* QR image or placeholder */}
                <div style={{
                  width: 220, height: 220,
                  background: 'var(--bk4)',
                  border: '2px solid var(--bk5)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {qrLoading ? (
                    <div style={{ fontSize: 12, color: 'var(--gr3)' }}>Gerando...</div>
                  ) : qr?.base64 ? (
                    <img src={qr.base64} alt="QR Code WhatsApp" style={{ width: 220, height: 220 }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--gr3)', fontSize: 12, padding: 16 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
                      Clique no botão abaixo para gerar o QR Code
                    </div>
                  )}
                </div>

                {qr?.count != null && (
                  <div style={{ fontSize: 11, color: 'var(--gr3)' }}>
                    QR {qr.count}/30 — expira em ~20s
                  </div>
                )}
                {qr?.error && (
                  <div style={{ fontSize: 11, color: 'var(--er)', background: '#FF443322', padding: '8px 14px', borderRadius: 6 }}>
                    ⚠ {qr.error === 'unreachable' ? 'Evolution API offline — inicie o servidor primeiro' : qr.error}
                  </div>
                )}

                <button
                  className="btn btn-al"
                  onClick={fetchQr}
                  disabled={qrLoading}
                  style={{ minWidth: 160, opacity: qrLoading ? 0.6 : 1 }}
                >
                  {qrLoading ? 'Gerando...' : qr?.base64 ? '↺ Novo QR Code' : 'Gerar QR Code'}
                </button>
              </div>
            )}

            {status?.connected && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24 }}>
                <div style={{ fontSize: 36 }}>✅</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#25D366', fontSize: 14, marginBottom: 4 }}>WhatsApp Conectado</div>
                  <div style={{ fontSize: 12, color: 'var(--gr3)' }}>Instância <code style={{ color: 'var(--al)' }}>{status.instanceName}</code> ativa e recebendo mensagens.</div>
                </div>
              </div>
            )}

            {/* Status card */}
            <div className="card">
              <div className="sec-hd">
                <div style={{ fontWeight: 700, color: 'var(--wh)', fontSize: 13 }}>Status da Evolution API</div>
                <span className={`badge ${statusBadge}`}>● {statusLabel}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>URL da API</div>
                  <code style={{ fontSize: 12, color: 'var(--al)' }}>{status?.evolutionUrl || 'http://localhost:8080'}</code>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Instância</div>
                  <code style={{ fontSize: 12, color: 'var(--al)' }}>{status?.instanceName || 'alcance'}</code>
                </div>
                {status?.state && (
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Estado</div>
                    <code style={{ fontSize: 12, color: status.connected ? 'var(--ok)' : 'var(--wr)' }}>{status.state}</code>
                  </div>
                )}
              </div>
              {status?.message && (
                <div style={{ marginTop: 12, fontSize: 11, color: 'var(--wr)', background: '#FF443322', padding: '8px 12px', borderRadius: 6, border: '1px solid #FF443344' }}>
                  ⚠ {status.message}
                </div>
              )}
            </div>

            {/* Webhook URL */}
            <div className="card">
              <div style={{ fontWeight: 700, color: 'var(--wh)', marginBottom: 8, fontSize: 13 }}>URL do Webhook</div>
              <p style={{ fontSize: 12, color: 'var(--gr3)', marginBottom: 12, lineHeight: 1.6 }}>
                Configure esta URL na Evolution API para que o bot receba e responda mensagens automaticamente.
                Substitua <code style={{ color: 'var(--al)' }}>seu-dominio.com</code> pelo seu domínio de produção.
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code style={{ flex: 1, fontSize: 12, background: 'var(--bk4)', padding: '10px 14px', borderRadius: 6, color: 'var(--al)', border: '1px solid var(--bk5)' }}>
                  https://seu-dominio.com/api/whatsapp/webhook
                </code>
                <button className="btn btn-ghost btn-sm" onClick={copyWebhook} style={{ whiteSpace: 'nowrap' }}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Setup guide */}
            <div className="card">
              <div style={{ fontWeight: 700, color: 'var(--wh)', marginBottom: 20, fontSize: 13 }}>Guia de Configuração</div>
              {SETUP_STEPS.map((step, i) => (
                <div
                  key={step.n}
                  style={{
                    display: 'flex',
                    gap: 16,
                    paddingBottom: 20,
                    marginBottom: i < SETUP_STEPS.length - 1 ? 20 : 0,
                    borderBottom: i < SETUP_STEPS.length - 1 ? '1px solid var(--bk4)' : 'none',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 14,
                    background: 'var(--al)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#000',
                  }}>
                    {step.n}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--wh)', marginBottom: 6, fontSize: 13 }}>{step.titulo}</div>
                    <div style={{ fontSize: 12, color: 'var(--gr3)', marginBottom: step.cmd ? 10 : 0, lineHeight: 1.6 }}>{step.desc}</div>
                    {step.cmd && (
                      <pre style={{
                        fontSize: 11, background: 'var(--bk4)', padding: '10px 14px',
                        borderRadius: 6, color: '#25D366', overflowX: 'auto', margin: 0,
                        border: '1px solid var(--bk5)', lineHeight: 1.8,
                      }}>
                        {step.cmd}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Agentes ── */}
        {tab === 'agentes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: '12px 16px' }}>
              <p style={{ fontSize: 12, color: 'var(--gr3)', margin: 0, lineHeight: 1.7 }}>
                O bot detecta palavras-chave na mensagem recebida e redireciona automaticamente para o agente especializado.
                Envie uma mensagem pelo WhatsApp para qualquer número configurado na instância e o bot responderá em segundos.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
              {AGENTES.map(a => (
                <div key={a.nome} className="kpi" style={{ border: `1px solid ${a.cor}44` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, background: a.cor, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, color: a.cor, fontSize: 13 }}>{a.nome}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 12, lineHeight: 1.5 }}>{a.sub}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {a.keywords.map(k => (
                      <span key={k} className="badge badge-gr" style={{ fontSize: 9 }}>{k}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Enviar Mensagem ── */}
      {msgModal.open && (
        <div className="modal-overlay" onClick={() => setMsgModal({ open: false, nome: '', phone: '' })}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color: '#25D366' }}>
              Enviar mensagem
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Para</div>
              <div style={{ fontWeight: 700, color: 'var(--wh)', marginBottom: 2 }}>{msgModal.nome}</div>
              <div style={{ fontSize: 12, color: '#25D366', fontFamily: 'var(--mono)' }}>{msgModal.phone}</div>
            </div>
            <textarea
              className="inp"
              rows={5}
              placeholder="Digite a mensagem que o bot irá enviar..."
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
              autoFocus
            />
            {!status?.connected && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--wr)', background: '#FF443322', padding: '8px 12px', borderRadius: 6 }}>
                ⚠ Bot desconectado — configure a Evolution API para enviar via bot.{' '}
                <a href={waLink(msgModal.phone, msgText)} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'underline' }}>
                  Abrir no WhatsApp Web →
                </a>
              </div>
            )}
            <div className="modal-foot" style={{ marginTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setMsgModal({ open: false, nome: '', phone: '' })}>
                Cancelar
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={waLink(msgModal.phone, msgText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ borderColor: '#25D36644', color: '#25D366' }}
                >
                  WhatsApp Web
                </a>
                <button
                  className="btn btn-al"
                  onClick={enviar}
                  disabled={sending || !msgText.trim() || !status?.connected}
                  style={{ opacity: (sending || !msgText.trim() || !status?.connected) ? 0.5 : 1, background: sent ? 'var(--ok)' : undefined }}
                >
                  {sent ? '✓ Enviado!' : sending ? 'Enviando...' : 'Enviar via Bot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
