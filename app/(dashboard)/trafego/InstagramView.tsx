'use client'

export default function InstagramView() {
  return (
    <div style={{ padding: 28, overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wh)' }}>📱 Instagram</div>
        <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>Análise de Reels, Stories e Feed</div>
      </div>

      <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--lgt)', fontWeight: 700, marginBottom: 8 }}>🚧 Em construção</div>
        <div style={{ fontSize: 11, color: 'var(--gr3)', lineHeight: 1.7, maxWidth: 560 }}>
          Esta sub-aba exibirá alcance, compartilhamentos, salvamentos e engajamento de Reels, Stories e Feed,
          além de identificar via IA os melhores horários, formatos e conteúdos com maior conversão.
          <br /><br />
          Hoje o cadastro de cliente já guarda o identificador do Instagram, mas ainda não há ingestão de dados
          de conteúdo orgânico — é necessário conectar a Instagram Graph API e criar uma tabela de métricas
          de posts/Reels/Stories (análoga a <code>metricas_diarias</code>) para alimentar esta tela.
        </div>
      </div>
    </div>
  )
}
