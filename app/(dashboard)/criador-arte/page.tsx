'use client'
import { useState, useRef, useCallback, ChangeEvent, DragEvent } from 'react'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Preset = {
  id: string
  label: string
  icon: string
  optimizedFor: string
  prompt: string
  creativity: number
  hdr: number
  resemblance: number
}

type ScaleFactor = 2 | 4 | 8 | 16

// ── Presets Magnific ───────────────────────────────────────────────────────────

const PRESETS: Preset[] = [
  {
    id: 'photo',
    label: 'Fotografia',
    icon: '📷',
    optimizedFor: 'standard_photography',
    prompt: 'sharp details, professional photography, high resolution',
    creativity: 3,
    hdr: 2,
    resemblance: 8,
  },
  {
    id: 'portrait',
    label: 'Retratos',
    icon: '👤',
    optimizedFor: 'portraits',
    prompt: 'perfect skin, sharp eyes, professional portrait photography',
    creativity: 2,
    hdr: 1,
    resemblance: 9,
  },
  {
    id: 'product',
    label: 'Produto',
    icon: '🛍️',
    optimizedFor: 'standard_photography',
    prompt: 'product photography, sharp edges, studio lighting, commercial quality',
    creativity: 2,
    hdr: 3,
    resemblance: 9,
  },
  {
    id: 'food',
    label: 'Food',
    icon: '🍔',
    optimizedFor: 'standard_photography',
    prompt: 'food photography, vibrant colors, appetizing, sharp textures, warm light',
    creativity: 4,
    hdr: 5,
    resemblance: 7,
  },
  {
    id: 'art',
    label: 'Arte & Illus',
    icon: '🎨',
    optimizedFor: 'art_and_illustrations',
    prompt: 'high quality illustration, sharp lines, vibrant colors',
    creativity: 5,
    hdr: 2,
    resemblance: 7,
  },
  {
    id: 'cinema',
    label: 'Cinemático',
    icon: '🎬',
    optimizedFor: 'films_and_tv',
    prompt: 'cinematic, dramatic lighting, film grain, color graded, professional',
    creativity: 5,
    hdr: 6,
    resemblance: 6,
  },
  {
    id: 'fashion',
    label: 'Moda',
    icon: '👗',
    optimizedFor: 'standard_photography',
    prompt: 'fashion photography, editorial quality, sharp fabric textures, luxury feel',
    creativity: 3,
    hdr: 2,
    resemblance: 8,
  },
  {
    id: 'real_estate',
    label: 'Imóvel',
    icon: '🏠',
    optimizedFor: 'standard_photography',
    prompt: 'real estate photography, sharp architecture, clean lines, bright interiors',
    creativity: 2,
    hdr: 4,
    resemblance: 9,
  },
]

const SCALE_OPTIONS: { value: ScaleFactor; label: string; desc: string }[] = [
  { value: 2,  label: '2×',  desc: 'Rápido' },
  { value: 4,  label: '4×',  desc: 'Recomendado' },
  { value: 8,  label: '8×',  desc: 'Alta qualidade' },
  { value: 16, label: '16×', desc: 'Máximo' },
]

// ── Componente principal ───────────────────────────────────────────────────────

export default function CriadorArtePage() {
  const [originalFile, setOriginalFile]       = useState<File | null>(null)
  const [originalUrl, setOriginalUrl]         = useState<string | null>(null)
  const [enhancedUrl, setEnhancedUrl]         = useState<string | null>(null)
  const [isDragging, setIsDragging]           = useState(false)
  const [isProcessing, setIsProcessing]       = useState(false)
  const [progress, setProgress]               = useState(0)
  const [error, setError]                     = useState<string | null>(null)
  const [activePreset, setActivePreset]       = useState<string>('photo')
  const [scaleFactor, setScaleFactor]         = useState<ScaleFactor>(4)
  const [creativity, setCreativity]           = useState(3)
  const [hdr, setHdr]                         = useState(2)
  const [resemblance, setResemblance]         = useState(8)
  const [customPrompt, setCustomPrompt]       = useState('')
  const [showComparison, setShowComparison]   = useState(false)
  const [comparePos, setComparePos]           = useState(50)

  const fileInputRef  = useRef<HTMLInputElement>(null)
  const compareRef    = useRef<HTMLDivElement>(null)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Upload ──────────────────────────────────────────────────────────────────

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Por favor envie uma imagem (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Imagem muito grande. Máximo 20MB.')
      return
    }
    setError(null)
    setEnhancedUrl(null)
    setShowComparison(false)
    setOriginalFile(file)
    setOriginalUrl(URL.createObjectURL(file))

    // Aplica preset ativo
    const preset = PRESETS.find(p => p.id === activePreset)
    if (preset) {
      setCreativity(preset.creativity)
      setHdr(preset.hdr)
      setResemblance(preset.resemblance)
      setCustomPrompt(preset.prompt)
    }
  }

  function onFileInput(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave() {
    setIsDragging(false)
  }

  // ── Preset select ───────────────────────────────────────────────────────────

  function selectPreset(preset: Preset) {
    setActivePreset(preset.id)
    setCreativity(preset.creativity)
    setHdr(preset.hdr)
    setResemblance(preset.resemblance)
    setCustomPrompt(preset.prompt)
  }

  // ── Enhance ─────────────────────────────────────────────────────────────────

  async function enhance() {
    if (!originalFile || isProcessing) return
    setIsProcessing(true)
    setError(null)
    setEnhancedUrl(null)
    setShowComparison(false)
    setProgress(5)

    // Progresso simulado enquanto aguarda Magnific
    progressTimer.current = setInterval(() => {
      setProgress(p => {
        if (p >= 90) {
          if (progressTimer.current) clearInterval(progressTimer.current)
          return 90
        }
        return p + Math.random() * 4
      })
    }, 600)

    try {
      const form = new FormData()
      form.append('image',        originalFile)
      form.append('scaleFactor',  String(scaleFactor))
      form.append('creativity',   String(creativity))
      form.append('hdr',          String(hdr))
      form.append('resemblance',  String(resemblance))
      form.append('prompt',       customPrompt)
      const preset = PRESETS.find(p => p.id === activePreset)
      form.append('optimizedFor', preset?.optimizedFor ?? 'standard_photography')

      const res = await fetch('/api/magnific/enhance', {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Erro HTTP ${res.status}`)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setEnhancedUrl(url)
      setProgress(100)
      setShowComparison(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(msg)
    } finally {
      if (progressTimer.current) clearInterval(progressTimer.current)
      setIsProcessing(false)
    }
  }

  // ── Download ────────────────────────────────────────────────────────────────

  function download() {
    if (!enhancedUrl) return
    const a = document.createElement('a')
    a.href = enhancedUrl
    a.download = `alcance-magnific-${scaleFactor}x-${Date.now()}.jpg`
    a.click()
  }

  // ── Slider de comparação ────────────────────────────────────────────────────

  const onCompareMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!compareRef.current) return
    const rect = compareRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setComparePos(Math.max(0, Math.min(100, x)))
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────

  const currentPreset = PRESETS.find(p => p.id === activePreset)!

  return (
    <>
      <style>{`
        :root { --mg: #00C4B4; --mg2: #00E5D2; --mgb: rgba(0,196,180,.10); --mg3: rgba(0,196,180,.18); }

        /* ── Layout ── */
        .ca-wrap { display:flex; height:100vh; flex-direction:column; background:var(--bk); overflow:hidden; }

        /* ── Header ── */
        .ca-header {
          padding:14px 24px;
          border-bottom:1px solid rgba(0,196,180,.12);
          background:var(--bk2);
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0;
        }
        .ca-header-left { display:flex; align-items:center; gap:12px; }
        .ca-icon {
          width:40px; height:40px;
          background:linear-gradient(135deg,#00C4B4,#006B8A);
          border-radius:10px; display:flex; align-items:center; justify-content:center;
          font-size:20px; box-shadow:0 0 18px rgba(0,196,180,.35);
        }
        .ca-title { font-size:16px; font-weight:700; color:var(--wh); }
        .ca-sub   { font-size:11px; color:var(--gr3); margin-top:1px; }
        .ca-badges { display:flex; gap:6px; }
        .ca-badge {
          padding:3px 9px; border-radius:20px; font-size:9px; font-weight:700; border:1px solid;
        }
        .ca-badge--mg { color:var(--mg); border-color:rgba(0,196,180,.3); background:rgba(0,196,180,.08); }
        .ca-badge--ai { color:var(--pu); border-color:rgba(139,92,246,.3); background:rgba(139,92,246,.08); }
        .ca-badge--hd { color:var(--cy); border-color:rgba(6,182,212,.3); background:rgba(6,182,212,.08); }

        /* ── Alerta API Key ── */
        .ca-api-alert {
          background:linear-gradient(135deg,rgba(245,158,11,.08),rgba(239,68,68,.06));
          border:1px solid rgba(245,158,11,.25);
          border-radius:10px; padding:12px 16px;
          margin:14px 24px 0;
          display:flex; align-items:flex-start; gap:10px;
          flex-shrink:0;
        }
        .ca-api-alert-icon { font-size:18px; flex-shrink:0; margin-top:1px; }
        .ca-api-alert-title { font-size:12px; font-weight:700; color:var(--wr); }
        .ca-api-alert-txt { font-size:11px; color:var(--gr3); margin-top:3px; line-height:1.5; }
        .ca-api-alert-code {
          display:inline-block; background:var(--bk4); padding:2px 8px;
          border-radius:4px; font-family:var(--mono); font-size:10px; color:var(--mg2);
          margin-top:4px;
        }

        /* ── Body ── */
        .ca-body { display:flex; flex:1; min-height:0; }

        /* ── Painel esquerdo ── */
        .ca-panel {
          width:260px; flex-shrink:0;
          background:var(--bk2);
          border-right:1px solid rgba(0,196,180,.08);
          display:flex; flex-direction:column;
          overflow-y:auto; padding:14px 12px;
          gap:16px;
        }

        .ca-sec-label {
          font-size:9px; font-weight:700; text-transform:uppercase;
          letter-spacing:.15em; color:var(--gr3); margin-bottom:6px;
        }

        /* Presets */
        .ca-presets { display:grid; grid-template-columns:1fr 1fr; gap:5px; }
        .ca-preset {
          padding:8px 6px; border-radius:8px;
          border:1px solid var(--gr);
          background:var(--bk3);
          cursor:pointer; transition:.15s;
          display:flex; flex-direction:column; align-items:center; gap:3px;
          text-align:center;
        }
        .ca-preset:hover { border-color:var(--mg); background:var(--mgb); }
        .ca-preset--active { border-color:var(--mg) !important; background:var(--mgb) !important; }
        .ca-preset-icon { font-size:18px; }
        .ca-preset-label { font-size:9.5px; font-weight:600; color:var(--lgt); }

        /* Escala */
        .ca-scale { display:grid; grid-template-columns:repeat(4,1fr); gap:5px; }
        .ca-scale-btn {
          padding:7px 4px; border-radius:7px;
          border:1px solid var(--gr);
          background:var(--bk3);
          cursor:pointer; transition:.15s;
          display:flex; flex-direction:column; align-items:center; gap:1px;
        }
        .ca-scale-btn:hover { border-color:var(--mg); }
        .ca-scale-btn--active { border-color:var(--mg) !important; background:var(--mgb) !important; }
        .ca-scale-val { font-size:13px; font-weight:800; color:var(--wh); }
        .ca-scale-desc { font-size:8px; color:var(--gr3); }

        /* Sliders */
        .ca-slider-row { display:flex; flex-direction:column; gap:5px; }
        .ca-slider-top { display:flex; justify-content:space-between; align-items:center; }
        .ca-slider-name { font-size:11px; font-weight:600; color:var(--lgt); }
        .ca-slider-val {
          font-size:11px; font-weight:700; color:var(--mg2);
          font-family:var(--mono);
          background:var(--mgb); padding:1px 7px; border-radius:4px;
        }
        .ca-slider {
          width:100%; -webkit-appearance:none; height:4px;
          background:var(--bk4); border-radius:2px; cursor:pointer;
        }
        .ca-slider::-webkit-slider-thumb {
          -webkit-appearance:none; width:14px; height:14px;
          border-radius:50%; background:var(--mg);
          cursor:pointer; box-shadow:0 0 8px rgba(0,196,180,.5);
        }

        /* Prompt */
        .ca-textarea {
          width:100%; background:var(--bk3); border:1px solid var(--gr);
          border-radius:8px; padding:8px 10px;
          color:var(--lgt); font-size:11px; line-height:1.5;
          resize:none; height:70px;
          font-family:var(--f);
        }
        .ca-textarea:focus { outline:none; border-color:var(--mg); }
        .ca-textarea::placeholder { color:var(--gr2); }

        /* Botão enhance */
        .ca-enhance-btn {
          width:100%; padding:12px;
          background:linear-gradient(135deg,#00C4B4,#006B8A);
          border:none; border-radius:10px;
          font-size:13px; font-weight:700; color:#fff;
          cursor:pointer; transition:.15s;
          display:flex; align-items:center; justify-content:center; gap:8px;
          box-shadow:0 0 18px rgba(0,196,180,.3);
        }
        .ca-enhance-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
        .ca-enhance-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }

        /* ── Área de trabalho ── */
        .ca-work { flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden; }

        /* ── Upload zone ── */
        .ca-drop {
          flex:1; display:flex; align-items:center; justify-content:center;
          flex-direction:column; gap:16px;
          border:2px dashed var(--gr);
          border-radius:16px; margin:20px;
          cursor:pointer; transition:.2s;
          background:var(--bk3);
          text-align:center; padding:40px;
        }
        .ca-drop:hover, .ca-drop--drag {
          border-color:var(--mg); background:var(--mgb);
        }
        .ca-drop-icon { font-size:56px; opacity:.6; }
        .ca-drop-title { font-size:16px; font-weight:700; color:var(--wh); }
        .ca-drop-sub   { font-size:12px; color:var(--gr3); }
        .ca-drop-btn {
          padding:8px 20px; border-radius:8px;
          background:var(--mgb); border:1px solid rgba(0,196,180,.3);
          color:var(--mg2); font-size:12px; font-weight:600;
          cursor:pointer; transition:.15s;
        }
        .ca-drop-btn:hover { background:var(--mg3); }

        /* ── Preview / Comparison ── */
        .ca-preview-wrap { flex:1; display:flex; flex-direction:column; min-height:0; }

        .ca-preview-header {
          padding:12px 20px;
          border-bottom:1px solid rgba(0,196,180,.08);
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0;
        }
        .ca-preview-title { font-size:12px; font-weight:700; color:var(--wh); }
        .ca-preview-actions { display:flex; gap:8px; }
        .ca-action-btn {
          padding:6px 14px; border-radius:7px; font-size:11px; font-weight:600;
          cursor:pointer; transition:.15s; border:1px solid;
        }
        .ca-action-btn--dl {
          background:linear-gradient(135deg,#00C4B4,#006B8A);
          border-color:transparent; color:#fff;
        }
        .ca-action-btn--dl:hover { opacity:.85; }
        .ca-action-btn--new {
          background:var(--bk3); border-color:var(--gr); color:var(--lgt);
        }
        .ca-action-btn--new:hover { border-color:var(--mg); color:var(--wh); }

        /* Barra de progresso */
        .ca-progress-wrap {
          padding:14px 20px;
          display:flex; flex-direction:column; gap:6px;
          flex-shrink:0;
        }
        .ca-progress-label { font-size:11px; color:var(--gr3); display:flex; justify-content:space-between; }
        .ca-progress-bar { height:4px; background:var(--bk4); border-radius:2px; overflow:hidden; }
        .ca-progress-fill {
          height:100%;
          background:linear-gradient(90deg,#00C4B4,#00E5D2);
          border-radius:2px;
          transition:width .4s ease;
          box-shadow:0 0 8px rgba(0,196,180,.5);
        }
        .ca-progress-steps {
          display:flex; gap:6px; font-size:10px; color:var(--gr3);
        }
        .ca-progress-step { display:flex; align-items:center; gap:4px; }
        .ca-progress-dot {
          width:6px; height:6px; border-radius:50%;
          background:var(--mg); animation:mgPulse 1.2s infinite;
        }
        @keyframes mgPulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }

        /* Comparison slider */
        .ca-compare {
          flex:1; position:relative; overflow:hidden; user-select:none; cursor:col-resize;
        }
        .ca-compare img {
          position:absolute; top:0; left:0; width:100%; height:100%; object-fit:contain;
        }
        .ca-compare-after {
          clip-path:inset(0 0 0 var(--cp));
        }
        .ca-compare-line {
          position:absolute; top:0; bottom:0; width:2px;
          background:var(--mg);
          box-shadow:0 0 12px rgba(0,196,180,.6);
          pointer-events:none;
          left:var(--cp);
          transform:translateX(-50%);
        }
        .ca-compare-handle {
          position:absolute; top:50%; left:var(--cp); transform:translate(-50%,-50%);
          width:32px; height:32px; border-radius:50%;
          background:var(--mg); border:2px solid #fff;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 0 12px rgba(0,196,180,.6);
          pointer-events:none;
          color:#fff; font-size:12px; font-weight:700;
        }
        .ca-compare-label {
          position:absolute; bottom:14px;
          padding:4px 10px; border-radius:6px;
          font-size:10px; font-weight:700;
          backdrop-filter:blur(8px);
        }
        .ca-compare-label--before {
          left:14px; background:rgba(0,0,0,.5); color:#fff; border:1px solid var(--gr);
        }
        .ca-compare-label--after {
          right:14px; background:rgba(0,196,180,.2); color:var(--mg2); border:1px solid rgba(0,196,180,.3);
        }

        /* Erro */
        .ca-error {
          margin:10px 20px;
          padding:12px 16px; border-radius:10px;
          background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.25);
          color:var(--er); font-size:12px; line-height:1.5;
        }

        /* Spinner */
        @keyframes spin { to{ transform:rotate(360deg) } }
        .ca-spin { animation:spin .8s linear infinite; display:inline-block; }
      `}</style>

      <div className="ca-wrap">

        {/* ── Header ── */}
        <div className="ca-header">
          <div className="ca-header-left">
            <div className="ca-icon">✨</div>
            <div>
              <div className="ca-title">Criador de Arte — Magnific AI</div>
              <div className="ca-sub">Upscaling & Enhancement de Imagens com IA · Alcance+</div>
            </div>
          </div>
          <div className="ca-badges">
            <span className="ca-badge ca-badge--mg">Magnific AI</span>
            <span className="ca-badge ca-badge--ai">IA Generativa</span>
            <span className="ca-badge ca-badge--hd">Ultra HD</span>
          </div>
        </div>

        {/* ── Alerta API Key ── */}
        {!process.env.NEXT_PUBLIC_MAGNIFIC_CONFIGURED && (
          <div className="ca-api-alert">
            <span className="ca-api-alert-icon">🔑</span>
            <div>
              <div className="ca-api-alert-title">Configure sua API Key do Magnific AI</div>
              <div className="ca-api-alert-txt">
                Para usar o Magnific, adicione sua chave no arquivo <code style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--mg2)'}}>'.env.local'</code>:
                <br />
                <span className="ca-api-alert-code">MAGNIFIC_API_KEY=sua-chave-aqui</span>
                <br />
                <span style={{marginTop:4,display:'block'}}>
                  Sem chave? Acesse <strong style={{color:'var(--mg2)'}}>magnific.ai</strong> → Criar conta → API Keys
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="ca-body">

          {/* ── Painel de controles ── */}
          <div className="ca-panel">

            {/* Presets */}
            <div>
              <div className="ca-sec-label">Preset de Otimização</div>
              <div className="ca-presets">
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    className={`ca-preset${activePreset === p.id ? ' ca-preset--active' : ''}`}
                    onClick={() => selectPreset(p)}
                  >
                    <span className="ca-preset-icon">{p.icon}</span>
                    <span className="ca-preset-label">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fator de escala */}
            <div>
              <div className="ca-sec-label">Fator de Escala</div>
              <div className="ca-scale">
                {SCALE_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    className={`ca-scale-btn${scaleFactor === s.value ? ' ca-scale-btn--active' : ''}`}
                    onClick={() => setScaleFactor(s.value)}
                  >
                    <span className="ca-scale-val">{s.label}</span>
                    <span className="ca-scale-desc">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div className="ca-sec-label">Ajustes Finos</div>

              <div className="ca-slider-row">
                <div className="ca-slider-top">
                  <span className="ca-slider-name">Criatividade</span>
                  <span className="ca-slider-val">{creativity}</span>
                </div>
                <input
                  type="range" min={0} max={10} step={1}
                  value={creativity}
                  onChange={e => setCreativity(Number(e.target.value))}
                  className="ca-slider"
                />
                <div style={{fontSize:9,color:'var(--gr3)',display:'flex',justifyContent:'space-between'}}>
                  <span>Fiel ao original</span><span>Mais criativo</span>
                </div>
              </div>

              <div className="ca-slider-row">
                <div className="ca-slider-top">
                  <span className="ca-slider-name">HDR</span>
                  <span className="ca-slider-val">{hdr}</span>
                </div>
                <input
                  type="range" min={0} max={10} step={1}
                  value={hdr}
                  onChange={e => setHdr(Number(e.target.value))}
                  className="ca-slider"
                />
                <div style={{fontSize:9,color:'var(--gr3)',display:'flex',justifyContent:'space-between'}}>
                  <span>Natural</span><span>Dramático</span>
                </div>
              </div>

              <div className="ca-slider-row">
                <div className="ca-slider-top">
                  <span className="ca-slider-name">Semelhança</span>
                  <span className="ca-slider-val">{resemblance}</span>
                </div>
                <input
                  type="range" min={1} max={10} step={1}
                  value={resemblance}
                  onChange={e => setResemblance(Number(e.target.value))}
                  className="ca-slider"
                />
                <div style={{fontSize:9,color:'var(--gr3)',display:'flex',justifyContent:'space-between'}}>
                  <span>Mais liberdade</span><span>Fiel</span>
                </div>
              </div>
            </div>

            {/* Prompt */}
            <div>
              <div className="ca-sec-label">Prompt de Melhoria</div>
              <textarea
                className="ca-textarea"
                placeholder="Descreva como quer melhorar a imagem... (opcional)"
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
              />
              <div style={{fontSize:9,color:'var(--gr3)',marginTop:3}}>
                Preset ativo: <span style={{color:'var(--mg2)'}}>{currentPreset.icon} {currentPreset.label}</span>
              </div>
            </div>

            {/* Botão Enhance */}
            <button
              className="ca-enhance-btn"
              onClick={enhance}
              disabled={!originalFile || isProcessing}
            >
              {isProcessing
                ? <><span className="ca-spin">⟳</span> Processando no Magnific...</>
                : <>✨ Melhorar com Magnific AI</>
              }
            </button>

            {/* Info */}
            <div style={{padding:'10px',background:'var(--bk3)',borderRadius:8,border:'1px solid var(--gr)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--wh)',marginBottom:6}}>💡 O que o Magnific faz?</div>
              <div style={{fontSize:10,color:'var(--gr3)',lineHeight:1.6}}>
                • Aumenta resolução até <strong style={{color:'var(--mg2)'}}>16×</strong> sem perder qualidade<br/>
                • Adiciona detalhes reais via IA<br/>
                • Melhora nitidez, HDR e cores<br/>
                • Ideal para fotos, produtos e artes
              </div>
            </div>

          </div>

          {/* ── Área de trabalho ── */}
          <div className="ca-work">

            {/* Erro */}
            {error && (
              <div className="ca-error">
                <strong>⚠️ Erro:</strong> {error}
                {error.includes('MAGNIFIC_API_KEY') && (
                  <div style={{marginTop:6}}>
                    Adicione em <code style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--mg2)'}}>'.env.local'</code>:
                    <div style={{fontFamily:'var(--mono)',fontSize:10,marginTop:4,padding:'4px 8px',background:'var(--bk4)',borderRadius:4,color:'var(--mg2)'}}>
                      MAGNIFIC_API_KEY=sua-chave-aqui
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload zone */}
            {!originalUrl && (
              <div
                className={`ca-drop${isDragging ? ' ca-drop--drag' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="ca-drop-icon">🖼️</div>
                <div className="ca-drop-title">Solte sua imagem aqui</div>
                <div className="ca-drop-sub">
                  Arraste e solte ou clique para escolher<br/>
                  JPG, PNG, WEBP · Máximo 20MB
                </div>
                <button className="ca-drop-btn" onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}>
                  Escolher imagem
                </button>
                <div style={{marginTop:8,fontSize:11,color:'var(--gr3)'}}>
                  O Magnific irá melhorar e ampliar sua imagem com IA avançada
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{display:'none'}}
                  onChange={onFileInput}
                />
              </div>
            )}

            {/* Preview com comparação */}
            {originalUrl && (
              <div className="ca-preview-wrap">

                {/* Header preview */}
                <div className="ca-preview-header">
                  <div className="ca-preview-title">
                    {enhancedUrl
                      ? `✅ Imagem melhorada com Magnific ${scaleFactor}× — arraste para comparar`
                      : isProcessing
                        ? '⚙️ Processando no Magnific AI...'
                        : `📁 ${originalFile?.name} — pronto para melhorar`
                    }
                  </div>
                  <div className="ca-preview-actions">
                    {enhancedUrl && (
                      <button className="ca-action-btn ca-action-btn--dl" onClick={download}>
                        ⬇️ Baixar imagem melhorada
                      </button>
                    )}
                    <button
                      className="ca-action-btn ca-action-btn--new"
                      onClick={() => {
                        setOriginalFile(null)
                        setOriginalUrl(null)
                        setEnhancedUrl(null)
                        setShowComparison(false)
                        setError(null)
                        setProgress(0)
                      }}
                    >
                      + Nova imagem
                    </button>
                  </div>
                </div>

                {/* Barra de progresso durante processamento */}
                {isProcessing && (
                  <div className="ca-progress-wrap">
                    <div className="ca-progress-label">
                      <span>Enviando para o Magnific AI...</span>
                      <span style={{color:'var(--mg2)',fontFamily:'var(--mono)'}}>{Math.round(progress)}%</span>
                    </div>
                    <div className="ca-progress-bar">
                      <div className="ca-progress-fill" style={{width:`${progress}%`}} />
                    </div>
                    <div className="ca-progress-steps">
                      <span className="ca-progress-step"><span className="ca-progress-dot"/>Analisando imagem</span>
                      {progress > 30 && <span className="ca-progress-step"><span className="ca-progress-dot"/>Aplicando IA</span>}
                      {progress > 60 && <span className="ca-progress-step"><span className="ca-progress-dot"/>Renderizando {scaleFactor}×</span>}
                      {progress > 85 && <span className="ca-progress-step"><span className="ca-progress-dot"/>Finalizando</span>}
                    </div>
                  </div>
                )}

                {/* Comparação Before / After */}
                {showComparison && enhancedUrl ? (
                  <div
                    ref={compareRef}
                    className="ca-compare"
                    style={{ ['--cp' as string]: `${comparePos}%` }}
                    onMouseMove={onCompareMove}
                  >
                    {/* Before */}
                    <img src={originalUrl} alt="Original" />
                    {/* After */}
                    <img
                      src={enhancedUrl}
                      alt={`Magnific ${scaleFactor}×`}
                      className="ca-compare-after"
                    />
                    {/* Linha divisória */}
                    <div className="ca-compare-line" />
                    <div className="ca-compare-handle">⟺</div>
                    {/* Labels */}
                    <div className="ca-compare-label ca-compare-label--before">Original</div>
                    <div className="ca-compare-label ca-compare-label--after">Magnific {scaleFactor}×</div>
                  </div>
                ) : (
                  /* Preview simples antes de processar */
                  !isProcessing && (
                    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',padding:'20px'}}>
                      <img
                        src={originalUrl}
                        alt="Preview"
                        style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',borderRadius:12,border:'1px solid var(--gr)'}}
                      />
                    </div>
                  )
                )}

                {/* Placeholder de carregamento */}
                {isProcessing && !enhancedUrl && (
                  <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
                    <div style={{
                      width:80, height:80, borderRadius:'50%',
                      background:'var(--mgb)', border:'2px solid rgba(0,196,180,.3)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:36, animation:'mgPulse 1.5s infinite'
                    }}>✨</div>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:14,fontWeight:700,color:'var(--wh)'}}>Magnific AI trabalhando...</div>
                      <div style={{fontSize:12,color:'var(--gr3)',marginTop:4}}>
                        Aumentando {scaleFactor}× com detalhes reais gerados por IA
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
