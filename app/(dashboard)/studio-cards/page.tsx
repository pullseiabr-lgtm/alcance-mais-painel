'use client'
import { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type TipoCard  = 'feed' | 'story' | 'whatsapp' | 'banner' | 'cardapio' | 'ifood' | 'linkedin' | 'tiktok'
type Estilo    = 'premium' | 'moderno' | 'vibrante' | 'rustico' | 'minimalista' | 'festivo' | 'tropical' | 'neon'
type AppSt     = 'idle' | 'generating' | 'ready' | 'error'
type TextPos   = 'center' | 'top' | 'bottom'

interface CardConfig {
  tipo:       TipoCard
  estilo:     Estilo
  titulo:     string
  subtitulo:  string
  cta:        string
  segmento:   string
  cor1:       string
  cor2:       string
  textPos:    TextPos
  showLogo:   boolean
  logoText:   string
}

interface HistoryItem {
  bgSrc:  string
  config: CardConfig
  ts:     number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPOS: { id: TipoCard; label: string; icon: string; w: number; h: number; ratio: string }[] = [
  { id: 'feed',     label: 'Feed',      icon: '📸', w: 1080, h: 1080, ratio: '1:1'   },
  { id: 'story',    label: 'Story',     icon: '📱', w: 1080, h: 1920, ratio: '9:16'  },
  { id: 'whatsapp', label: 'WhatsApp',  icon: '💬', w: 800,  h: 800,  ratio: '1:1'   },
  { id: 'ifood',    label: 'iFood',     icon: '🛵', w: 600,  h: 600,  ratio: '1:1'   },
  { id: 'banner',   label: 'Banner',    icon: '🖼️', w: 1920, h: 1080, ratio: '16:9'  },
  { id: 'linkedin', label: 'LinkedIn',  icon: '💼', w: 1200, h: 627,  ratio: '~2:1'  },
  { id: 'cardapio', label: 'Cardápio',  icon: '📋', w: 1200, h: 900,  ratio: '4:3'   },
  { id: 'tiktok',   label: 'TikTok',    icon: '🎵', w: 1080, h: 1920, ratio: '9:16'  },
]

const ESTILOS: { id: Estilo; label: string; icon: string; desc: string; preview: string }[] = [
  { id: 'premium',     label: 'Premium Dark',  icon: '🌑', desc: 'Fundo escuro, luz âmbar, luxo',      preview: 'linear-gradient(135deg,#1a0e05,#3d2010,#1a1208)' },
  { id: 'moderno',     label: 'Moderno',        icon: '⬜', desc: 'Limpo, minimalista, corporativo',    preview: 'linear-gradient(135deg,#f5f5f5,#e8e8e8,#fff)'    },
  { id: 'vibrante',    label: 'Vibrante',       icon: '🌈', desc: 'Colorido, energético, impactante',   preview: 'linear-gradient(135deg,#FF6B35,#E8002D,#FF9500)' },
  { id: 'rustico',     label: 'Rústico',        icon: '🪵', desc: 'Madeira, concreto, artesanal',       preview: 'linear-gradient(135deg,#3d2010,#5c3317,#2d1a0a)' },
  { id: 'minimalista', label: 'Minimalista',    icon: '〇', desc: 'Ultra-limpo, espaço negativo',       preview: 'linear-gradient(135deg,#fafafa,#f0f0f5,#fff)'    },
  { id: 'festivo',     label: 'Festivo',        icon: '🎉', desc: 'Celebração, confete, promoção',      preview: 'linear-gradient(135deg,#C9A227,#E8002D,#C9A227)' },
  { id: 'tropical',    label: 'Tropical',       icon: '🌿', desc: 'Verde, flores, Brasil, natureza',    preview: 'linear-gradient(135deg,#1a3a1a,#2d5a1e,#0d2510)' },
  { id: 'neon',        label: 'Neon/Cyber',     icon: '⚡', desc: 'Neon, cyberpunk, futurista',         preview: 'linear-gradient(135deg,#0d0d1a,#1a0d2e,#0d1a2e)'  },
]

const SEGMENTOS = [
  'Restaurante', 'Delivery / iFood', 'Loja de Roupas', 'Salão de Beleza',
  'Academia / Fitness', 'Imobiliária', 'Clínica / Saúde', 'Agência de Marketing',
  'E-commerce', 'Advocacia', 'Construção Civil', 'Tecnologia',
]

const TEXT_POS: { id: TextPos; label: string; icon: string }[] = [
  { id: 'top',    label: 'Topo',   icon: '⬆️' },
  { id: 'center', label: 'Centro', icon: '⏺️' },
  { id: 'bottom', label: 'Baixo',  icon: '⬇️' },
]

const DEFAULT: CardConfig = {
  tipo: 'feed', estilo: 'premium',
  titulo: '', subtitulo: '', cta: '',
  segmento: 'Agência de Marketing',
  cor1: '#00C4B4', cor2: '#1A1D28',
  textPos: 'center', showLogo: true, logoText: 'Alcance+',
}

// ─── Canvas render ────────────────────────────────────────────────────────────

async function renderCanvas(
  canvas: HTMLCanvasElement,
  bgSrc:  string,
  cfg:    CardConfig,
  tipo:   typeof TIPOS[0],
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width  = tipo.w
  canvas.height = tipo.h

  // 1. Draw background
  const img = new Image()
  img.src = bgSrc
  await new Promise<void>(res => { img.onload = () => res() })
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // 2. Gradient overlay for text readability
  const pos = cfg.textPos
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
  if (pos === 'bottom') {
    grad.addColorStop(0,   'rgba(0,0,0,0.0)')
    grad.addColorStop(0.5, 'rgba(0,0,0,0.05)')
    grad.addColorStop(1,   'rgba(0,0,0,0.75)')
  } else if (pos === 'top') {
    grad.addColorStop(0,   'rgba(0,0,0,0.75)')
    grad.addColorStop(0.5, 'rgba(0,0,0,0.05)')
    grad.addColorStop(1,   'rgba(0,0,0,0.0)')
  } else {
    grad.addColorStop(0,   'rgba(0,0,0,0.15)')
    grad.addColorStop(0.35,'rgba(0,0,0,0.0)')
    grad.addColorStop(0.65,'rgba(0,0,0,0.0)')
    grad.addColorStop(1,   'rgba(0,0,0,0.55)')
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 3. Calculate text zone Y center
  const yCenter = pos === 'top'
    ? canvas.height * 0.25
    : pos === 'bottom'
    ? canvas.height * 0.78
    : canvas.height * 0.52

  const scale   = canvas.width / 1080
  const spacing = canvas.height * 0.065

  // helper: centered text with shadow
  const drawText = (
    text: string, y: number, size: number,
    color: string, weight = 'bold', shadowBlur = 18,
  ) => {
    if (!text) return
    ctx.shadowColor  = 'rgba(0,0,0,0.85)'
    ctx.shadowBlur   = shadowBlur
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 3
    ctx.font         = `${weight} ${Math.round(size * scale)}px "Plus Jakarta Sans", sans-serif`
    ctx.fillStyle    = color
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'

    // word wrap
    const maxW   = canvas.width * 0.85
    const words  = text.split(' ')
    const lines: string[] = []
    let cur = ''
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w }
      else cur = test
    }
    if (cur) lines.push(cur)
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, y + i * size * scale * 1.25)
    })
    ctx.shadowBlur = 0
  }

  // 4. Título
  if (cfg.titulo) {
    const titleSize = pos === 'center' ? 68 : 60
    drawText(cfg.titulo, yCenter - spacing * 0.3, titleSize, '#FFFFFF', '800')
  }

  // 5. Subtítulo
  if (cfg.subtitulo) {
    const subY = cfg.titulo
      ? yCenter + spacing * 0.9
      : yCenter
    drawText(cfg.subtitulo, subY, 34, 'rgba(255,255,255,0.90)', '500', 10)
  }

  // 6. CTA button
  if (cfg.cta) {
    const ctaY  = pos === 'bottom' ? canvas.height * 0.88 : canvas.height * 0.80
    const ctaW  = Math.min(500 * scale, canvas.width * 0.65)
    const ctaH  = 68 * scale
    const ctaX  = canvas.width / 2 - ctaW / 2
    const rad   = ctaH / 2

    // shadow
    ctx.shadowColor = 'rgba(0,0,0,0.4)'
    ctx.shadowBlur  = 20

    // pill background
    ctx.beginPath()
    ctx.moveTo(ctaX + rad, ctaY)
    ctx.lineTo(ctaX + ctaW - rad, ctaY)
    ctx.arcTo(ctaX + ctaW, ctaY, ctaX + ctaW, ctaY + ctaH, rad)
    ctx.lineTo(ctaX + ctaW, ctaY + ctaH - rad)
    ctx.arcTo(ctaX + ctaW, ctaY + ctaH, ctaX + ctaW - rad, ctaY + ctaH, rad)
    ctx.lineTo(ctaX + rad, ctaY + ctaH)
    ctx.arcTo(ctaX, ctaY + ctaH, ctaX, ctaY + ctaH - rad, rad)
    ctx.lineTo(ctaX, ctaY + rad)
    ctx.arcTo(ctaX, ctaY, ctaX + rad, ctaY, rad)
    ctx.closePath()
    ctx.fillStyle = cfg.cor1 || '#00C4B4'
    ctx.fill()
    ctx.shadowBlur = 0

    drawText(cfg.cta, ctaY + ctaH / 2, 26, '#FFFFFF', '700', 0)
  }

  // 7. Logo text (top left or top right)
  if (cfg.showLogo && cfg.logoText) {
    const logoSize = 22 * scale
    ctx.font      = `800 ${Math.round(logoSize)}px "Plus Jakarta Sans", sans-serif`
    ctx.fillStyle = cfg.cor1 || '#00C4B4'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur  = 8
    ctx.fillText(cfg.logoText, canvas.width * 0.05, canvas.height * 0.04)
    ctx.shadowBlur = 0
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudioCardsPage() {
  const [cfg, setCfg]         = useState<CardConfig>(DEFAULT)
  const [bgSrc, setBgSrc]     = useState<string | null>(null)
  const [appSt, setAppSt]     = useState<AppSt>('idle')
  const [prompt, setPrompt]   = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [toast, setToast]     = useState<{ msg: string; type: 'ok' | 'er' } | null>(null)
  const [tab, setTab]         = useState<'form' | 'texto' | 'estilo'>('form')

  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const fileLogoRef = useRef<HTMLInputElement>(null)

  const tipoInfo = TIPOS.find(t => t.id === cfg.tipo) ?? TIPOS[0]

  // ─── Toast ─────────────────────────────────────────────────────────────────

  function showToast(msg: string, type: 'ok' | 'er' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ─── Re-render canvas when config or bg changes ────────────────────────────

  useEffect(() => {
    if (!bgSrc || !canvasRef.current) return
    renderCanvas(canvasRef.current, bgSrc, cfg, tipoInfo)
  }, [bgSrc, cfg, tipoInfo])

  // ─── Generate ──────────────────────────────────────────────────────────────

  async function gerar() {
    setAppSt('generating')
    try {
      const res = await fetch('/api/studio/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo:      cfg.tipo,
          estilo:    cfg.estilo,
          titulo:    cfg.titulo,
          subtitulo: cfg.subtitulo,
          cta:       cfg.cta,
          segmento:  cfg.segmento,
          cor1:      cfg.cor1,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.error || 'Erro ao gerar card', 'er')
        setAppSt('error')
        return
      }

      const blob = await res.blob()
      const src  = URL.createObjectURL(blob)
      setBgSrc(src)

      const headerPrompt = res.headers.get('X-Prompt')
      if (headerPrompt) setPrompt(decodeURIComponent(headerPrompt))

      setHistory(prev => [{ bgSrc: src, config: { ...cfg }, ts: Date.now() }, ...prev.slice(0, 11)])
      setAppSt('ready')
      showToast('🎨 Card gerado!')
    } catch {
      showToast('Erro de conexão. Tente novamente.', 'er')
      setAppSt('error')
    }
  }

  // ─── Download ──────────────────────────────────────────────────────────────

  function download(scale = 1) {
    const canvas = canvasRef.current
    if (!canvas) return
    const out    = document.createElement('canvas')
    out.width    = canvas.width  * scale
    out.height   = canvas.height * scale
    const ctx    = out.getContext('2d')!
    ctx.drawImage(canvas, 0, 0, out.width, out.height)
    const link   = document.createElement('a')
    link.href    = out.toDataURL('image/jpeg', 0.95)
    link.download = `alcance-card-${cfg.tipo}-${Date.now()}.jpg`
    link.click()
    showToast(`📥 Card ${tipoInfo.label} baixado!`)
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function set<K extends keyof CardConfig>(k: K, v: CardConfig[K]) {
    setCfg(prev => ({ ...prev, [k]: v }))
  }

  // ─── Display scale ─────────────────────────────────────────────────────────

  const PREVIEW_W     = 460
  const displayScale  = PREVIEW_W / tipoInfo.w
  const displayH      = tipoInfo.h * displayScale

  const isLoading = appSt === 'generating'

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400 }}>

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
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, boxShadow: '0 0 20px rgba(139,92,246,.4)',
        }}>🎨</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--wh)', letterSpacing: '-.03em' }}>
              Studio de Cards
            </h1>
            <span style={{
              fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
              background: 'rgba(139,92,246,.15)', color: '#8B5CF6',
              border: '1px solid rgba(139,92,246,.3)', borderRadius: 20, padding: '2px 8px',
            }}>NOVO</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>
            Criação profissional de artes para marketing — Feed, Story, WhatsApp, iFood, Banner
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT: Controls ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--bk3)', borderRadius: 'var(--r2)', padding: 3 }}>
            {([
              { id: 'form',   label: '📐 Formato' },
              { id: 'texto',  label: '✏️ Texto' },
              { id: 'estilo', label: '🎨 Estilo' },
            ] as { id: typeof tab; label: string }[]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 10, fontWeight: 700,
                background: tab === t.id ? 'var(--bk2)' : 'transparent',
                color: tab === t.id ? 'var(--wh)' : 'var(--gr3)',
                transition: 'all .15s',
              }}>{t.label}</button>
            ))}
          </div>

          {/* ── Tab: Formato ── */}
          {tab === 'form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Tipo de card */}
              <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
                  📐 Tipo de Card
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {TIPOS.map(t => (
                    <button key={t.id} onClick={() => set('tipo', t.id)} style={{
                      padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: cfg.tipo === t.id ? 'rgba(139,92,246,.15)' : 'var(--bk3)',
                      color: cfg.tipo === t.id ? '#8B5CF6' : 'var(--gr3)',
                      outline: cfg.tipo === t.id ? '1px solid rgba(139,92,246,.5)' : '1px solid var(--gr)',
                      fontSize: 9, fontWeight: 600, textAlign: 'center', transition: 'all .15s',
                      display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center',
                    }}>
                      <span style={{ fontSize: 18 }}>{t.icon}</span>
                      <span>{t.label}</span>
                      <span style={{ fontSize: 7, color: 'var(--gr)' }}>{t.ratio}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Segmento */}
              <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 8 }}>
                  🏢 Segmento do Negócio
                </label>
                <select
                  value={cfg.segmento}
                  onChange={e => set('segmento', e.target.value)}
                  className="inp"
                  style={{ width: '100%', fontSize: 11, padding: '8px 10px' }}
                >
                  {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Cores */}
              <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
                  🎨 Cores da Marca
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: 'var(--gr3)', marginBottom: 4 }}>Cor Principal</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={cfg.cor1} onChange={e => set('cor1', e.target.value)}
                        style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--gr)', cursor: 'pointer', background: 'none' }} />
                      <input type="text" value={cfg.cor1} onChange={e => set('cor1', e.target.value)}
                        className="inp" style={{ flex: 1, fontSize: 10, padding: '6px 8px', fontFamily: 'var(--mono)' }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: 'var(--gr3)', marginBottom: 4 }}>Cor Secundária</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={cfg.cor2} onChange={e => set('cor2', e.target.value)}
                        style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--gr)', cursor: 'pointer', background: 'none' }} />
                      <input type="text" value={cfg.cor2} onChange={e => set('cor2', e.target.value)}
                        className="inp" style={{ flex: 1, fontSize: 10, padding: '6px 8px', fontFamily: 'var(--mono)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Texto ── */}
          {tab === 'texto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
                  ✏️ Conteúdo do Card
                </div>

                <div className="field" style={{ marginBottom: 10 }}>
                  <label>Título Principal</label>
                  <input className="inp" type="text" value={cfg.titulo}
                    onChange={e => set('titulo', e.target.value)}
                    placeholder="Ex: 50% OFF em toda a loja!" style={{ fontSize: 12 }} />
                </div>

                <div className="field" style={{ marginBottom: 10 }}>
                  <label>Subtítulo / Descrição</label>
                  <input className="inp" type="text" value={cfg.subtitulo}
                    onChange={e => set('subtitulo', e.target.value)}
                    placeholder="Ex: Somente este fim de semana" style={{ fontSize: 12 }} />
                </div>

                <div className="field" style={{ marginBottom: 10 }}>
                  <label>Botão de Ação (CTA)</label>
                  <input className="inp" type="text" value={cfg.cta}
                    onChange={e => set('cta', e.target.value)}
                    placeholder="Ex: Comprar Agora" style={{ fontSize: 12 }} />
                </div>
              </div>

              {/* Posição do texto */}
              <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
                  📍 Posição do Texto
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {TEXT_POS.map(p => (
                    <button key={p.id} onClick={() => set('textPos', p.id)} style={{
                      flex: 1, padding: '10px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: cfg.textPos === p.id ? 'rgba(139,92,246,.15)' : 'var(--bk3)',
                      color: cfg.textPos === p.id ? '#8B5CF6' : 'var(--gr3)',
                      outline: cfg.textPos === p.id ? '1px solid rgba(139,92,246,.5)' : '1px solid var(--gr)',
                      fontSize: 10, fontWeight: 600, textAlign: 'center', transition: 'all .15s',
                      display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
                    }}>
                      <span style={{ fontSize: 16 }}>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo/marca */}
              <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    🏷️ Marca no Card
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={cfg.showLogo} onChange={e => set('showLogo', e.target.checked)} />
                    <span style={{ fontSize: 10, color: 'var(--gr3)' }}>Exibir</span>
                  </label>
                </div>
                {cfg.showLogo && (
                  <input className="inp" type="text" value={cfg.logoText}
                    onChange={e => set('logoText', e.target.value)}
                    placeholder="Nome da marca" style={{ width: '100%', fontSize: 11 }} />
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Estilo ── */}
          {tab === 'estilo' && (
            <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
                🎨 Estilo Visual da Arte
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ESTILOS.map(e => (
                  <button key={e.id} onClick={() => set('estilo', e.id)} style={{
                    padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: cfg.estilo === e.id ? 'rgba(139,92,246,.12)' : 'var(--bk3)',
                    outline: cfg.estilo === e.id ? '1px solid rgba(139,92,246,.5)' : '1px solid var(--gr)',
                    transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: e.preview, border: '1px solid rgba(255,255,255,.08)',
                    }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: cfg.estilo === e.id ? '#8B5CF6' : 'var(--lgt)', marginBottom: 2 }}>
                        {e.icon} {e.label}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--gr3)' }}>{e.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            className="btn"
            onClick={gerar}
            disabled={isLoading}
            style={{
              width: '100%', justifyContent: 'center', padding: '12px',
              fontSize: 13, fontWeight: 800,
              background: isLoading ? 'var(--bk4)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              color: '#fff', border: 'none',
              boxShadow: isLoading ? 'none' : '0 4px 20px rgba(139,92,246,.4)',
              transition: 'all .2s',
            }}
          >
            {isLoading ? '⟳ Gerando arte...' : '🎨 Gerar Card com IA'}
          </button>

          {/* Prompt usado */}
          {prompt && (
            <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r)', padding: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', marginBottom: 4 }}>🤖 Prompt Visual Gerado</div>
              <div style={{ fontSize: 9, color: 'var(--gr3)', lineHeight: 1.5, fontFamily: 'var(--mono)' }}>
                {prompt.length > 180 ? prompt.slice(0, 180) + '…' : prompt}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Preview ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Canvas preview */}
          <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 16, overflow: 'hidden' }}>

            {/* Toolbar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderBottom: '1px solid var(--gr)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: 'rgba(139,92,246,.15)', color: '#8B5CF6',
                  border: '1px solid rgba(139,92,246,.3)', borderRadius: 20,
                  fontSize: 9, fontWeight: 700, padding: '2px 8px',
                }}>
                  {TIPOS.find(t => t.id === cfg.tipo)?.icon} {tipoInfo.label} • {tipoInfo.w}×{tipoInfo.h}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {bgSrc && (
                  <>
                    <button className="btn" style={{ fontSize: 10, padding: '5px 10px' }} onClick={() => download()}>
                      📥 Baixar
                    </button>
                    <button className="btn" style={{ fontSize: 10, padding: '5px 10px' }} onClick={gerar} disabled={isLoading}>
                      🔄 Gerar Novo
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Canvas area */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24, background: 'repeating-conic-gradient(#1a1d28 0% 25%, #13161e 0% 50%) 0 0 / 20px 20px',
              minHeight: 300,
            }}>
              {!bgSrc && !isLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--gr3)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎨</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--lgt)', marginBottom: 6 }}>
                    Configure e gere seu card
                  </div>
                  <div style={{ fontSize: 10 }}>
                    Preencha o formulário e clique em "Gerar Card com IA"
                  </div>
                </div>
              ) : isLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--gr3)' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', margin: '0 auto 16px',
                    border: '3px solid rgba(139,92,246,.15)',
                    borderTop: '3px solid #8B5CF6',
                    animation: 'scspin 1s linear infinite',
                  }} />
                  <div style={{ fontSize: 12, color: 'var(--wh)', fontWeight: 700, marginBottom: 4 }}>
                    🎨 Criando arte com IA...
                  </div>
                  <div style={{ fontSize: 10 }}>Claude + fal.ai Flux Pro</div>
                </div>
              ) : (
                <div style={{
                  position: 'relative',
                  width: PREVIEW_W,
                  height: displayH,
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,.6)',
                }}>
                  <canvas
                    ref={canvasRef}
                    style={{
                      width: PREVIEW_W,
                      height: displayH,
                      display: 'block',
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Export options */}
          {bgSrc && (
            <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
                📥 Exportar
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-al" style={{ fontSize: 11, padding: '8px 14px' }} onClick={() => download()}>
                  📥 {tipoInfo.w}×{tipoInfo.h}px (Original)
                </button>
                {tipoInfo.w < 1080 && (
                  <button className="btn" style={{ fontSize: 11, padding: '8px 14px' }} onClick={() => download(2)}>
                    📥 {tipoInfo.w * 2}×{tipoInfo.h * 2}px (2×)
                  </button>
                )}
                <button className="btn" style={{ fontSize: 11, padding: '8px 14px', color: '#8B5CF6' }}
                  onClick={() => {
                    // Copy to other formats
                    const others = TIPOS.filter(t => t.id !== cfg.tipo && (
                      (t.ratio === tipoInfo.ratio) ||
                      (cfg.tipo === 'feed' && t.id === 'ifood')
                    ))
                    if (others.length > 0) showToast(`Gere também para: ${others.map(t => t.label).join(', ')}`)
                    else showToast('Escolha outro formato na aba Formato')
                  }}>
                  🔁 Outros Formatos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── History ── */}
      {history.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
            📂 Artes Criadas Nesta Sessão
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {history.map((item, i) => {
              const t = TIPOS.find(x => x.id === item.config.tipo) ?? TIPOS[0]
              const previewW = 90
              const previewH = Math.round(t.h / t.w * previewW)
              return (
                <div key={i}
                  onClick={() => {
                    setBgSrc(item.bgSrc)
                    setCfg(item.config)
                    setAppSt('ready')
                  }}
                  style={{
                    background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 10,
                    overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s',
                  }}
                >
                  <img src={item.bgSrc} alt="" style={{ width: previewW, height: previewH, objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '5px 7px' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--lgt)' }}>{t.icon} {t.label}</div>
                    <div style={{ fontSize: 7, color: 'var(--gr3)' }}>
                      {new Date(item.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scspin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
