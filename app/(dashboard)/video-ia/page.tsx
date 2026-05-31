'use client'
import { useState, useRef, useCallback, useEffect, ChangeEvent, DragEvent } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode    = 'image' | 'text'
type Estilo  = 'suave' | 'dinamico' | 'cinematico' | 'produto' | 'delivery' | 'social' | 'elegante'
type Ratio   = '16:9' | '9:16' | '1:1'
type GenSt   = 'idle' | 'submitting' | 'processing' | 'done' | 'error'

interface VideoItem {
  url:     string
  prompt:  string
  estilo:  Estilo
  ratio:   Ratio
  ts:      number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ESTILOS: { id: Estilo; label: string; icon: string; desc: string }[] = [
  { id: 'suave',      label: 'Suave',        icon: '🌊', desc: 'Movimento sutil, natural'    },
  { id: 'dinamico',   label: 'Dinâmico',     icon: '⚡', desc: 'Energético, publicitário'    },
  { id: 'cinematico', label: 'Cinematográfico', icon: '🎬', desc: 'Câmera lenta, épico'       },
  { id: 'produto',    label: 'Produto',       icon: '📦', desc: 'Reveal, rotação, 360°'       },
  { id: 'delivery',   label: 'Delivery/Food', icon: '🍕', desc: 'Vapor, frescor, apetitoso'   },
  { id: 'social',     label: 'Reel/TikTok',  icon: '📱', desc: 'Rápido, viral, trending'     },
  { id: 'elegante',   label: 'Elegante',      icon: '✨', desc: 'Luxo, premium, slow-motion'  },
]

const RATIOS: { id: Ratio; label: string; icon: string; desc: string }[] = [
  { id: '16:9',  label: 'Paisagem', icon: '📺', desc: 'YouTube, Banner' },
  { id: '9:16',  label: 'Vertical', icon: '📱', desc: 'Reels, TikTok'   },
  { id: '1:1',   label: 'Quadrado', icon: '⬜', desc: 'Feed, WhatsApp'  },
]

const EXEMPLOS = [
  'Pizza saindo do forno com queijo derretendo',
  'Produto girando suavemente em fundo preto',
  'Cafezinho sendo servido, vapor subindo',
  'Academia com pessoas treinando, energia',
  'Loja de roupas, manequins com looks elegantes',
  'Hambúrguer com ingredientes caindo em câmera lenta',
]

const POLL_INTERVAL = 4000 // 4s

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VideoIAPage() {
  const [mode, setMode]           = useState<Mode>('image')
  const [imageSrc, setImageSrc]   = useState<string | null>(null)
  const [fileName, setFileName]   = useState('')
  const [prompt, setPrompt]       = useState('')
  const [estilo, setEstilo]       = useState<Estilo>('dinamico')
  const [ratio, setRatio]         = useState<Ratio>('9:16')
  const [duration, setDuration]   = useState<4 | 8>(8)
  const [genSt, setGenSt]         = useState<GenSt>('idle')
  const [requestId, setRequestId] = useState<string | null>(null)
  const [modelId, setModelId]     = useState<string>('')
  const [videoUrl, setVideoUrl]   = useState<string | null>(null)
  const [usedPrompt, setUsedPrompt] = useState('')
  const [progress, setProgress]   = useState<string>('')
  const [history, setHistory]     = useState<VideoItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [toast, setToast]         = useState<{ msg: string; type: 'ok' | 'er' } | null>(null)
  const [elapsed, setElapsed]     = useState(0)

  const fileInputRef  = useRef<HTMLInputElement>(null)
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const videoRef      = useRef<HTMLVideoElement>(null)

  // ─── Toast ─────────────────────────────────────────────────────────────────
  function showToast(msg: string, type: 'ok' | 'er' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4500)
  }

  // ─── File upload ───────────────────────────────────────────────────────────
  function loadFile(file: File) {
    if (!file.type.startsWith('image/')) { showToast('Apenas imagens', 'er'); return }
    const reader = new FileReader()
    reader.onload = e => {
      setImageSrc(e.target?.result as string)
      setFileName(file.name)
      setMode('image')
      setVideoUrl(null)
    }
    reader.readAsDataURL(file)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ''
  }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setIsDragOver(false)
    const f = e.dataTransfer.files[0]; if (f) loadFile(f)
  }

  // ─── Polling ───────────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startPolling = useCallback((reqId: string, model: string) => {
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000)

    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/video/status?id=${reqId}&model=${encodeURIComponent(model)}`)
        const data = await res.json()

        if (data.status === 'COMPLETED' && data.videoUrl) {
          stopPolling()
          setVideoUrl(data.videoUrl)
          setGenSt('done')
          setProgress('Pronto!')
          setHistory(prev => [{
            url: data.videoUrl, prompt: usedPrompt,
            estilo, ratio, ts: Date.now(),
          }, ...prev.slice(0, 11)])
          showToast('🎬 Vídeo gerado com sucesso!')
        } else if (data.status === 'FAILED') {
          stopPolling()
          setGenSt('error')
          showToast('Erro ao gerar vídeo. Tente novamente.', 'er')
        } else {
          const pos = data.progress != null ? `Posição na fila: ${data.progress}` : 'Processando…'
          setProgress(pos)
        }
      } catch {
        // ignora erros de polling
      }
    }, POLL_INTERVAL)
  }, [stopPolling, usedPrompt, estilo, ratio])

  useEffect(() => () => stopPolling(), [stopPolling])

  // ─── Generate ──────────────────────────────────────────────────────────────
  async function gerar() {
    setGenSt('submitting')
    setVideoUrl(null)
    setProgress('Enviando para fila…')
    setElapsed(0)
    stopPolling()

    try {
      let imageBase64: string | undefined
      let mediaType: string | undefined

      if (mode === 'image' && imageSrc) {
        const [header, b64] = imageSrc.split(',')
        imageBase64 = b64
        mediaType   = header.split(';')[0].split(':')[1]
      }

      const res = await fetch('/api/video/gerar', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mode, imageBase64, mediaType, userPrompt: prompt, estilo, duration, ratio }),
      })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error || 'Erro ao enviar', 'er')
        setGenSt('error')
        return
      }

      const { requestId: reqId, model, prompt: aiPrompt } = await res.json()
      setRequestId(reqId)
      setModelId(model)
      setUsedPrompt(aiPrompt)
      setGenSt('processing')
      setProgress('Na fila…')
      startPolling(reqId, model)
      showToast('⏳ Vídeo em processamento — aguarde 1-3 min')
    } catch {
      showToast('Erro de conexão', 'er')
      setGenSt('error')
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function formatTime(s: number) {
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
  }

  function downloadVideo() {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href     = videoUrl
    a.download = `alcance-video-${estilo}-${Date.now()}.mp4`
    a.target   = '_blank'
    a.click()
    showToast('📥 Download iniciado!')
  }

  const isLoading = genSt === 'submitting' || genSt === 'processing'

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '24px 28px', maxWidth: 1300 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          padding: '10px 16px', borderRadius: 'var(--r2)', fontSize: 12, fontWeight: 600,
          background: toast.type === 'ok' ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)',
          border: `1px solid ${toast.type === 'ok' ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.35)'}`,
          color: toast.type === 'ok' ? 'var(--ok)' : 'var(--er)',
          backdropFilter: 'blur(10px)', boxShadow: 'var(--sh)',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, boxShadow: '0 0 20px rgba(59,130,246,.4)',
        }}>🎬</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--wh)', letterSpacing: '-.03em' }}>
              Gerador de Vídeo IA
            </h1>
            <span style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
              background: 'rgba(34,197,94,.12)', color: 'var(--ok)',
              border: '1px solid rgba(34,197,94,.3)', borderRadius: 20, padding: '2px 8px',
            }}>GRÁTIS</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>
            Foto ou texto → vídeo profissional • fal.ai Wan 2.1 • Reels, TikTok, Stories, Produto
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--bk3)', borderRadius: 'var(--r2)', padding: 3 }}>
            {([
              { id: 'image', label: '📸 Foto → Vídeo' },
              { id: 'text',  label: '✍️ Texto → Vídeo' },
            ] as { id: Mode; label: string }[]).map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                flex: 1, padding: '9px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                background: mode === m.id ? 'var(--bk2)' : 'transparent',
                color: mode === m.id ? 'var(--wh)' : 'var(--gr3)',
                transition: 'all .15s',
              }}>{m.label}</button>
            ))}
          </div>

          {/* Image upload (mode=image) */}
          {mode === 'image' && (
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragOver ? '#3B82F6' : imageSrc ? 'rgba(59,130,246,.4)' : 'rgba(0,196,180,.2)'}`,
                borderRadius: 12, cursor: 'pointer', transition: 'all .2s', overflow: 'hidden',
                background: isDragOver ? 'rgba(59,130,246,.05)' : 'var(--bk2)',
                minHeight: imageSrc ? 0 : 120,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {imageSrc ? (
                <div style={{ position: 'relative' }}>
                  <img src={imageSrc} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,.6)', padding: '6px 10px',
                    fontSize: 9, color: 'rgba(255,255,255,.8)',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>📷 {fileName}</span>
                    <span style={{ color: '#3B82F6', fontWeight: 700 }}>Trocar</span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--gr3)' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--lgt)' }}>Arraste uma foto</div>
                  <div style={{ fontSize: 9, marginTop: 3 }}>ou clique para selecionar</div>
                </div>
              )}
            </div>
          )}

          {/* Prompt */}
          <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 8 }}>
              ✏️ {mode === 'image' ? 'Descreva o Movimento' : 'Descreva o Vídeo'}
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={mode === 'image'
                ? 'Ex: vapor subindo, câmera aproximando lentamente'
                : 'Ex: pizza saindo do forno com queijo derretendo'}
              rows={3}
              className="inp"
              style={{ width: '100%', resize: 'none', fontSize: 11, lineHeight: 1.5 }}
            />
            {/* Exemplos rápidos */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 8, color: 'var(--gr)', marginBottom: 5 }}>SUGESTÕES RÁPIDAS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {EXEMPLOS.slice(0, 4).map(ex => (
                  <button key={ex} onClick={() => setPrompt(ex)} style={{
                    fontSize: 8, padding: '3px 7px', borderRadius: 12,
                    background: 'var(--bk3)', border: '1px solid var(--gr)',
                    color: 'var(--gr3)', cursor: 'pointer', transition: 'color .15s',
                  }}>{ex.length > 30 ? ex.slice(0, 30) + '…' : ex}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Estilo */}
          <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
              🎬 Estilo do Vídeo
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {ESTILOS.map(e => (
                <button key={e.id} onClick={() => setEstilo(e.id)} style={{
                  padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: estilo === e.id ? 'rgba(59,130,246,.15)' : 'var(--bk3)',
                  color: estilo === e.id ? '#3B82F6' : 'var(--gr3)',
                  outline: estilo === e.id ? '1px solid rgba(59,130,246,.5)' : '1px solid var(--gr)',
                  fontSize: 9, fontWeight: 600, textAlign: 'left', transition: 'all .15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{e.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 10, color: estilo === e.id ? '#3B82F6' : 'var(--lgt)' }}>{e.label}</div>
                    <div style={{ fontSize: 8, color: 'var(--gr3)', marginTop: 1 }}>{e.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ratio + Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
                📐 Proporção
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {RATIOS.map(r => (
                  <button key={r.id} onClick={() => setRatio(r.id)} style={{
                    padding: '7px 8px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    background: ratio === r.id ? 'rgba(59,130,246,.15)' : 'var(--bk3)',
                    color: ratio === r.id ? '#3B82F6' : 'var(--gr3)',
                    outline: ratio === r.id ? '1px solid rgba(59,130,246,.5)' : '1px solid var(--gr)',
                    fontSize: 9, fontWeight: 600, transition: 'all .15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>{r.icon} {r.label}</span>
                    <span style={{ fontSize: 8, color: 'var(--gr)', fontFamily: 'var(--mono)' }}>{r.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
                ⏱️ Duração
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {([4, 8] as const).map(d => (
                  <button key={d} onClick={() => setDuration(d)} style={{
                    padding: '10px 8px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    background: duration === d ? 'rgba(59,130,246,.15)' : 'var(--bk3)',
                    color: duration === d ? '#3B82F6' : 'var(--gr3)',
                    outline: duration === d ? '1px solid rgba(59,130,246,.5)' : '1px solid var(--gr)',
                    fontSize: 10, fontWeight: 700, transition: 'all .15s',
                  }}>
                    {d}s {d === 4 ? '⚡ Rápido' : '🎬 Longo'}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 8, color: 'var(--gr)', marginTop: 8, textAlign: 'center' }}>
                ~0.04 crédito/clip
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={gerar}
            disabled={isLoading || (mode === 'image' && !imageSrc)}
            style={{
              width: '100%', padding: '13px', borderRadius: 'var(--r2)',
              border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 800, color: '#fff',
              background: isLoading ? 'var(--bk4)' : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              boxShadow: isLoading ? 'none' : '0 4px 20px rgba(59,130,246,.4)',
              transition: 'all .2s',
            }}
          >
            {isLoading ? `⟳ ${progress || 'Processando…'} (${formatTime(elapsed)})` : '🎬 Gerar Vídeo com IA'}
          </button>

          {/* Info */}
          <div style={{
            background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.15)',
            borderRadius: 'var(--r)', padding: 10,
          }}>
            <div style={{ fontSize: 9, color: 'var(--gr3)', lineHeight: 1.6 }}>
              🆓 <strong style={{ color: 'var(--lgt)' }}>Gratuito:</strong> fal.ai Wan 2.1 — muito barato.<br/>
              ⏳ <strong style={{ color: 'var(--lgt)' }}>Tempo:</strong> 1–3 min por vídeo.<br/>
              🎥 <strong style={{ color: 'var(--lgt)' }}>Qualidade:</strong> 720p, MP4.<br/>
              💳 Créditos em: <span style={{ color: '#3B82F6' }}>fal.ai/dashboard</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Preview ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Video player */}
          <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 16, overflow: 'hidden' }}>

            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderBottom: '1px solid var(--gr)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: 'rgba(59,130,246,.15)', color: '#3B82F6',
                  border: '1px solid rgba(59,130,246,.3)', borderRadius: 20,
                  fontSize: 9, fontWeight: 700, padding: '2px 8px',
                }}>
                  {ESTILOS.find(e => e.id === estilo)?.icon} {ESTILOS.find(e => e.id === estilo)?.label} • {ratio} • {duration}s
                </span>
              </div>
              {videoUrl && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-al" style={{ fontSize: 10, padding: '5px 12px' }} onClick={downloadVideo}>
                    📥 Baixar MP4
                  </button>
                  <button className="btn" style={{ fontSize: 10, padding: '5px 10px' }} onClick={gerar} disabled={isLoading}>
                    🔄 Gerar Novo
                  </button>
                </div>
              )}
            </div>

            {/* Video area */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 28,
              background: 'repeating-conic-gradient(#1a1d28 0% 25%, #13161e 0% 50%) 0 0 / 20px 20px',
              minHeight: 380,
            }}>
              {!videoUrl && !isLoading && (
                <div style={{ textAlign: 'center', color: 'var(--gr3)' }}>
                  <div style={{ fontSize: 56, marginBottom: 14 }}>🎬</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--lgt)', marginBottom: 8 }}>
                    Seu vídeo aparece aqui
                  </div>
                  <div style={{ fontSize: 10, lineHeight: 1.6, maxWidth: 280 }}>
                    Escolha uma foto ou descreva o vídeo,<br/>
                    selecione o estilo e clique em Gerar.
                  </div>
                </div>
              )}

              {isLoading && (
                <div style={{ textAlign: 'center' }}>
                  {/* Animated ring */}
                  <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 20px' }}>
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      border: '3px solid rgba(59,130,246,.1)',
                      borderTop: '3px solid #3B82F6',
                      animation: 'viaspin 1s linear infinite',
                    }} />
                    <div style={{
                      position: 'absolute', inset: 8, borderRadius: '50%',
                      border: '2px solid rgba(139,92,246,.1)',
                      borderTop: '2px solid #8B5CF6',
                      animation: 'viaspin 1.5s linear infinite reverse',
                    }} />
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 24,
                    }}>🎬</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--wh)', marginBottom: 6 }}>
                    {genSt === 'submitting' ? 'Enviando para fila…' : 'Gerando seu vídeo…'}
                  </div>
                  <div style={{ fontSize: 11, color: '#3B82F6', marginBottom: 4, fontWeight: 600 }}>
                    {progress}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gr3)' }}>
                    ⏱️ {formatTime(elapsed)} — Tempo médio: 1–3 min
                  </div>
                  {/* Progress bar */}
                  <div style={{
                    marginTop: 16, width: 240, height: 3,
                    background: 'var(--bk4)', borderRadius: 3, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                      borderRadius: 3,
                      animation: 'viaprogress 2s ease-in-out infinite',
                    }} />
                  </div>
                </div>
              )}

              {videoUrl && !isLoading && (
                <div style={{
                  position: 'relative',
                  borderRadius: 12, overflow: 'hidden',
                  boxShadow: '0 8px 40px rgba(0,0,0,.7)',
                  maxWidth: ratio === '9:16' ? 260 : 480,
                  width: '100%',
                }}>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Prompt usado */}
          {usedPrompt && (
            <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r)', padding: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', marginBottom: 5 }}>🤖 Prompt IA Gerado</div>
              <div style={{ fontSize: 9, color: 'var(--gr3)', lineHeight: 1.5, fontFamily: 'var(--mono)' }}>
                {usedPrompt.length > 200 ? usedPrompt.slice(0, 200) + '…' : usedPrompt}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── History ── */}
      {history.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
            📂 Vídeos Gerados Nesta Sessão
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {history.map((item, i) => (
              <div key={i} style={{
                background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 10,
                overflow: 'hidden', cursor: 'pointer', width: 130, transition: 'border-color .2s',
              }}
                onClick={() => setVideoUrl(item.url)}
              >
                <video src={item.url} muted loop
                  style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '6px 8px' }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--lgt)' }}>
                    {ESTILOS.find(e => e.id === item.estilo)?.icon} {ESTILOS.find(e => e.id === item.estilo)?.label}
                  </div>
                  <div style={{ fontSize: 7, color: 'var(--gr3)', marginTop: 1 }}>
                    {new Date(item.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />

      <style>{`
        @keyframes viaspin    { to { transform: rotate(360deg); } }
        @keyframes viaprogress {
          0%   { width: 5%; margin-left: 0; }
          50%  { width: 60%; margin-left: 20%; }
          100% { width: 5%; margin-left: 95%; }
        }
      `}</style>
    </div>
  )
}
