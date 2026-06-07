'use client'
import { useEffect, useState } from 'react'

type Status = { configured: boolean; connected: boolean; state?: string; instanceName?: string; message?: string }

export default function WhatsAppView() {
  const [status, setStatus] = useState<Status | null>(null)

  useEffect(() => {
    fetch('/api/whatsapp/status').then(r => r.json()).then(setStatus).catch(() => setStatus(null))
  }, [])

  return (
    <div style={{ padding: 28, overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wh)' }}>💬 WhatsApp</div>
        <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>Conexão via Evolution API · métricas de conversas e conversão</div>
      </div>

      <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
          Status da conexão
        </div>
        {!status && <div style={{ fontSize: 11, color: 'var(--gr3)' }}>Consultando…</div>}
        {status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: status.connected ? 'var(--ok)' : (status.configured ? '#F59E0B' : '#EF4444'),
              boxShadow: status.connected ? '0 0 8px var(--ok)' : 'none',
            }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--wh)' }}>
                {status.connected ? 'Conectado' : status.configured ? `Não conectado (${status.state || 'desconhecido'})` : 'Não configurado'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>
                {status.instanceName ? `Instância: ${status.instanceName}` : status.message || 'Configure EVOLUTION_API_URL/EVOLUTION_API_KEY/EVOLUTION_INSTANCE_NAME'}
              </div>
            </div>
            <a href="/whatsapp" style={{
              marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#F59E0B',
              border: '1px solid rgba(245,158,11,.3)', borderRadius: 8, padding: '6px 12px', textDecoration: 'none',
            }}>Abrir módulo WhatsApp →</a>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--lgt)', fontWeight: 700, marginBottom: 8 }}>🚧 Métricas em construção</div>
        <div style={{ fontSize: 11, color: 'var(--gr3)', lineHeight: 1.7, maxWidth: 560 }}>
          Volume de conversas, tempo médio de resposta e taxa de conversão por WhatsApp serão exibidos aqui,
          alimentados pela tabela <code>metricas_whatsapp</code> (já criada na migration 003) a partir dos
          eventos capturados pelo webhook da Evolution API em <code>/api/whatsapp/webhook</code>.
          <br /><br />
          Falta implementar: agregação diária dos eventos <code>messages.upsert</code> em <code>metricas_whatsapp</code>
          e a leitura dessa tabela aqui.
        </div>
      </div>
    </div>
  )
}
