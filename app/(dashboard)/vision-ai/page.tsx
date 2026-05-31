'use client'
import { useState, useRef, useCallback, ChangeEvent, DragEvent } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type FoodCat = 'pizza' | 'hamburguer' | 'sushi' | 'drink' | 'churrasco' | 'sobremesa' | 'massa' | 'frutos_do_mar' | 'geral'
type Platform = 'ifood' | 'instagram' | 'story' | 'whatsapp' | 'cardapio' | 'banner'
type TabId = 'ajustes' | 'analise' | 'exportar'
type AppSt = 'idle' | 'analyzing' | 'enhancing' | 'ready'

interface FoodAnalysis {
  foodType: string
  category: FoodCat
  description: string
  enhancementSuggestions: string[]
  bestContext: string
  prompt: string
  qualityScore: number
  issues: string[]
  strengths: string[]
}

interface Adj {
  brightness: number
  contrast: number
  saturation: number
  warmth: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_ADJ: Adj = { brightness: 0, contrast: 0, saturation: 0, warmth: 0 }

// Ajustes inteligentes específicos por categoria de alimento
// Preservam aparência natural — sem exagero (Editor Humanizado)
const CATEGORY_ADJ: Record<FoodCat, Adj> = {
  pizza:         { brightness: 5,  contrast: 22, saturation: 32, warmth: 18 }, // Queijo dourado, molho vivo
  hamburguer:    { brightness: 3,  contrast: 28, saturation: 35, warmth: 20 }, // Carne suculenta, brioche brilhante
  sushi:         { brightness: 12, contrast: 14, saturation: 18, warmth: -8 }, // Salmão fresco, tons frios limpos
  drink:         { brightness: 10, contrast: 16, saturation: 28, warmth: 2  }, // Cores vibrantes, gelo nítido
  churrasco:     { brightness: 2,  contrast: 32, saturation: 38, warmth: 22 }, // Crosta dourada, fumaça real
  sobremesa:     { brightness: 10, contrast: 18, saturation: 28, warmth: 10 }, // Cores doces, cobertura brilhante
  massa:         { brightness: 8,  contrast: 20, saturation: 30, warmth: 14 }, // Molho vibrante, queijo derretido
  frutos_do_mar: { brightness: 12, contrast: 16, saturation: 25, warmth: -4 }, // Frescor, reflexo natural
  geral:         { brightness: 8,  contrast: 18, saturation: 25, warmth: 5  },
}

// Prompts profissionais por categoria (base para o Magnific)
const CATEGORY_PROMPTS: Record<FoodCat, string> = {
  pizza:         'professional pizza food photography, golden melted mozzarella cheese, vibrant tomato sauce, crispy golden crust, steam rising, dark premium background, studio lighting, shallow depth of field, appetizing',
  hamburguer:    'professional burger food photography, juicy beef patty, melted cheese dripping, glossy brioche bun, fresh vegetables, dark moody background, dramatic side lighting, high contrast, restaurant quality',
  sushi:         'professional sushi food photography, fresh salmon sashimi, glistening rice, precise knife cuts, minimalist white background, clean composition, natural soft lighting, Japanese restaurant aesthetic',
  drink:         'professional beverage photography, refreshing drink, ice cubes clarity, condensation droplets, vibrant colors, studio lighting, clean background, commercial quality',
  churrasco:     'professional barbecue food photography, charred crust, juicy interior, smoke effect, rustic wooden board, warm amber lighting, dramatic shadows, appetizing grilled texture',
  sobremesa:     'professional dessert food photography, glossy frosting, vibrant colors, soft lighting, elegant plating, pastel background, shallow depth of field, appetizing sweet texture',
  massa:         'professional pasta food photography, rich tomato sauce, melted cheese, steam rising, rustic plate, warm Italian restaurant lighting, shallow depth of field, appetizing',
  frutos_do_mar: 'professional seafood food photography, fresh glistening texture, natural colors, clean minimal background, soft diffused lighting, restaurant quality plating',
  geral:         'professional food photography, appetizing, sharp details, warm studio lighting, restaurant quality, commercial photography, vibrant colors',
}

// Banco de Prompts — chave para localStorage
const PROMPT_BANK_KEY = 'amore_vision_prompt_bank'

const FOOD_CATS: Record<FoodCat, { label: string; icon: string; color: string }> = {
  pizza:        { label: 'Pizza',         icon: '🍕', color: '#FF6B35' },
  hamburguer:   { label: 'Hambúrguer',    icon: '🍔', color: '#C07820' },
  sushi:        { label: 'Sushi',         icon: '🍱', color: '#E8002D' },
  drink:        { label: 'Bebida',        icon: '🥤', color: '#00C4B4' },
  churrasco:    { label: 'Churrasco',     icon: '🥩', color: '#9B2020' },
  sobremesa:    { label: 'Sobremesa',     icon: '🍰', color: '#D946B5' },
  massa:        { label: 'Massa',         icon: '🍝', color: '#C9A227' },
  frutos_do_mar:{ label: 'Frutos do Mar', icon: '🦐', color: '#06B6D4' },
  geral:        { label: 'Geral',         icon: '🍽️', color: '#666' },
}

const PRESETS = [
  { id: 'original',   label: 'Original',   icon: '📷', adj: { brightness: 0,   contrast: 0,  saturation: 0,  warmth: 0  } },
  { id: 'quick',      label: 'Quick Fix',  icon: '⚡', adj: { brightness: 8,   contrast: 12, saturation: 18, warmth: 5  } },
  { id: 'food-porn',  label: 'Food Porn',  icon: '🔥', adj: { brightness: 5,   contrast: 28, saturation: 38, warmth: 12 } },
  { id: 'ifood',      label: 'iFood',      icon: '📦', adj: { brightness: 15,  contrast: 20, saturation: 28, warmth: 3  } },
  { id: 'instagram',  label: 'Instagram',  icon: '📸', adj: { brightness: 8,   contrast: 18, saturation: 30, warmth: 8  } },
  { id: 'delivery',   label: 'Delivery',   icon: '🌑', adj: { brightness: -8,  contrast: 35, saturation: 40, warmth: 20 } },
  { id: 'promo',      label: 'Promoção',   icon: '💥', adj: { brightness: 20,  contrast: 30, saturation: 45, warmth: 15 } },
  { id: 'cardapio',   label: 'Cardápio',   icon: '📋', adj: { brightness: 12,  contrast: 15, saturation: 22, warmth: 2  } },
]

const PLATFORMS: { id: Platform; label: string; icon: string; size: string; ratio: string; w: number; h: number }[] = [
  { id: 'ifood',     label: 'iFood',          icon: '🛵', size: '600×600',   ratio: '1:1',  w: 600,  h: 600  },
  { id: 'instagram', label: 'Instagram',      icon: '📸', size: '1080×1080', ratio: '1:1',  w: 1080, h: 1080 },
  { id: 'story',     label: 'Story / Reels',  icon: '📱', size: '1080×1920', ratio: '9:16', w: 1080, h: 1920 },
  { id: 'whatsapp',  label: 'WhatsApp',       icon: '💬', size: '800×800',   ratio: '1:1',  w: 800,  h: 800  },
  { id: 'cardapio',  label: 'Cardápio',       icon: '📋', size: '1200×900',  ratio: '4:3',  w: 1200, h: 900  },
  { id: 'banner',    label: 'Banner',         icon: '🖼️', size: '1920×1080', ratio: '16:9', w: 1920, h: 1080 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toFilter(adj: Adj): string {
  const b = (1 + adj.brightness / 100).toFixed(2)
  const c = (1 + adj.contrast / 100).toFixed(2)
  const s = (1 + adj.saturation / 100).toFixed(2)
  const sepia = (Math.max(0, adj.warmth) / 100 * 0.5).toFixed(3)
  const hue   = (Math.min(0, adj.warmth) * 0.6).toFixed(1)
  return `brightness(${b}) contrast(${c}) saturate(${s}) sepia(${sepia}) hue-rotate(${hue}deg)`
}

function scoreColor(n: number) {
  if (n >= 8) return 'var(--ok)'
  if (n >= 5) return 'var(--wr)'
  return 'var(--er)'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VisionAIPage() {
  // Image state
  const [originalSrc, setOriginalSrc] = useState<string | null>(null)
  const [enhancedSrc, setEnhancedSrc] = useState<string | null>(null)
  const [fileName, setFileName]       = useState('')

  // UI state
  const [appSt, setAppSt]               = useState<AppSt>('idle')
  const [activeTab, setActiveTab]       = useState<TabId>('ajustes')
  const [sliderPos, setSliderPos]       = useState(50)
  const [isDragOver, setIsDragOver]     = useState(false)
  const [toast, setToast]               = useState<{ msg: string; type: 'ok' | 'er' } | null>(null)

  // Editor state
  const [adj, setAdj]                   = useState<Adj>(DEFAULT_ADJ)
  const [activePreset, setActivePreset] = useState('original')
  const [selPlatform, setSelPlatform]   = useState<Platform>('instagram')
  const [analysis, setAnalysis]         = useState<FoodAnalysis | null>(null)
  const [history, setHistory]           = useState<{ original: string; enhanced: string; food: string; ts: number }[]>([])

  const fileInputRef   = useRef<HTMLInputElement>(null)
  const imgContainerRef = useRef<HTMLDivElement>(null)

  // ─── Toast ────────────────────────────────────────────────────────────────

  function showToast(msg: string, type: 'ok' | 'er' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ─── File loading ─────────────────────────────────────────────────────────

  function loadFile(file: File) {
    if (!file.type.startsWith('image/')) { showToast('Apenas imagens (JPG, PNG, WEBP)', 'er'); return }
    if (file.size > 25 * 1024 * 1024) { showToast('Máximo 25 MB', 'er'); return }
    const reader = new FileReader()
    reader.onload = e => {
      const src = e.target?.result as string
      setOriginalSrc(src)
      setEnhancedSrc(null)
      setAnalysis(null)
      setAdj(DEFAULT_ADJ)
      setActivePreset('original')
      setSliderPos(50)
      setFileName(file.name)
      setAppSt('ready')
      setActiveTab('ajustes')
      showToast('📷 Foto carregada! Selecione um preset ou analise com IA.')
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

  // ─── Before/After slider ──────────────────────────────────────────────────

  const onSliderDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const cont = imgContainerRef.current; if (!cont) return
    const move = (ev: MouseEvent) => {
      const rect = cont.getBoundingClientRect()
      setSliderPos(Math.max(0, Math.min(100, ((ev.clientX - rect.left) / rect.width) * 100)))
    }
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up)
  }, [])

  const onSliderTouch = useCallback((e: React.TouchEvent) => {
    const cont = imgContainerRef.current; if (!cont) return
    const move = (ev: TouchEvent) => {
      const rect = cont.getBoundingClientRect()
      setSliderPos(Math.max(0, Math.min(100, ((ev.touches[0].clientX - rect.left) / rect.width) * 100)))
    }
    const end = () => { document.removeEventListener('touchmove', move); document.removeEventListener('touchend', end) }
    document.addEventListener('touchmove', move); document.addEventListener('touchend', end)
  }, [])

  // ─── Prompt Bank ─────────────────────────────────────────────────────────

  function loadPromptBank(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem(PROMPT_BANK_KEY) || '{}') } catch { return {} }
  }

  function saveToPromptBank(category: FoodCat, foodType: string, prompt: string) {
    try {
      const bank = loadPromptBank()
      bank[category] = prompt
      bank[`last_${category}`] = foodType
      bank[`ts_${category}`] = String(Date.now())
      localStorage.setItem(PROMPT_BANK_KEY, JSON.stringify(bank))
    } catch { /* ignore */ }
  }

  function getBestPrompt(category: FoodCat, claudePrompt: string): string {
    // Usa o prompt gerado pelo Claude se tiver boa qualidade, senão usa o do banco ou padrão da categoria
    if (claudePrompt && claudePrompt.length > 40) return claudePrompt
    const bank = loadPromptBank()
    return bank[category] || CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.geral
  }

  // ─── Preset apply ─────────────────────────────────────────────────────────

  function applyPreset(p: typeof PRESETS[0]) {
    setAdj(p.adj as Adj)
    setActivePreset(p.id)
    setEnhancedSrc(null)
    setSliderPos(50)
  }

  function applyCategoryAdjustments(cat: FoodCat) {
    setAdj(CATEGORY_ADJ[cat])
    setActivePreset(`cat_${cat}`)
    setEnhancedSrc(null)
    setSliderPos(50)
  }

  function suggestPreset(ctx: string, cat: FoodCat) {
    // Primeiro tenta aplicar ajuste inteligente por categoria de alimento
    if (cat !== 'geral') return null // vai usar applyCategoryAdjustments diretamente
    if (ctx === 'ifood')     return PRESETS.find(p => p.id === 'ifood')!
    if (ctx === 'delivery')  return PRESETS.find(p => p.id === 'delivery')!
    if (ctx === 'instagram') return PRESETS.find(p => p.id === 'instagram')!
    if (ctx === 'promo')     return PRESETS.find(p => p.id === 'promo')!
    return PRESETS.find(p => p.id === 'food-porn')!
  }

  // ─── Analyze ──────────────────────────────────────────────────────────────

  async function analyzeImage() {
    if (!originalSrc) return
    setAppSt('analyzing'); setActiveTab('analise')
    try {
      const [header, base64] = originalSrc.split(',')
      const mediaType = header.split(';')[0].split(':')[1]
      const res = await fetch('/api/image/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      })
      if (!res.ok) { showToast((await res.json()).error || 'Erro na análise', 'er'); return }
      const data: FoodAnalysis = await res.json()
      setAnalysis(data)

      // Aplica ajustes inteligentes específicos para o tipo de alimento identificado
      const cat = data.category as FoodCat
      if (cat !== 'geral') {
        applyCategoryAdjustments(cat)
      } else {
        const preset = suggestPreset(data.bestContext, cat)
        if (preset) applyPreset(preset)
      }

      // Salva no banco de prompts para uso futuro
      saveToPromptBank(cat, data.foodType, data.prompt)

      showToast(`🍽️ ${data.foodType} • Score: ${data.qualityScore}/10 • Ajustes aplicados!`)
    } catch { showToast('Erro ao conectar. Verifique ANTHROPIC_API_KEY.', 'er') }
    finally { setAppSt('ready') }
  }

  // ─── Enhance with Magnific AI ─────────────────────────────────────────────

  async function enhanceWithAI() {
    if (!originalSrc) return
    setAppSt('enhancing')
    try {
      const dataRes = await fetch(originalSrc)
      const blob    = await dataRes.blob()
      const form    = new FormData()
      form.append('image',        blob, fileName || 'foto.jpg')
      form.append('scaleFactor',  '2')
      form.append('creativity',   '3')
      form.append('hdr',          '3')
      form.append('resemblance',  '8')
      form.append('optimizedFor', 'standard_photography')
      // Usa o melhor prompt disponível: Claude > banco > padrão da categoria
      const cat = (analysis?.category as FoodCat) || 'geral'
      const bestPrompt = getBestPrompt(cat, analysis?.prompt || '')
      form.append('prompt', bestPrompt)

      const res = await fetch('/api/magnific/enhance', { method: 'POST', body: form })

      if (!res.ok) {
        const err = await res.json()
        showToast(err.howTo ? '🔑 Configure MAGNIFIC_API_KEY para usar IA (veja .env.local)' : (err.error || 'Erro'), 'er')
        return
      }

      const imgBlob     = await res.blob()
      const enhancedUrl = URL.createObjectURL(imgBlob)
      setEnhancedSrc(enhancedUrl)
      setSliderPos(65)
      setHistory(prev => [
        { original: originalSrc, enhanced: enhancedUrl, food: analysis?.foodType || 'Prato', ts: Date.now() },
        ...prev.slice(0, 7),
      ])
      showToast('✨ Foto melhorada com Magnific AI!')
    } catch { showToast('Erro ao melhorar. Tente novamente.', 'er') }
    finally { setAppSt('ready') }
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  async function downloadFor(platform: Platform) {
    if (!originalSrc) return
    const spec = PLATFORMS.find(p => p.id === platform)!
    const canvas = document.createElement('canvas')
    canvas.width = spec.w; canvas.height = spec.h
    const ctx = canvas.getContext('2d')!
    const src = enhancedSrc || originalSrc
    const img = new Image()
    img.src = src
    await new Promise<void>(res => { img.onload = () => res() })

    const srcR = img.naturalWidth / img.naturalHeight
    const dstR = spec.w / spec.h
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
    if (srcR > dstR) { sw = sh * dstR; sx = (img.naturalWidth - sw) / 2 }
    else             { sh = sw / dstR; sy = (img.naturalHeight - sh) / 2 }

    ctx.filter = enhancedSrc ? 'none' : toFilter(adj)
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, spec.w, spec.h)

    const link = document.createElement('a')
    link.href     = canvas.toDataURL('image/jpeg', 0.92)
    link.download = `amore-${platform}-${Date.now()}.jpg`
    link.click()
    showToast(`📥 Exportado para ${spec.label}!`)
  }

  // ─── Derived ──────────────────────────────────────────────────────────────

  const isLoading = appSt === 'analyzing' || appSt === 'enhancing'
  const cat       = analysis ? FOOD_CATS[analysis.category as FoodCat] : null
  const filterStr = activePreset !== 'original' && !enhancedSrc ? toFilter(adj) : 'none'

  // ─── Render ───────────────────────────────────────────────────────────────

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
          backdropFilter: 'blur(10px)', boxShadow: 'var(--sh)', maxWidth: 320,
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #FF6B35 0%, #E8002D 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 0 20px rgba(255,107,53,.4)',
          }}>🍕</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--wh)', letterSpacing: '-.03em' }}>
                Amore Vision AI
              </h1>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                background: 'rgba(255,107,53,.15)', color: '#FF6B35',
                border: '1px solid rgba(255,107,53,.3)', borderRadius: 20, padding: '2px 8px',
              }}>NOVO</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>
              Editor Gastronômico Profissional — Foto de celular → Campanha profissional
            </div>
          </div>
        </div>
        {originalSrc && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ fontSize: 11, padding: '7px 12px' }}
              onClick={() => fileInputRef.current?.click()}>📷 Nova Foto</button>
            <button className="btn btn-al" style={{ fontSize: 11, padding: '7px 12px' }}
              onClick={analyzeImage} disabled={isLoading}>
              {appSt === 'analyzing' ? '⟳ Analisando…' : '🧠 Analisar com IA'}
            </button>
          </div>
        )}
      </div>

      {/* ─── Upload Zone ─── */}
      {!originalSrc && (
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? '#FF6B35' : 'rgba(0,196,180,.2)'}`,
            borderRadius: 20, background: isDragOver ? 'rgba(255,107,53,.04)' : 'var(--bk2)',
            padding: 80, textAlign: 'center', cursor: 'pointer',
            transition: 'all .2s', minHeight: 440,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
          }}
        >
          <div style={{ fontSize: 72, lineHeight: 1 }}>📸</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--wh)', marginBottom: 8 }}>
              Arraste sua foto aqui
            </div>
            <div style={{ fontSize: 12, color: 'var(--gr3)' }}>
              ou clique para selecionar • JPG, PNG, WEBP, HEIC • Máx. 25 MB
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['🍕 Pizza', '🍔 Hambúrguer', '🍱 Sushi', '🥩 Churrasco', '🍰 Sobremesa', '🥤 Drinks', '🍝 Massas', '🦐 Frutos do Mar'].map(tag => (
              <span key={tag} style={{
                padding: '4px 12px', borderRadius: 20, background: 'var(--bk3)',
                border: '1px solid var(--gr)', fontSize: 11, color: 'var(--gr3)',
              }}>{tag}</span>
            ))}
          </div>
          <div style={{
            marginTop: 8, padding: '12px 20px', borderRadius: 12,
            background: 'rgba(255,107,53,.06)', border: '1px solid rgba(255,107,53,.15)',
            fontSize: 11, color: 'var(--gr3)', maxWidth: 420, lineHeight: 1.6,
          }}>
            📱 Funciona com fotos de celular, baixa iluminação e fundo bagunçado.
            A IA identifica o prato e transforma em campanha profissional.
          </div>
        </div>
      )}

      {/* ─── Editor ─── */}
      {originalSrc && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

          {/* Left — image viewer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Info bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              padding: '8px 14px', background: 'var(--bk2)',
              border: '1px solid var(--gr)', borderRadius: 'var(--r2)',
            }}>
              {cat ? (
                <span style={{
                  background: `${cat.color}20`, color: cat.color,
                  border: `1px solid ${cat.color}40`,
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{cat.icon} {analysis?.foodType}</span>
              ) : (
                <span style={{ fontSize: 10, color: 'var(--gr3)' }}>📷 {fileName}</span>
              )}
              {analysis && (
                <>
                  <span style={{ fontSize: 10, color: 'var(--gr3)', flex: 1 }}>{analysis.description}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: scoreColor(analysis.qualityScore), flexShrink: 0 }}>
                    {analysis.qualityScore}/10
                  </span>
                </>
              )}
              {!analysis && (
                <span style={{ fontSize: 10, color: 'var(--gr)', marginLeft: 'auto', flexShrink: 0 }}>
                  ← Arraste para comparar →
                </span>
              )}
              {analysis && (
                <span style={{ fontSize: 9, color: 'var(--gr)', flexShrink: 0, marginLeft: 'auto' }}>← ANTES│DEPOIS →</span>
              )}
            </div>

            {/* Before/After viewer */}
            <div
              ref={imgContainerRef}
              style={{
                position: 'relative', overflow: 'hidden',
                borderRadius: 16, border: '1px solid var(--gr)',
                cursor: 'ew-resize', userSelect: 'none',
                background: '#000', aspectRatio: '4/3',
              }}
            >
              {/* BEFORE */}
              <img src={originalSrc} alt="Original"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />

              {/* AFTER */}
              <img
                src={enhancedSrc || originalSrc}
                alt="Melhorado"
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  objectFit: 'contain',
                  clipPath: `inset(0 ${(100 - sliderPos).toFixed(1)}% 0 0)`,
                  filter: filterStr,
                  transition: 'clip-path 0s',
                }}
              />

              {/* Divider line */}
              <div style={{
                position: 'absolute', top: 0, left: `${sliderPos}%`,
                width: 2, height: '100%', background: '#fff',
                transform: 'translateX(-50%)', pointerEvents: 'none',
                boxShadow: '0 0 8px rgba(0,0,0,.6)',
              }} />

              {/* Handle */}
              <div
                onMouseDown={onSliderDown}
                onTouchStart={onSliderTouch}
                style={{
                  position: 'absolute', top: '50%', left: `${sliderPos}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 38, height: 38, borderRadius: '50%',
                  background: '#fff', cursor: 'ew-resize',
                  boxShadow: '0 2px 16px rgba(0,0,0,.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#333', zIndex: 10, flexShrink: 0,
                }}
              >↔</div>

              {/* Labels */}
              <div style={{
                position: 'absolute', bottom: 10, left: 10, zIndex: 5,
                fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '.08em',
                background: 'rgba(0,0,0,.65)', padding: '3px 9px', borderRadius: 20,
              }}>ORIGINAL</div>
              <div style={{
                position: 'absolute', bottom: 10, right: 10, zIndex: 5,
                fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '.08em',
                background: enhancedSrc ? 'rgba(255,107,53,.8)' : 'rgba(0,196,180,.6)',
                padding: '3px 9px', borderRadius: 20,
              }}>{enhancedSrc ? '✨ IA' : activePreset !== 'original' ? `✨ ${PRESETS.find(p=>p.id===activePreset)?.label||'Ajustado'}` : 'MELHORADO'}</div>

              {/* Loading overlay */}
              {isLoading && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 20,
                  background: 'rgba(13,15,20,.85)', backdropFilter: 'blur(4px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
                }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    border: '3px solid rgba(255,107,53,.15)',
                    borderTop: '3px solid #FF6B35',
                    animation: 'vspin 1s linear infinite',
                  }} />
                  <div style={{ fontSize: 13, color: 'var(--wh)', fontWeight: 700 }}>
                    {appSt === 'analyzing' ? '🧠 Analisando prato com IA…' : '✨ Melhorando qualidade com Magnific…'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gr3)' }}>
                    {appSt === 'analyzing' ? 'Claude Vision está identificando o prato' : 'Aguarde alguns segundos'}
                  </div>
                </div>
              )}
            </div>

            {/* Action bar */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-al" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: 12 }}
                onClick={enhanceWithAI} disabled={isLoading}>
                {appSt === 'enhancing' ? '⟳ Processando…' : '✨ Melhorar com Magnific AI'}
              </button>
              <button className="btn" style={{ padding: '10px 16px', fontSize: 12 }}
                onClick={() => downloadFor(selPlatform)} disabled={isLoading}>
                📥 Baixar
              </button>
              {(enhancedSrc || activePreset !== 'original') && (
                <button className="btn" style={{ padding: '10px 14px', fontSize: 12, color: 'var(--er)' }}
                  onClick={() => { setEnhancedSrc(null); setAdj(DEFAULT_ADJ); setActivePreset('original'); setSliderPos(50) }}>
                  ↩
                </button>
              )}
            </div>
          </div>

          {/* Right — controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, background: 'var(--bk3)', borderRadius: 'var(--r2)', padding: 3 }}>
              {([
                { id: 'ajustes', label: '🎨 Ajustes' },
                { id: 'analise', label: '🧠 Análise' },
                { id: 'exportar', label: '📤 Exportar' },
              ] as { id: TabId; label: string }[]).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8,
                  border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700,
                  background: activeTab === tab.id ? 'var(--bk2)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--wh)' : 'var(--gr3)',
                  transition: 'all .15s',
                }}>{tab.label}</button>
              ))}
            </div>

            {/* ── Tab: Ajustes ── */}
            {activeTab === 'ajustes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Presets */}
                <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
                    🎨 Presets
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {PRESETS.map(p => (
                      <button key={p.id} onClick={() => applyPreset(p)} style={{
                        padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: activePreset === p.id ? 'rgba(255,107,53,.15)' : 'var(--bk3)',
                        color: activePreset === p.id ? '#FF6B35' : 'var(--gr3)',
                        outline: activePreset === p.id ? '1px solid rgba(255,107,53,.5)' : '1px solid var(--gr)',
                        fontSize: 9, fontWeight: 600, textAlign: 'center', transition: 'all .15s',
                        display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
                      }}>
                        <span style={{ fontSize: 18 }}>{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      ⚙️ Ajuste Fino
                    </div>
                    <button onClick={() => { setAdj(DEFAULT_ADJ); setActivePreset('original') }} style={{
                      fontSize: 9, color: 'var(--gr3)', background: 'var(--bk4)',
                      border: '1px solid var(--gr)', cursor: 'pointer', padding: '2px 8px', borderRadius: 4,
                    }}>↩ Reset</button>
                  </div>
                  {([
                    { key: 'brightness', label: '☀️ Brilho' },
                    { key: 'contrast',   label: '🌗 Contraste' },
                    { key: 'saturation', label: '🎨 Saturação' },
                    { key: 'warmth',     label: '🌡️ Temperatura' },
                  ] as { key: keyof Adj; label: string }[]).map(({ key, label }) => (
                    <div key={key} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--lgt)' }}>{label}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: adj[key] !== 0 ? '#FF6B35' : 'var(--gr3)' }}>
                          {adj[key] > 0 ? `+${adj[key]}` : adj[key]}
                        </span>
                      </div>
                      <input type="range" min={-50} max={50} value={adj[key]}
                        onChange={e => { setAdj(prev => ({ ...prev, [key]: +e.target.value })); setActivePreset('custom'); setEnhancedSrc(null) }}
                        style={{ width: '100%' }} />
                    </div>
                  ))}
                </div>

                {/* AI Enhancement CTA */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255,107,53,.07) 0%, rgba(232,0,45,.07) 100%)',
                  border: '1px solid rgba(255,107,53,.2)', borderRadius: 'var(--r2)', padding: 14,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--wh)', marginBottom: 6 }}>✨ IA Profissional</div>
                  <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 10, lineHeight: 1.5 }}>
                    Magnific AI melhora resolução, nitidez, cores e apetitosidade com inteligência artificial real.
                    Preserva aparência natural — sem queijo plástico.
                  </div>
                  <button className="btn" onClick={enhanceWithAI} disabled={isLoading} style={{
                    width: '100%', justifyContent: 'center', padding: '9px',
                    background: 'rgba(255,107,53,.15)', color: '#FF6B35',
                    border: '1px solid rgba(255,107,53,.3)', fontSize: 11,
                  }}>
                    {appSt === 'enhancing' ? '⟳ Processando…' : '🚀 Melhorar com Magnific AI'}
                  </button>
                  <div style={{ fontSize: 9, color: 'var(--gr)', marginTop: 6, textAlign: 'center' }}>
                    Requer MAGNIFIC_API_KEY em .env.local
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Análise ── */}
            {activeTab === 'analise' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {!analysis ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--wh)', marginBottom: 8 }}>Análise com Claude Vision</div>
                    <div style={{ fontSize: 11, color: 'var(--gr3)', marginBottom: 20, lineHeight: 1.6 }}>
                      Identifica o prato, analisa qualidade técnica e sugere ajustes profissionais específicos para o alimento.
                    </div>
                    <button className="btn btn-al" style={{ padding: '10px 24px', fontSize: 12 }}
                      onClick={analyzeImage} disabled={isLoading}>
                      {appSt === 'analyzing' ? '⟳ Analisando…' : '🧠 Analisar Agora'}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Food card */}
                    <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                          {cat && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: `${cat.color}20`, color: cat.color,
                              border: `1px solid ${cat.color}40`,
                              padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, marginBottom: 6,
                            }}>{cat.icon} {cat.label}</span>
                          )}
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--wh)', marginTop: 2 }}>{analysis.foodType}</div>
                          <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 3, lineHeight: 1.4 }}>{analysis.description}</div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: 52, marginLeft: 10 }}>
                          <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor(analysis.qualityScore), lineHeight: 1 }}>
                            {analysis.qualityScore}
                          </div>
                          <div style={{ fontSize: 9, color: 'var(--gr3)' }}>/10</div>
                        </div>
                      </div>
                      <div style={{ height: 5, background: 'var(--bk4)', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{
                          width: `${analysis.qualityScore * 10}%`, height: '100%',
                          background: scoreColor(analysis.qualityScore), borderRadius: 5,
                          transition: 'width .6s ease',
                        }} />
                      </div>
                    </div>

                    {/* Issues */}
                    {analysis.issues.length > 0 && (
                      <div style={{ background: 'var(--bk2)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 'var(--r2)', padding: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--er)', marginBottom: 8 }}>⚠️ Pontos a Melhorar</div>
                        {analysis.issues.map((issue, i) => (
                          <div key={i} style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 4, display: 'flex', gap: 6 }}>
                            <span style={{ color: 'var(--er)', flexShrink: 0 }}>•</span>{issue}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Strengths */}
                    {analysis.strengths.length > 0 && (
                      <div style={{ background: 'var(--bk2)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 'var(--r2)', padding: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ok)', marginBottom: 8 }}>✅ Pontos Fortes</div>
                        {analysis.strengths.map((s, i) => (
                          <div key={i} style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 4, display: 'flex', gap: 6 }}>
                            <span style={{ color: 'var(--ok)', flexShrink: 0 }}>•</span>{s}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {analysis.enhancementSuggestions.length > 0 && (
                      <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--al)', marginBottom: 8 }}>💡 Sugestões</div>
                        {analysis.enhancementSuggestions.map((s, i) => (
                          <div key={i} style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 6, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--al)', fontWeight: 700, minWidth: 16, flexShrink: 0 }}>{i + 1}.</span>
                            <span style={{ lineHeight: 1.4 }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Food-specific adjustments info */}
                    <div style={{
                      background: 'rgba(255,107,53,.06)', border: '1px solid rgba(255,107,53,.18)',
                      borderRadius: 'var(--r2)', padding: 12,
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#FF6B35', marginBottom: 6 }}>
                        🧠 Ajustes Inteligentes Aplicados
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--gr3)', lineHeight: 1.5 }}>
                        {cat ? `${cat.icon} ${cat.label}: brilho ${CATEGORY_ADJ[analysis.category as FoodCat].brightness > 0 ? '+' : ''}${CATEGORY_ADJ[analysis.category as FoodCat].brightness}, contraste +${CATEGORY_ADJ[analysis.category as FoodCat].contrast}, saturação +${CATEGORY_ADJ[analysis.category as FoodCat].saturation}, temperatura ${CATEGORY_ADJ[analysis.category as FoodCat].warmth > 0 ? '+' : ''}${CATEGORY_ADJ[analysis.category as FoodCat].warmth}` : ''}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--gr)', marginTop: 4 }}>
                        ✅ Prompt salvo no banco para próximas melhorias
                      </div>
                    </div>

                    <button className="btn" style={{ fontSize: 11, padding: '8px', justifyContent: 'center' }}
                      onClick={analyzeImage} disabled={isLoading}>
                      ⟳ Re-analisar
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── Tab: Exportar ── */}
            {activeTab === 'exportar' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Platform grid */}
                <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
                    📤 Plataforma de Destino
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {PLATFORMS.map(p => (
                      <button key={p.id} onClick={() => setSelPlatform(p.id)} style={{
                        padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: selPlatform === p.id ? 'rgba(255,107,53,.12)' : 'var(--bk3)',
                        color: selPlatform === p.id ? '#FF6B35' : 'var(--gr3)',
                        outline: selPlatform === p.id ? '1px solid rgba(255,107,53,.4)' : '1px solid var(--gr)',
                        fontSize: 10, fontWeight: 600, textAlign: 'center', transition: 'all .15s',
                        display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
                      }}>
                        <span style={{ fontSize: 20 }}>{p.icon}</span>
                        <span style={{ fontWeight: 700 }}>{p.label}</span>
                        <span style={{ fontSize: 8, color: 'var(--gr3)' }}>{p.size}</span>
                        <span style={{ fontSize: 8, color: 'var(--gr)' }}>{p.ratio}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn btn-al" style={{ padding: '12px', fontSize: 12, justifyContent: 'center' }}
                  onClick={() => downloadFor(selPlatform)} disabled={isLoading}>
                  📥 Baixar para {PLATFORMS.find(p => p.id === selPlatform)?.label}
                </button>

                {/* Export all */}
                <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 'var(--r2)', padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', marginBottom: 10 }}>📦 Exportar em Todos os Formatos</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {PLATFORMS.map(p => (
                      <button key={p.id} onClick={() => downloadFor(p.id)} className="btn" style={{
                        padding: '8px 12px', fontSize: 10, justifyContent: 'space-between',
                      }}>
                        <span>{p.icon} {p.label}</span>
                        <span style={{ color: 'var(--gr3)' }}>{p.size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: 9, color: 'var(--gr)', textAlign: 'center' }}>
                  Use "Melhorar com IA" antes de exportar para qualidade máxima
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── History ─── */}
      {history.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>
            📂 Histórico da Sessão
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {history.map((item, i) => (
              <div key={i}
                onClick={() => { setOriginalSrc(item.original); setEnhancedSrc(item.enhanced); setSliderPos(65); setAppSt('ready') }}
                style={{
                  background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12,
                  overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s',
                }}
              >
                <div style={{ display: 'flex' }}>
                  <img src={item.original} alt="" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                  <img src={item.enhanced} alt="" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '6px 8px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--lgt)' }}>{item.food}</div>
                  <div style={{ fontSize: 8, color: 'var(--gr3)' }}>
                    {new Date(item.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden input */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />

      <style>{`
        @keyframes vspin { to { transform: rotate(360deg); } }
        input[type=range] {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px; border-radius: 4px;
          background: var(--bk4); outline: none; cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 14px; height: 14px;
          border-radius: 50%; background: #FF6B35; cursor: pointer;
          box-shadow: 0 0 6px rgba(255,107,53,.5);
        }
        input[type=range]::-moz-range-thumb {
          width: 14px; height: 14px; border: none;
          border-radius: 50%; background: #FF6B35; cursor: pointer;
        }
      `}</style>
    </div>
  )
}
