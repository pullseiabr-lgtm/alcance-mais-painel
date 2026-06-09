'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

const TIPOS_CONTEUDO = [
  { id:'legenda',   label:'Legenda / Caption', icon:'📝', desc:'Post completo com hashtags' },
  { id:'roteiro',   label:'Roteiro Reels',     icon:'🎬', desc:'Script com cenas e tempo' },
  { id:'stories',   label:'Stories',           icon:'📱', desc:'Sequência de stories' },
  { id:'carrossel', label:'Carrossel',         icon:'📊', desc:'Slides 1 a 10' },
  { id:'copy-ads',  label:'Copy de Anúncio',  icon:'💰', desc:'Headline + texto + CTA' },
  { id:'hashtags',  label:'Hashtags',         icon:'#️⃣', desc:'Set estratégico' },
  { id:'bio',       label:'Bio / Sobre',      icon:'👤', desc:'Otimizada para conversão' },
  { id:'pauta',     label:'Pauta de Conteúdo',icon:'🗓️', desc:'Calendário semanal/mensal' },
]

const PLATAFORMAS = ['Instagram','TikTok','Facebook','YouTube','LinkedIn','Twitter/X']
const TONS = ['Descontraído','Profissional','Inspiracional','Humorístico','Urgente','Educativo','Emocional']
const SEGMENTOS_RAPIDOS = ['Restaurante','Moda','Saúde & Beleza','Fitness','Imobiliária','Educação','Tecnologia','Varejo','Serviços']

export default function AgenteConteudoPage() {
  const [msgs, setMsgs]         = useState<Msg[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [tab, setTab]           = useState<'chat'|'rapido'|'pauta'>('chat')

  // Form geração rápida
  const [tipo, setTipo]         = useState(TIPOS_CONTEUDO[0])
  const [plataforma, setPlataforma] = useState('Instagram')
  const [segmento, setSegmento] = useState('')
  const [tema, setTema]         = useState('')
  const [tom, setTom]           = useState('Descontraído')
  const [resultado, setResultado] = useState('')
  const [genLoading, setGenLoading] = useState(false)

  // Form pauta
  const [pautaSeg, setPautaSeg]     = useState('')
  const [pautaObj, setPautaObj]     = useState('')
  const [pautaFreq, setPautaFreq]   = useState('30 dias')
  const [pautaPlats, setPautaPlats] = useState(['Instagram'])
  const [pautaRes, setPautaRes]     = useState('')
  const [pautaLoading, setPautaLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  async function sendMsg() {
    if (!input.trim() || loading) return
    const userMsg: Msg = { role:'user', content:input }
    const newMsgs = [...msgs, userMsg]
    setMsgs(newMsgs); setInput(''); setLoading(true)

    try {
      const res = await fetch('/api/conteudo-agent', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: newMsgs }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role:'assistant', content: data.response || data.error || 'Erro' }])
    } catch {
      setMsgs(m => [...m, { role:'assistant', content:'❌ Erro de conexão.' }])
    }
    setLoading(false)
  }

  async function gerarRapido() {
    if (!tema.trim() || genLoading) return
    setGenLoading(true); setResultado('')

    try {
      const res = await fetch('/api/conteudo-agent', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'quick_generate', data:{ tipo:tipo.label, segmento, tema, tom, plataforma } }),
      })
      const data = await res.json()
      setResultado(data.response || data.error || '')
    } catch {
      setResultado('❌ Erro ao gerar conteúdo.')
    }
    setGenLoading(false)
  }

  async function gerarPauta() {
    if (!pautaSeg.trim() || pautaLoading) return
    setPautaLoading(true); setPautaRes('')

    try {
      const res = await fetch('/api/conteudo-agent', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'gerar_pauta', data:{ segmento:pautaSeg, objetivos:pautaObj, frequencia:pautaFreq, plataformas:pautaPlats } }),
      })
      const data = await res.json()
      setPautaRes(data.response || data.error || '')
    } catch {
      setPautaRes('❌ Erro ao gerar pauta.')
    }
    setPautaLoading(false)
  }

  function copiar(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Topbar */}
      <div className="topbar" style={{ flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#3B82F6,#06B6D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>✍️</div>
          <div>
            <span className="tb-title">COPY+ — Criador de Conteúdo</span>
            <span className="tb-sub">Legendas, roteiros, pautas e copies para todas as redes</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className={`btn btn-sm ${tab==='chat'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('chat')}>💬 Chat</button>
          <button className={`btn btn-sm ${tab==='rapido'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('rapido')}>⚡ Geração Rápida</button>
          <button className={`btn btn-sm ${tab==='pauta'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('pauta')}>🗓️ Pauta</button>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {tab==='chat'&&(
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Sugestões rápidas */}
            <div style={{ padding:'10px 24px', borderBottom:'1px solid var(--gr)', background:'var(--bk2)', flexShrink:0 }}>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[
                  '📝 Legenda para restaurante — promoção de almoço',
                  '🎬 Roteiro de Reels 30s para produto de beleza',
                  '#️⃣ Hashtags para academia fitness',
                  '📊 Carrossel "5 dicas de" para advogado',
                  '💰 Copy de anúncio para e-commerce de moda',
                ].map(s=>(
                  <button key={s} className="btn btn-ghost btn-sm" onClick={()=>setInput(s.split('— ').pop()!.trim().startsWith('para')?s:s)} style={{ fontSize:11 }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'16px 24px', display:'flex', flexDirection:'column', gap:14 }}>
              {msgs.length===0&&(
                <div style={{ textAlign:'center', marginTop:40 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>✍️</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--wh)', marginBottom:8 }}>COPY+ — Agente de Conteúdo</div>
                  <div style={{ fontSize:13, color:'var(--gr3)', maxWidth:440, margin:'0 auto', lineHeight:1.6 }}>
                    Crio legendas virais, roteiros de Reels, copies de anúncio, pautas mensais e muito mais. É só pedir!
                  </div>
                </div>
              )}
              {msgs.map((m,i)=>(
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection:m.role==='user'?'row-reverse':'row' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:m.role==='user'?'var(--al)':'linear-gradient(135deg,#3B82F6,#06B6D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                    {m.role==='user'?'👤':'✍️'}
                  </div>
                  <div style={{ maxWidth:'78%', background:m.role==='user'?'var(--al)22':'var(--bk3)', border:`1px solid ${m.role==='user'?'var(--al)44':'var(--gr)'}`, borderRadius:12, padding:'10px 14px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{m.content}</div>
                    {m.role==='assistant'&&(
                      <button className="btn btn-ghost btn-sm" style={{ marginTop:6, fontSize:10 }} onClick={()=>copiar(m.content)}>📋 Copiar</button>
                    )}
                  </div>
                </div>
              ))}
              {loading&&(
                <div style={{ display:'flex', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#3B82F6,#06B6D4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>✍️</div>
                  <div style={{ background:'var(--bk3)', border:'1px solid var(--gr)', borderRadius:12, padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:4 }}>
                      {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#3B82F6', animation:`bounce 1s ${i*0.15}s infinite` }}/>)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            <div style={{ padding:'12px 24px', borderTop:'1px solid var(--gr)', flexShrink:0, display:'flex', gap:10 }}>
              <textarea className="inp" rows={2} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMsg() } }}
                placeholder="Ex: Crie uma legenda para um restaurante japonês promovendo o rodízio..." style={{ flex:1, resize:'none' }}/>
              <button className="btn btn-primary" onClick={sendMsg} disabled={loading||!input.trim()} style={{ alignSelf:'flex-end', minWidth:80 }}>
                {loading?'…':'Enviar'}
              </button>
            </div>
          </div>
        )}

        {tab==='rapido'&&(
          <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
            {/* Configurações */}
            <div style={{ width:300, flexShrink:0, borderRight:'1px solid var(--gr)', overflowY:'auto', padding:'16px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:12 }}>TIPO DE CONTEÚDO</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                {TIPOS_CONTEUDO.map(t=>(
                  <button key={t.id} className={`btn btn-sm ${tipo.id===t.id?'btn-primary':'btn-ghost'}`}
                    onClick={()=>setTipo(t)} style={{ textAlign:'left', display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:16 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontWeight:600 }}>{t.label}</div>
                      <div style={{ fontSize:10, opacity:0.7 }}>{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:8 }}>PLATAFORMA</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:16 }}>
                {PLATAFORMAS.map(p=>(
                  <button key={p} className={`btn btn-sm ${plataforma===p?'btn-primary':'btn-ghost'}`} onClick={()=>setPlataforma(p)} style={{ fontSize:11 }}>{p}</button>
                ))}
              </div>

              <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:8 }}>TOM DE VOZ</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {TONS.map(t=>(
                  <button key={t} className={`btn btn-sm ${tom===t?'btn-primary':'btn-ghost'}`} onClick={()=>setTom(t)} style={{ fontSize:11 }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Área de input e resultado */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'16px', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="lbl">Segmento / Nicho</label>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
                    {SEGMENTOS_RAPIDOS.map(s=>(
                      <button key={s} className={`btn btn-sm ${segmento===s?'btn-primary':'btn-ghost'}`} onClick={()=>setSegmento(s)} style={{ fontSize:10 }}>{s}</button>
                    ))}
                  </div>
                  <input className="inp" value={segmento} onChange={e=>setSegmento(e.target.value)} placeholder="Ou escreva o segmento…"/>
                </div>
                <div>
                  <label className="lbl">Tema / Produto / Promoção *</label>
                  <textarea className="inp" rows={4} value={tema} onChange={e=>setTema(e.target.value)}
                    placeholder="Ex: Promoção de almoço executivo — R$29,90, serve 1 pessoa, segunda a sexta"
                    style={{ resize:'none' }}/>
                </div>
              </div>
              <button className="btn btn-primary" onClick={gerarRapido} disabled={genLoading||!tema.trim()} style={{ width:'100%' }}>
                {genLoading?'⟳ Gerando conteúdo…':`${tipo.icon} Gerar ${tipo.label}`}
              </button>

              {resultado&&(
                <div style={{ flex:1, overflowY:'auto' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--al)' }}>{tipo.icon} {tipo.label} — {plataforma}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize:11 }} onClick={()=>copiar(resultado)}>📋 Copiar tudo</button>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize:11 }} onClick={()=>{ setMsgs([{role:'assistant',content:resultado}]); setTab('chat') }}>💬 Continuar no chat</button>
                    </div>
                  </div>
                  <div className="card" style={{ padding:'16px 20px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{resultado}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab==='pauta'&&(
          <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
            <div style={{ width:300, flexShrink:0, borderRight:'1px solid var(--gr)', padding:'16px', overflowY:'auto' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:12 }}>CONFIGURAR PAUTA</div>

              <div style={{ marginBottom:12 }}>
                <label className="lbl">Segmento *</label>
                <input className="inp" value={pautaSeg} onChange={e=>setPautaSeg(e.target.value)} placeholder="Ex: Academia de musculação"/>
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="lbl">Objetivos</label>
                <textarea className="inp" rows={3} value={pautaObj} onChange={e=>setPautaObj(e.target.value)}
                  placeholder="Ex: Aumentar engajamento, gerar leads, vender plano anual"
                  style={{ resize:'none' }}/>
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="lbl">Período</label>
                {['7 dias','14 dias','30 dias','60 dias'].map(f=>(
                  <button key={f} className={`btn btn-sm ${pautaFreq===f?'btn-primary':'btn-ghost'}`}
                    onClick={()=>setPautaFreq(f)} style={{ marginRight:4, marginBottom:4, fontSize:11 }}>{f}</button>
                ))}
              </div>
              <div style={{ marginBottom:16 }}>
                <label className="lbl">Plataformas</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {PLATAFORMAS.map(p=>(
                    <button key={p} className={`btn btn-sm ${pautaPlats.includes(p)?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setPautaPlats(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p])} style={{ fontSize:11 }}>{p}</button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{ width:'100%' }} onClick={gerarPauta} disabled={pautaLoading||!pautaSeg}>
                {pautaLoading?'⟳ Criando pauta…':'🗓️ Gerar Pauta Completa'}
              </button>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
              {!pautaRes&&!pautaLoading&&(
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--gr3)' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🗓️</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--wh)', marginBottom:8 }}>Pauta de Conteúdo</div>
                  <div style={{ fontSize:12 }}>Configure o segmento, objetivos e período e clique em Gerar Pauta Completa</div>
                </div>
              )}
              {pautaLoading&&(
                <div style={{ textAlign:'center', padding:'60px 20px' }}>
                  <div style={{ fontSize:32, marginBottom:12, animation:'spin 1s linear infinite' }}>⟳</div>
                  <div style={{ color:'var(--gr3)', fontSize:13 }}>Criando pauta para {pautaFreq}…</div>
                </div>
              )}
              {pautaRes&&(
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--al)' }}>🗓️ Pauta — {pautaFreq} — {pautaSeg}</div>
                    <button className="btn btn-ghost btn-sm" onClick={()=>copiar(pautaRes)}>📋 Copiar</button>
                  </div>
                  <div className="card" style={{ padding:'20px 24px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.9, whiteSpace:'pre-wrap' }}>{pautaRes}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
