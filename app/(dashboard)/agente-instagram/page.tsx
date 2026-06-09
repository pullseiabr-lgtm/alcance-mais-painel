'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

const REDES = ['Instagram','TikTok','Facebook','YouTube','LinkedIn']
const OBJETIVOS = ['Crescimento de Seguidores','Engajamento','Geração de Leads','Vendas Diretas','Autoridade / Branding','Tráfego para Site']

export default function AgenteInstagramPage() {
  const [msgs, setMsgs]       = useState<Msg[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab]         = useState<'chat'|'analise'|'post'>('analise')
  const [resultado, setResultado] = useState('')
  const [analiseLoading, setAnaliseLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Form de análise de perfil
  const [rede, setRede]             = useState('Instagram')
  const [perfil, setPerfil]         = useState('')
  const [negocio, setNegocio]       = useState('')
  const [seguidores, setSeguidores] = useState('')
  const [seguindo, setSeguindo]     = useState('')
  const [posts, setPosts]           = useState('')
  const [engajamento, setEngajamento] = useState('')
  const [alcance, setAlcance]       = useState('')
  const [impressoes, setImpressoes] = useState('')
  const [saves, setSaves]           = useState('')
  const [shares, setShares]         = useState('')
  const [storiesViews, setStoriesViews] = useState('')
  const [melhorConteudo, setMelhorConteudo] = useState('')
  const [piorConteudo, setPiorConteudo] = useState('')
  const [concorrentes, setConcorrentes] = useState('')
  const [objetivo, setObjetivo]     = useState(OBJETIVOS[0])

  // Form análise de post
  const [postTipo, setPostTipo]     = useState('Reels')
  const [postHorario, setPostHorario] = useState('')
  const [postCurtidas, setPostCurtidas] = useState('')
  const [postComentarios, setPostComentarios] = useState('')
  const [postSaves, setPostSaves]   = useState('')
  const [postAlcance, setPostAlcance] = useState('')
  const [postResultado, setPostResultado] = useState('')
  const [postLoading, setPostLoading] = useState(false)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  async function sendMsg() {
    if (!input.trim() || loading) return
    const userMsg: Msg = { role:'user', content:input }
    const newMsgs = [...msgs, userMsg]
    setMsgs(newMsgs); setInput(''); setLoading(true)

    try {
      const res = await fetch('/api/instagram-agent', {
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

  async function analisarPerfil() {
    if (!perfil.trim() || analiseLoading) return
    setAnaliseLoading(true); setResultado('')

    try {
      const res = await fetch('/api/instagram-agent', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          action: 'analyze_profile',
          data: {
            rede_social: rede, perfil, descricao_negocio: negocio,
            seguidores: +seguidores || 0, seguindo: +seguindo || 0,
            posts: +posts || 0, engajamento_medio: +engajamento || 0,
            alcance_mensal: +alcance || 0, impressoes: +impressoes || 0,
            saves: +saves || 0, shares: +shares || 0,
            stories_views: +storiesViews || 0,
            melhor_conteudo: melhorConteudo, pior_conteudo: piorConteudo,
            concorrentes, objetivo,
          }
        }),
      })
      const data = await res.json()
      setResultado(data.response || data.error || '')
    } catch {
      setResultado('❌ Erro ao analisar perfil.')
    }
    setAnaliseLoading(false)
  }

  async function analisarPost() {
    if (!postAlcance || postLoading) return
    setPostLoading(true); setPostResultado('')

    try {
      const res = await fetch('/api/instagram-agent', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          action: 'analyze_post',
          data: {
            tipo_conteudo: postTipo, horario: postHorario,
            curtidas: +postCurtidas || 0, comentarios: +postComentarios || 0,
            saves: +postSaves || 0, alcance: +postAlcance || 0,
          }
        }),
      })
      const data = await res.json()
      setPostResultado(data.response || data.error || '')
    } catch {
      setPostResultado('❌ Erro ao analisar post.')
    }
    setPostLoading(false)
  }

  function copiar(text: string) { navigator.clipboard.writeText(text) }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div className="topbar" style={{ flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#E1306C,#F77737,#FCAF45)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📊</div>
          <div>
            <span className="tb-title">INSIGHT+ — Analista de Redes Sociais</span>
            <span className="tb-sub">Análise de perfil, estratégia de crescimento e diagnóstico de conteúdo</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className={`btn btn-sm ${tab==='analise'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('analise')}>📊 Análise de Perfil</button>
          <button className={`btn btn-sm ${tab==='post'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('post')}>📈 Análise de Post</button>
          <button className={`btn btn-sm ${tab==='chat'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('chat')}>💬 Chat</button>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {tab==='analise'&&(
          <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
            {/* Formulário */}
            <div style={{ width:320, flexShrink:0, borderRight:'1px solid var(--gr)', overflowY:'auto', padding:'16px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:12 }}>DADOS DO PERFIL</div>

              <div style={{ marginBottom:12 }}>
                <label className="lbl">Rede Social</label>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {REDES.map(r=>(
                    <button key={r} className={`btn btn-sm ${rede===r?'btn-primary':'btn-ghost'}`} onClick={()=>setRede(r)} style={{ fontSize:11 }}>{r}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:10 }}>
                <label className="lbl">@ do Perfil *</label>
                <input className="inp" value={perfil} onChange={e=>setPerfil(e.target.value)} placeholder="seuperfil (sem @)"/>
              </div>

              <div style={{ marginBottom:10 }}>
                <label className="lbl">Segmento / Negócio</label>
                <input className="inp" value={negocio} onChange={e=>setNegocio(e.target.value)} placeholder="Ex: Restaurante japonês em São Paulo"/>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                {[
                  { label:'Seguidores', val:seguidores, set:setSeguidores, ph:'10000' },
                  { label:'Seguindo', val:seguindo, set:setSeguindo, ph:'500' },
                  { label:'Total de Posts', val:posts, set:setPosts, ph:'200' },
                  { label:'Engaj. médio %', val:engajamento, set:setEngajamento, ph:'3.5' },
                  { label:'Alcance mensal', val:alcance, set:setAlcance, ph:'50000' },
                  { label:'Impressões', val:impressoes, set:setImpressoes, ph:'80000' },
                  { label:'Saves médios', val:saves, set:setSaves, ph:'150' },
                  { label:'Shares médios', val:shares, set:setShares, ph:'50' },
                  { label:'Views Stories', val:storiesViews, set:setStoriesViews, ph:'2000' },
                ].map(f=>(
                  <div key={f.label}>
                    <label className="lbl" style={{ fontSize:10 }}>{f.label}</label>
                    <input className="inp" type="number" value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{ fontSize:12 }}/>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:10 }}>
                <label className="lbl">Melhor conteúdo (que performou bem)</label>
                <textarea className="inp" rows={2} value={melhorConteudo} onChange={e=>setMelhorConteudo(e.target.value)}
                  placeholder="Ex: Reels de receita, posts de bastidores..." style={{ resize:'none' }}/>
              </div>
              <div style={{ marginBottom:10 }}>
                <label className="lbl">Pior conteúdo (que não performou)</label>
                <textarea className="inp" rows={2} value={piorConteudo} onChange={e=>setPiorConteudo(e.target.value)}
                  placeholder="Ex: Posts institucionais, fotos de produto simples..." style={{ resize:'none' }}/>
              </div>
              <div style={{ marginBottom:10 }}>
                <label className="lbl">Concorrentes (opcional)</label>
                <input className="inp" value={concorrentes} onChange={e=>setConcorrentes(e.target.value)} placeholder="@concorrente1, @concorrente2"/>
              </div>
              <div style={{ marginBottom:16 }}>
                <label className="lbl">Objetivo Principal</label>
                <select className="inp" value={objetivo} onChange={e=>setObjetivo(e.target.value)}>
                  {OBJETIVOS.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>

              <button className="btn btn-primary" style={{ width:'100%' }} onClick={analisarPerfil} disabled={analiseLoading||!perfil}>
                {analiseLoading?'⟳ Analisando…':'🔍 Analisar e Gerar Estratégia'}
              </button>
            </div>

            {/* Resultado */}
            <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
              {!resultado&&!analiseLoading&&(
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--gr3)' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📊</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--wh)', marginBottom:8 }}>Análise de Perfil</div>
                  <div style={{ fontSize:13, maxWidth:400, margin:'0 auto', lineHeight:1.6 }}>
                    Preencha os dados do perfil à esquerda e receba um diagnóstico completo com estratégia de crescimento para 90 dias.
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, maxWidth:400, margin:'24px auto 0' }}>
                    {[
                      { icon:'💪', label:'Pontos Fortes', desc:'O que está funcionando' },
                      { icon:'⚠️', label:'Fraquezas', desc:'O que precisa melhorar' },
                      { icon:'🎯', label:'Estratégia 90 dias', desc:'Plano de crescimento' },
                      { icon:'🔥', label:'Quick Wins', desc:'Ações para esta semana' },
                    ].map(f=>(
                      <div key={f.label} className="card" style={{ padding:'12px', textAlign:'center' }}>
                        <div style={{ fontSize:20, marginBottom:4 }}>{f.icon}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:'var(--wh)' }}>{f.label}</div>
                        <div style={{ fontSize:10, color:'var(--gr3)' }}>{f.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analiseLoading&&(
                <div style={{ textAlign:'center', padding:'80px 20px' }}>
                  <div style={{ fontSize:32, marginBottom:16, animation:'spin 1s linear infinite' }}>⟳</div>
                  <div style={{ fontSize:14, color:'var(--gr3)' }}>Analisando perfil @{perfil}…</div>
                  <div style={{ fontSize:12, color:'var(--gr3)', marginTop:6 }}>Gerando diagnóstico e estratégia completa</div>
                </div>
              )}
              {resultado&&(
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--al)' }}>📊 Análise — @{perfil} — {rede}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>copiar(resultado)}>📋 Copiar</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>{ setMsgs([{role:'assistant',content:resultado}]); setTab('chat') }}>💬 Continuar no chat</button>
                    </div>
                  </div>
                  <div className="card" style={{ padding:'20px 24px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.9, whiteSpace:'pre-wrap' }}>{resultado}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab==='post'&&(
          <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
            <div style={{ width:300, flexShrink:0, borderRight:'1px solid var(--gr)', padding:'16px', overflowY:'auto' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:12 }}>DADOS DO POST</div>

              <div style={{ marginBottom:10 }}>
                <label className="lbl">Tipo de Conteúdo</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {['Reels','Feed Foto','Carrossel','Stories','Live','IGTV'].map(t=>(
                    <button key={t} className={`btn btn-sm ${postTipo===t?'btn-primary':'btn-ghost'}`} onClick={()=>setPostTipo(t)} style={{ fontSize:11 }}>{t}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:10 }}>
                <label className="lbl">Horário de Publicação</label>
                <input className="inp" type="time" value={postHorario} onChange={e=>setPostHorario(e.target.value)}/>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                {[
                  { label:'Curtidas', val:postCurtidas, set:setPostCurtidas },
                  { label:'Comentários', val:postComentarios, set:setPostComentarios },
                  { label:'Saves', val:postSaves, set:setPostSaves },
                  { label:'Alcance *', val:postAlcance, set:setPostAlcance },
                ].map(f=>(
                  <div key={f.label}>
                    <label className="lbl" style={{ fontSize:10 }}>{f.label}</label>
                    <input className="inp" type="number" value={f.val} onChange={e=>f.set(e.target.value)} style={{ fontSize:12 }}/>
                  </div>
                ))}
              </div>

              {postAlcance&&(
                <div className="card" style={{ padding:'10px 12px', marginBottom:12 }}>
                  <div style={{ fontSize:10, color:'var(--gr3)', marginBottom:4 }}>TAXA DE ENGAJAMENTO</div>
                  <div style={{ fontSize:20, fontWeight:800, fontFamily:'var(--mono)', color: (() => {
                    const eng = ((+postCurtidas+(+postComentarios)+(+postSaves))/(+postAlcance)*100)
                    return eng>3?'var(--ok)':eng>1?'var(--wr)':'var(--er)'
                  })() }}>
                    {postAlcance?((((+postCurtidas)+(+postComentarios)+(+postSaves))/(+postAlcance))*100).toFixed(2):0}%
                  </div>
                </div>
              )}

              <button className="btn btn-primary" style={{ width:'100%' }} onClick={analisarPost} disabled={postLoading||!postAlcance}>
                {postLoading?'⟳ Analisando…':'📈 Analisar Post'}
              </button>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
              {!postResultado&&!postLoading&&(
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--gr3)' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📈</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--wh)', marginBottom:8 }}>Análise de Post Individual</div>
                  <div style={{ fontSize:12 }}>Insira as métricas de um post específico para receber feedback detalhado e recomendações</div>
                </div>
              )}
              {postLoading&&(
                <div style={{ textAlign:'center', padding:'60px 20px' }}>
                  <div style={{ fontSize:32, animation:'spin 1s linear infinite' }}>⟳</div>
                </div>
              )}
              {postResultado&&(
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--al)' }}>📈 Análise — {postTipo}</div>
                    <button className="btn btn-ghost btn-sm" onClick={()=>copiar(postResultado)}>📋 Copiar</button>
                  </div>
                  <div className="card" style={{ padding:'20px 24px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.9, whiteSpace:'pre-wrap' }}>{postResultado}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab==='chat'&&(
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ flex:1, overflowY:'auto', padding:'16px 24px', display:'flex', flexDirection:'column', gap:14 }}>
              {msgs.length===0&&(
                <div style={{ textAlign:'center', marginTop:40 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📊</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--wh)', marginBottom:8 }}>INSIGHT+ — Analista de Redes Sociais</div>
                  <div style={{ fontSize:13, color:'var(--gr3)', maxWidth:440, margin:'0 auto' }}>Pergunte qualquer coisa sobre estratégia, crescimento e análise de redes sociais.</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, maxWidth:500, margin:'20px auto 0', textAlign:'left' }}>
                    {['Como aumentar o engajamento no Instagram?','Qual a frequência ideal de postagem para restaurantes?','Como criar uma estratégia de hashtags eficiente?','Como analisar minha concorrência no Instagram?'].map(s=>(
                      <button key={s} className="btn btn-ghost btn-sm" onClick={()=>setInput(s)} style={{ textAlign:'left', fontSize:12 }}>💡 {s}</button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m,i)=>(
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection:m.role==='user'?'row-reverse':'row' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:m.role==='user'?'var(--al)':'linear-gradient(135deg,#E1306C,#F77737)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                    {m.role==='user'?'👤':'📊'}
                  </div>
                  <div style={{ maxWidth:'78%', background:m.role==='user'?'var(--al)22':'var(--bk3)', border:`1px solid ${m.role==='user'?'var(--al)44':'var(--gr)'}`, borderRadius:12, padding:'10px 14px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{m.content}</div>
                    {m.role==='assistant'&&<button className="btn btn-ghost btn-sm" style={{ marginTop:6, fontSize:10 }} onClick={()=>copiar(m.content)}>📋 Copiar</button>}
                  </div>
                </div>
              ))}
              {loading&&<div style={{ display:'flex', gap:10 }}><div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#E1306C,#F77737)', display:'flex', alignItems:'center', justifyContent:'center' }}>📊</div><div style={{ background:'var(--bk3)', border:'1px solid var(--gr)', borderRadius:12, padding:'10px 14px' }}><div style={{ display:'flex', gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#E1306C', animation:`bounce 1s ${i*0.15}s infinite` }}/>)}</div></div></div>}
              <div ref={bottomRef}/>
            </div>
            <div style={{ padding:'12px 24px', borderTop:'1px solid var(--gr)', flexShrink:0, display:'flex', gap:10 }}>
              <textarea className="inp" rows={2} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMsg() } }}
                placeholder="Pergunte sobre estratégia, crescimento, análise de concorrentes..." style={{ flex:1, resize:'none' }}/>
              <button className="btn btn-primary" onClick={sendMsg} disabled={loading||!input.trim()} style={{ alignSelf:'flex-end', minWidth:80 }}>
                {loading?'…':'Enviar'}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
