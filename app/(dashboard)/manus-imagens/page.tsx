'use client'
import { useState } from 'react'

type Formato = 'feed' | 'story'
type Status = 'idle' | 'loading' | 'done' | 'error'

const PRATOS_AMORE = [
  { nome: 'Parmegiana de Frango Para 2', preco: '58,90' },
  { nome: 'Parmegiana de Carne Para 2', preco: '69,90' },
  { nome: 'Camarão Imperial Para 2', preco: '79,90' },
  { nome: 'Mistão Amore Para 2', preco: '74,90' },
  { nome: 'Petisco Sertão Para 2', preco: '69,90' },
  { nome: 'Peixe à Delícia Para 2', preco: '89,89' },
  { nome: 'Churrascada Picanha Importada Para 2', preco: '114,90' },
  { nome: 'Sertão e Mar Para 2', preco: '88,90' },
]

const ESTILOS = [
  { id: 'premium', label: 'Premium Dark', desc: 'Fundo escuro, luz âmbar, food porn cinematográfico' },
  { id: 'rustico', label: 'Rústico', desc: 'Mesa de madeira, luz natural, estilo caseiro' },
  { id: 'moderno', label: 'Moderno', desc: 'Minimalista, fundo branco, fotografia editorial' },
  { id: 'festa', label: 'Festa/Promoção', desc: 'Cores vibrantes, confetes, energético' },
]

export default function ManusImagensPage() {
  const [prato, setPrato] = useState('')
  const [preco, setPreco] = useState('')
  const [estilo, setEstilo] = useState('premium')
  const [formato, setFormato] = useState<Formato>('feed')
  const [status, setStatus] = useState<Status>('idle')
  const [imageUrl, setImageUrl] = useState('')
  const [taskId, setTaskId] = useState('')
  const [erro, setErro] = useState('')
  const [historico, setHistorico] = useState<Array<{ prato: string; url: string; formato: Formato }>>([])

  const estiloSelecionado = ESTILOS.find(e => e.id === estilo)

  async function gerar() {
    if (!prato.trim()) return
    setStatus('loading')
    setErro('')
    setImageUrl('')
    setTaskId('')

    try {
      const res = await fetch('/api/manus/gerar-imagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prato: prato.trim(),
          preco: preco.trim(),
          estilo: estiloSelecionado?.desc,
          formato,
        }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setErro(data.error || 'Erro desconhecido')
        setStatus('error')
        return
      }

      setImageUrl(data.image_url)
      setTaskId(data.task_id)
      setHistorico(h => [{ prato: data.prato, url: data.image_url, formato }, ...h.slice(0, 11)])
      setStatus('done')
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro de rede')
      setStatus('error')
    }
  }

  function usarPratoAmore(p: { nome: string; preco: string }) {
    setPrato(p.nome)
    setPreco(p.preco)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>🍌</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            Manus Imagens
          </h1>
          <span style={{
            background: '#FFD70022', color: '#FFD700', border: '1px solid #FFD70044',
            borderRadius: 6, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600,
          }}>
            Nano Banana Pro
          </span>
        </div>
        <p style={{ color: '#8b9ab0', margin: 0 }}>
          Gere imagens de pratos profissionais com o modelo Google Imagen via Manus AI
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
        {/* Formulário */}
        <div style={{ background: '#1a1f2e', borderRadius: 12, padding: '1.5rem', border: '1px solid #2a3347' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', marginTop: 0 }}>
            Configurar Imagem
          </h2>

          {/* Atalhos Amore */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ color: '#8b9ab0', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '0.6rem' }}>
              CARDÁPIO AMORE (atalho rápido)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {PRATOS_AMORE.map(p => (
                <button
                  key={p.nome}
                  onClick={() => usarPratoAmore(p)}
                  style={{
                    background: prato === p.nome ? '#00C4B422' : '#0d1117',
                    border: `1px solid ${prato === p.nome ? '#00C4B4' : '#2a3347'}`,
                    color: prato === p.nome ? '#00C4B4' : '#8b9ab0',
                    borderRadius: 6, padding: '0.3rem 0.65rem', fontSize: '0.75rem',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {p.nome.replace(' Para 2', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Prato */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#8b9ab0', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
              NOME DO PRATO *
            </label>
            <input
              value={prato}
              onChange={e => setPrato(e.target.value)}
              placeholder="Ex: Parmegiana de Frango Para 2"
              style={{
                width: '100%', background: '#0d1117', border: '1px solid #2a3347',
                borderRadius: 8, padding: '0.65rem 0.9rem', color: '#fff',
                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Preço */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#8b9ab0', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
              PREÇO (opcional — aparece na imagem)
            </label>
            <input
              value={preco}
              onChange={e => setPreco(e.target.value)}
              placeholder="Ex: 58,90"
              style={{
                width: '100%', background: '#0d1117', border: '1px solid #2a3347',
                borderRadius: 8, padding: '0.65rem 0.9rem', color: '#fff',
                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Formato */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#8b9ab0', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
              FORMATO
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['feed', 'story'] as Formato[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFormato(f)}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: 8, cursor: 'pointer',
                    background: formato === f ? '#00C4B422' : '#0d1117',
                    border: `1px solid ${formato === f ? '#00C4B4' : '#2a3347'}`,
                    color: formato === f ? '#00C4B4' : '#8b9ab0',
                    fontWeight: 600, fontSize: '0.85rem',
                  }}
                >
                  {f === 'feed' ? '⬛ Feed (1:1)' : '▬ Story (9:16)'}
                </button>
              ))}
            </div>
          </div>

          {/* Estilo */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#8b9ab0', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
              ESTILO VISUAL
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              {ESTILOS.map(e => (
                <button
                  key={e.id}
                  onClick={() => setEstilo(e.id)}
                  style={{
                    padding: '0.6rem 0.75rem', borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                    background: estilo === e.id ? '#FFD70011' : '#0d1117',
                    border: `1px solid ${estilo === e.id ? '#FFD700' : '#2a3347'}`,
                    color: estilo === e.id ? '#FFD700' : '#8b9ab0',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{e.label}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 2 }}>{e.desc.substring(0, 30)}…</div>
                </button>
              ))}
            </div>
          </div>

          {/* Botão gerar */}
          <button
            onClick={gerar}
            disabled={status === 'loading' || !prato.trim()}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: 10, border: 'none',
              background: status === 'loading' ? '#2a3347' : 'linear-gradient(135deg,#FFD700,#FF8C00)',
              color: status === 'loading' ? '#8b9ab0' : '#000',
              fontWeight: 700, fontSize: '1rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {status === 'loading' ? '⏳ Gerando com Nano Banana Pro… (pode demorar 2-5 min)' : '🍌 Gerar Imagem'}
          </button>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Resultado */}
          <div style={{
            background: '#1a1f2e', borderRadius: 12, border: '1px solid #2a3347',
            padding: '1.25rem', minHeight: 320,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            {status === 'idle' && (
              <div style={{ textAlign: 'center', color: '#3d4f6a' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🍌</div>
                <div style={{ fontSize: '0.9rem' }}>Configure o prato e clique em Gerar</div>
              </div>
            )}

            {status === 'loading' && (
              <div style={{ textAlign: 'center', color: '#FFD700' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', animation: 'spin 1s linear infinite' }}>⚙️</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Manus está gerando…</div>
                <div style={{ fontSize: '0.75rem', color: '#8b9ab0', marginTop: '0.4rem' }}>
                  Nano Banana Pro em ação
                </div>
                {taskId && (
                  <div style={{ fontSize: '0.7rem', color: '#3d4f6a', marginTop: '0.75rem' }}>
                    Task: {taskId.substring(0, 16)}…
                  </div>
                )}
              </div>
            )}

            {status === 'done' && imageUrl && (
              <>
                <img
                  src={imageUrl}
                  alt={prato}
                  style={{
                    width: '100%', borderRadius: 8, objectFit: 'cover',
                    aspectRatio: formato === 'story' ? '9/16' : '1/1',
                  }}
                />
                <a
                  href={imageUrl}
                  download
                  style={{
                    marginTop: '1rem', width: '100%', padding: '0.6rem', borderRadius: 8,
                    background: '#00C4B422', border: '1px solid #00C4B4',
                    color: '#00C4B4', textAlign: 'center', textDecoration: 'none',
                    fontWeight: 600, fontSize: '0.85rem',
                  }}
                >
                  ⬇ Baixar Imagem
                </a>
              </>
            )}

            {status === 'error' && (
              <div style={{ textAlign: 'center', color: '#e63946' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Erro</div>
                <div style={{ fontSize: '0.75rem', color: '#8b9ab0', maxWidth: 280 }}>{erro}</div>
                {erro.includes('MANUS_API_KEY') && (
                  <div style={{
                    marginTop: '1rem', background: '#FFD70011', border: '1px solid #FFD70044',
                    borderRadius: 8, padding: '0.75rem', fontSize: '0.75rem', color: '#FFD700', textAlign: 'left',
                  }}>
                    <strong>Como configurar:</strong><br/>
                    1. Acesse <strong>manus.im</strong> → Login<br/>
                    2. Settings → API Integration<br/>
                    3. Clique em <strong>Create API Key</strong><br/>
                    4. Adicione ao <code>.env.local</code>:<br/>
                    <code style={{ color: '#00C4B4' }}>MANUS_API_KEY=sua-chave-aqui</code>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Histórico */}
          {historico.length > 0 && (
            <div style={{ background: '#1a1f2e', borderRadius: 12, border: '1px solid #2a3347', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b9ab0', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                GERADAS NESTA SESSÃO
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.4rem' }}>
                {historico.map((h, i) => (
                  <a key={i} href={h.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <img
                      src={h.url}
                      alt={h.prato}
                      title={h.prato}
                      style={{ width: '100%', borderRadius: 6, aspectRatio: '1/1', objectFit: 'cover' }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
