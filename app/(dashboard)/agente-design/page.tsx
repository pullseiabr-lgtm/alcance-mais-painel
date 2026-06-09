'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

const FORMATOS = [
  { id:'feed-square',    label:'Feed Quadrado',    size:'1080x1080', icon:'⬜' },
  { id:'feed-portrait',  label:'Feed Retrato',     size:'1080x1350', icon:'📱' },
  { id:'feed-landscape', label:'Feed Paisagem',    size:'1080x566',  icon:'🖼️' },
  { id:'stories',        label:'Stories / Reels',  size:'1080x1920', icon:'📹' },
  { id:'banner',         label:'Banner Web',       size:'1200x628',  icon:'🏷️' },
  { id:'cardapio',       label:'Cardápio Digital', size:'1080x1920', icon:'🍽️' },
  { id:'youtube',        label:'Thumbnail YT',     size:'1280x720',  icon:'🎬' },
]

const ESTILOS = [
  'Moderno & Clean','Minimalista','Colorido & Bold','Elegante & Luxo',
  'Rústico & Orgânico','Dark & Premium','Neon & Digital','Flat Design',
  'Fotografico','Aquarela','Tipográfico','Futurista',
]

const MODELOS_IA = [
  { id:'flux-schnell', label:'Flux Schnell', tag:'⚡ Rápido', color:'#3B82F6' },
  { id:'flux-pro',     label:'Flux Pro',     tag:'⭐ Premium', color:'#F59E0B' },
  { id:'flux-dev',     label:'Flux Dev',     tag:'🔬 Dev',    color:'#8B5CF6' },
  { id:'ideogram',     label:'Ideogram v2',  tag:'🎨 Textos', color:'#EC4899' },
  { id:'recraft',      label:'Recraft v3',   tag:'✏️ Vetorial', color:'#22C55E' },
]

const TEMPLATES = [
  { label:'Promoção / Oferta',     prompt:'Create a vibrant promotional post for social media with bold typography, discount badge, product highlight, clean background, professional marketing design, eye-catching colors' },
  { label:'Cardápio Restaurante',  prompt:'Create a beautiful restaurant menu digital design, elegant food photography style, warm colors, gourmet aesthetic, professional typography, dark background with golden accents' },
  { label:'Stories Produto',       prompt:'Create a modern Instagram story for product showcase, clean minimalist design, product in center, lifestyle background, call-to-action button, professional photography style' },
  { label:'Banner Evento',         prompt:'Create a professional event banner with modern design, dynamic layout, bold headline text space, vibrant gradient background, clean geometric shapes, social media optimized' },
  { label:'Thumbnail YouTube',     prompt:'Create a YouTube thumbnail with high contrast, bold text space, dramatic lighting, professional photography style, eye-catching composition, bright colors' },
  { label:'Post Motivacional',     prompt:'Create an inspirational quote social media post, elegant typography design, soft gradient background, minimalist aesthetic, professional finish' },
]

function parseImagePrompt(text: string): string | null {
  const match = text.match(/---PROMPT---\s*([\s\S]*?)\s*---/)
  return match ? match[1].trim() : null
}

export default function AgenteDesignPage() {
  const [msgs, setMsgs]       = useState<Msg[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [formato, setFormato] = useState(FORMATOS[0])
  const [estilo, setEstilo]   = useState(ESTILOS[0])
  const [modelo, setModelo]   = useState(MODELOS_IA[0])
  const [prompt, setPrompt]   = useState('')
  const [images, setImages]   = useState<{url:string, prompt:string, formato:string}[]>([])
  const [tab, setTab]         = useState<'chat'|'gerador'>('chat')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  async function sendMsg() {
    if (!input.trim() || loading) return
    const userMsg: Msg = { role:'user', content:input }
    const newMsgs = [...msgs, userMsg]
    setMsgs(newMsgs); setInput(''); setLoading(true)

    try {
      const res = await fetch('/api/design-agent', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: newMsgs }),
      })
      const data = await res.json()
      const reply = data.response || data.error || 'Erro ao processar'
      setMsgs(m => [...m, { role:'assistant', content:reply }])

      // Auto-detectar prompt de imagem no response
      const extracted = parseImagePrompt(reply)
      if (extracted) setPrompt(extracted)
    } catch (e) {
      setMsgs(m => [...m, { role:'assistant', content:'❌ Erro de conexão.' }])
    }
    setLoading(false)
  }

  async function generateImage() {
    if (!prompt.trim() || genLoading) return
    setGenLoading(true)

    const enhancedPrompt = `${prompt}, ${estilo.toLowerCase()} style, professional quality, sharp, detailed`

    try {
      const res = await fetch('/api/design-agent', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          action: 'generate_image',
          prompt: enhancedPrompt,
          model: modelo.id,
          size: formato.size,
        }),
      })
      const data = await res.json()
      if (data.imageUrl) {
        setImages(prev => [{ url:data.imageUrl, prompt, formato:formato.label }, ...prev.slice(0,11)])
      } else {
        alert(data.error || 'Erro ao gerar imagem')
      }
    } catch (e) {
      alert('Erro de conexão ao gerar imagem')
    }
    setGenLoading(false)
  }

  function useTemplate(t: typeof TEMPLATES[0]) {
    setTab('gerador')
    setPrompt(t.prompt)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Topbar */}
      <div className="topbar" style={{ flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#EC4899,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎨</div>
          <div>
            <span className="tb-title">ARTE+ — Agente Designer</span>
            <span className="tb-sub">Design para Instagram, Cardápio, Banner e muito mais</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className={`btn btn-sm ${tab==='chat'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('chat')}>💬 Chat</button>
          <button className={`btn btn-sm ${tab==='gerador'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('gerador')}>🖼️ Gerador</button>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {tab==='chat' ? (
          /* ── ABA CHAT ─────────────────────────────────────── */
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Templates rápidos */}
            <div style={{ padding:'12px 24px', borderBottom:'1px solid var(--gr)', background:'var(--bk2)', flexShrink:0 }}>
              <div style={{ fontSize:10, color:'var(--gr3)', fontWeight:700, marginBottom:8 }}>TEMPLATES RÁPIDOS</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {TEMPLATES.map(t=>(
                  <button key={t.label} className="btn btn-ghost btn-sm" onClick={()=>useTemplate(t)} style={{ fontSize:11 }}>🎨 {t.label}</button>
                ))}
              </div>
            </div>

            {/* Mensagens */}
            <div style={{ flex:1, overflowY:'auto', padding:'16px 24px', display:'flex', flexDirection:'column', gap:14 }}>
              {msgs.length===0&&(
                <div style={{ textAlign:'center', marginTop:40 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🎨</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--wh)', marginBottom:8 }}>ARTE+ — Agente Designer</div>
                  <div style={{ fontSize:13, color:'var(--gr3)', maxWidth:480, margin:'0 auto', lineHeight:1.6 }}>
                    Sou especialista em criar peças para Instagram, cardápios, banners e artes visuais.
                    Posso gerar prompts profissionais para IA e dar direcionamento criativo completo.
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, maxWidth:500, margin:'20px auto 0' }}>
                    {[
                      '🍕 Crie um cardápio digital para uma pizzaria',
                      '🎉 Banner promocional para Black Friday',
                      '📱 Post feed para lançamento de produto',
                      '🎬 Template de Stories para depoimento',
                    ].map(s=>(
                      <button key={s} className="btn btn-ghost btn-sm" onClick={()=>setInput(s)} style={{ fontSize:11, textAlign:'left' }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m,i)=>(
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection:m.role==='user'?'row-reverse':'row' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:m.role==='user'?'var(--al)':'linear-gradient(135deg,#EC4899,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                    {m.role==='user'?'👤':'🎨'}
                  </div>
                  <div style={{ maxWidth:'78%', background:m.role==='user'?'var(--al)22':'var(--bk3)', border:`1px solid ${m.role==='user'?'var(--al)44':'var(--gr)'}`, borderRadius:12, padding:'10px 14px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{m.content}</div>
                    {m.role==='assistant'&&parseImagePrompt(m.content)&&(
                      <button className="btn btn-sm" style={{ marginTop:8, background:'linear-gradient(135deg,#EC4899,#8B5CF6)', color:'#fff', border:'none', fontSize:11 }}
                        onClick={()=>{ setPrompt(parseImagePrompt(m.content)!); setTab('gerador') }}>
                        🖼️ Gerar esta imagem →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading&&(
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#EC4899,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🎨</div>
                  <div style={{ background:'var(--bk3)', border:'1px solid var(--gr)', borderRadius:12, padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--al)', animation:`bounce 1s ${i*0.15}s infinite` }}/>)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div style={{ padding:'12px 24px', borderTop:'1px solid var(--gr)', flexShrink:0, display:'flex', gap:10 }}>
              <textarea
                className="inp" rows={2}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMsg() } }}
                placeholder="Ex: Crie um cardápio para pizzaria com estilo rústico, cores quentes..."
                style={{ flex:1, resize:'none' }}
              />
              <button className="btn btn-primary" onClick={sendMsg} disabled={loading||!input.trim()} style={{ alignSelf:'flex-end', minWidth:80 }}>
                {loading?'…':'Enviar'}
              </button>
            </div>
          </div>
        ) : (
          /* ── ABA GERADOR ─────────────────────────────────── */
          <div style={{ flex:1, display:'flex', gap:0, overflow:'hidden' }}>
            {/* Painel esquerdo — configurações */}
            <div style={{ width:320, flexShrink:0, borderRight:'1px solid var(--gr)', overflowY:'auto', padding:'16px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:12 }}>CONFIGURAÇÕES</div>

              {/* Formato */}
              <div style={{ marginBottom:16 }}>
                <label className="lbl">Formato da Peça</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:4 }}>
                  {FORMATOS.map(f=>(
                    <button key={f.id} className={`btn btn-sm ${formato.id===f.id?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setFormato(f)} style={{ fontSize:10, textAlign:'left' }}>
                      {f.icon} {f.label}<br/>
                      <span style={{ opacity:0.6 }}>{f.size}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modelo de IA */}
              <div style={{ marginBottom:16 }}>
                <label className="lbl">Modelo de IA</label>
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:4 }}>
                  {MODELOS_IA.map(m=>(
                    <button key={m.id} className={`btn btn-sm ${modelo.id===m.id?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setModelo(m)} style={{ textAlign:'left', display:'flex', justifyContent:'space-between' }}>
                      <span>{m.label}</span>
                      <span style={{ fontSize:9, background:`${m.color}22`, color:m.color, padding:'2px 6px', borderRadius:10 }}>{m.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estilo */}
              <div style={{ marginBottom:16 }}>
                <label className="lbl">Estilo Visual</label>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:4 }}>
                  {ESTILOS.map(e=>(
                    <button key={e} className={`btn btn-sm ${estilo===e?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setEstilo(e)} style={{ fontSize:10 }}>{e}</button>
                  ))}
                </div>
              </div>

              {/* Templates */}
              <div>
                <label className="lbl">Templates de Prompt</label>
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:4 }}>
                  {TEMPLATES.map(t=>(
                    <button key={t.label} className="btn btn-ghost btn-sm" onClick={()=>setPrompt(t.prompt)} style={{ textAlign:'left', fontSize:11 }}>
                      🎨 {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Área principal */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              {/* Prompt */}
              <div style={{ padding:'16px', borderBottom:'1px solid var(--gr)', flexShrink:0 }}>
                <label className="lbl">Prompt da Imagem (inglês para melhores resultados)</label>
                <div style={{ display:'flex', gap:8, marginTop:4 }}>
                  <textarea className="inp" rows={3} value={prompt} onChange={e=>setPrompt(e.target.value)}
                    placeholder="Ex: Vibrant restaurant menu with elegant typography, dark background, golden accents, professional food photography style..."
                    style={{ flex:1, resize:'none' }}/>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <button className="btn btn-primary" onClick={generateImage} disabled={genLoading||!prompt.trim()}
                      style={{ minWidth:100, whiteSpace:'nowrap' }}>
                      {genLoading?'⟳ Gerando…':'🖼️ Gerar'}
                    </button>
                    <div style={{ fontSize:9, color:'var(--gr3)', textAlign:'center' }}>{formato.label}<br/>{formato.size}</div>
                    <div style={{ fontSize:9, color:'var(--gr3)', textAlign:'center' }}>{modelo.label}</div>
                  </div>
                </div>
              </div>

              {/* Galeria */}
              <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
                {images.length===0&&!genLoading&&(
                  <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--gr3)' }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>🖼️</div>
                    <div style={{ fontSize:14, fontWeight:600, color:'var(--wh)', marginBottom:8 }}>Nenhuma imagem gerada ainda</div>
                    <div style={{ fontSize:12 }}>Configure o formato, escolha um template ou escreva seu prompt e clique em Gerar</div>
                  </div>
                )}
                {genLoading&&(
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:32, marginBottom:12, animation:'spin 1s linear infinite' }}>⟳</div>
                      <div style={{ fontSize:13, color:'var(--gr3)' }}>Gerando com {modelo.label}…</div>
                      <div style={{ fontSize:11, color:'var(--gr3)', marginTop:4 }}>Formato: {formato.label} ({formato.size})</div>
                    </div>
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                  {images.map((img,i)=>(
                    <div key={i} className="card" style={{ padding:0, overflow:'hidden' }}>
                      <img src={img.url} alt={img.prompt} style={{ width:'100%', display:'block', aspectRatio:'1/1', objectFit:'cover' }}/>
                      <div style={{ padding:'8px 10px' }}>
                        <div style={{ fontSize:10, color:'var(--gr3)', marginBottom:6 }}>{img.formato}</div>
                        <div style={{ display:'flex', gap:4 }}>
                          <a href={img.url} target="_blank" rel="noreferrer" style={{ flex:1 }}>
                            <button className="btn btn-ghost btn-sm" style={{ width:'100%', fontSize:10 }}>⬇️ Download</button>
                          </a>
                          <button className="btn btn-ghost btn-sm" style={{ fontSize:10 }}
                            onClick={()=>{ setPrompt(img.prompt) }}>🔄</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
