'use client'
import { useState, useRef, useEffect } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

const PLATAFORMAS = ['Meta Ads','Google Ads','TikTok Ads','LinkedIn Ads']
const OBJETIVOS_CAMP = ['Conversão / Vendas','Geração de Leads','Tráfego para Site','Reconhecimento de Marca','Engajamento','Instalações de App','Visualizações de Vídeo']
const FORMATOS_ANUNCIO = ['Feed Imagem','Feed Vídeo','Stories','Reels','Carrossel','Coleção','Search','Display','YouTube']
const TONS_COPY = ['Direto e persuasivo','Emocional e storytelling','Prova social','Urgência e escassez','Educativo / Informativo','Comparativo']

export default function AgenteCampanhasPage() {
  const [msgs, setMsgs]       = useState<Msg[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab]         = useState<'chat'|'criar'|'analisar'|'copies'>('criar')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Form criar campanha
  const [crPlataforma, setCrPlataforma] = useState('Meta Ads')
  const [crObjetivo, setCrObjetivo]     = useState(OBJETIVOS_CAMP[0])
  const [crProduto, setCrProduto]       = useState('')
  const [crSegmento, setCrSegmento]     = useState('')
  const [crPublico, setCrPublico]       = useState('')
  const [crOrcamento, setCrOrcamento]   = useState('')
  const [crPeriodo, setCrPeriodo]       = useState('30 dias')
  const [crDiferencial, setCrDiferencial] = useState('')
  const [crCta, setCrCta]               = useState('')
  const [crResultado, setCrResultado]   = useState('')
  const [crLoading, setCrLoading]       = useState(false)

  // Form analisar campanha
  const [anNome, setAnNome]               = useState('')
  const [anPlataforma, setAnPlataforma]   = useState('Meta Ads')
  const [anPeriodo, setAnPeriodo]         = useState('30 dias')
  const [anObjetivo, setAnObjetivo]       = useState('conversão')
  const [anGasto, setAnGasto]             = useState('')
  const [anImpressoes, setAnImpressoes]   = useState('')
  const [anAlcance, setAnAlcance]         = useState('')
  const [anCliques, setAnCliques]         = useState('')
  const [anCtr, setAnCtr]                 = useState('')
  const [anCpc, setAnCpc]                 = useState('')
  const [anConversoes, setAnConversoes]   = useState('')
  const [anCpa, setAnCpa]                 = useState('')
  const [anRoas, setAnRoas]               = useState('')
  const [anFrequencia, setAnFrequencia]   = useState('')
  const [anResultado, setAnResultado]     = useState('')
  const [anLoading, setAnLoading]         = useState(false)

  // Form copies
  const [cpProduto, setCpProduto]         = useState('')
  const [cpPublico, setCpPublico]         = useState('')
  const [cpDiferencial, setCpDiferencial] = useState('')
  const [cpCta, setCpCta]                 = useState('')
  const [cpFormato, setCpFormato]         = useState('Feed Imagem')
  const [cpTom, setCpTom]                 = useState(TONS_COPY[0])
  const [cpResultado, setCpResultado]     = useState('')
  const [cpLoading, setCpLoading]         = useState(false)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  async function sendMsg() {
    if (!input.trim() || loading) return
    const userMsg: Msg = { role:'user', content:input }
    const newMsgs = [...msgs, userMsg]
    setMsgs(newMsgs); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/campanhas-agent', {
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

  async function criarCampanha() {
    if (!crProduto || crLoading) return
    setCrLoading(true); setCrResultado('')
    try {
      const res = await fetch('/api/campanhas-agent', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'criar_campanha', data:{ plataforma:crPlataforma, objetivo:crObjetivo, produto:crProduto, segmento:crSegmento, publico:crPublico, orcamento:crOrcamento, periodo:crPeriodo, diferencial:crDiferencial, cta:crCta } }),
      })
      const data = await res.json()
      setCrResultado(data.response || data.error || '')
    } catch { setCrResultado('❌ Erro ao gerar campanha.') }
    setCrLoading(false)
  }

  async function analisarCampanha() {
    if (!anGasto || anLoading) return
    setAnLoading(true); setAnResultado('')
    try {
      const res = await fetch('/api/campanhas-agent', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'analisar_campanha', data:{ nome:anNome, plataforma:anPlataforma, periodo:anPeriodo, objetivo:anObjetivo, orcamento_gasto:+anGasto, impressoes:+anImpressoes, alcance:+anAlcance, cliques:+anCliques, ctr:+anCtr, cpc:+anCpc, conversoes:+anConversoes, cpa:+anCpa, roas:+anRoas, frequencia:+anFrequencia } }),
      })
      const data = await res.json()
      setAnResultado(data.response || data.error || '')
    } catch { setAnResultado('❌ Erro ao analisar.') }
    setAnLoading(false)
  }

  async function gerarCopies() {
    if (!cpProduto || cpLoading) return
    setCpLoading(true); setCpResultado('')
    try {
      const res = await fetch('/api/campanhas-agent', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'gerar_copies', data:{ produto:cpProduto, publico:cpPublico, diferencial:cpDiferencial, cta:cpCta, formato:cpFormato, tom:cpTom } }),
      })
      const data = await res.json()
      setCpResultado(data.response || data.error || '')
    } catch { setCpResultado('❌ Erro ao gerar copies.') }
    setCpLoading(false)
  }

  function copiar(text: string) { navigator.clipboard.writeText(text) }

  const inputField = (label: string, val: string, set: (v:string)=>void, ph='', type='text') => (
    <div>
      <label className="lbl" style={{ fontSize:10 }}>{label}</label>
      <input className="inp" type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{ fontSize:12 }}/>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div className="topbar" style={{ flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#1877F2,#42B72A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🚀</div>
          <div>
            <span className="tb-title">TRAFFIC+ — Agente de Campanhas</span>
            <span className="tb-sub">Crie, analise e otimize campanhas de tráfego pago com IA</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className={`btn btn-sm ${tab==='criar'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('criar')}>🏗️ Criar Campanha</button>
          <button className={`btn btn-sm ${tab==='analisar'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('analisar')}>📊 Analisar</button>
          <button className={`btn btn-sm ${tab==='copies'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('copies')}>✍️ Copies</button>
          <button className={`btn btn-sm ${tab==='chat'?'btn-primary':'btn-ghost'}`} onClick={()=>setTab('chat')}>💬 Chat</button>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {tab==='criar'&&(
          <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
            <div style={{ width:300, flexShrink:0, borderRight:'1px solid var(--gr)', overflowY:'auto', padding:'16px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:12 }}>CONFIGURAR CAMPANHA</div>

              <div style={{ marginBottom:10 }}>
                <label className="lbl">Plataforma</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {PLATAFORMAS.map(p=>(
                    <button key={p} className={`btn btn-sm ${crPlataforma===p?'btn-primary':'btn-ghost'}`} onClick={()=>setCrPlataforma(p)} style={{ fontSize:10 }}>{p}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:10 }}>
                <label className="lbl">Objetivo</label>
                <select className="inp" value={crObjetivo} onChange={e=>setCrObjetivo(e.target.value)}>
                  {OBJETIVOS_CAMP.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
                {inputField('Produto / Serviço *', crProduto, setCrProduto, 'Ex: Plano de academia mensal R$99')}
                {inputField('Segmento', crSegmento, setCrSegmento, 'Ex: Academia fitness')}
              </div>
              <div style={{ marginBottom:10 }}>
                <label className="lbl" style={{ fontSize:10 }}>Público-Alvo</label>
                <textarea className="inp" rows={2} value={crPublico} onChange={e=>setCrPublico(e.target.value)}
                  placeholder="Ex: Mulheres 25-45 anos, interessadas em fitness, SP" style={{ resize:'none', fontSize:12 }}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                {inputField('Orçamento R$/mês', crOrcamento, setCrOrcamento, '1500', 'number')}
                <div>
                  <label className="lbl" style={{ fontSize:10 }}>Período</label>
                  <select className="inp" style={{ fontSize:12 }} value={crPeriodo} onChange={e=>setCrPeriodo(e.target.value)}>
                    {['15 dias','30 dias','60 dias','90 dias'].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {inputField('Diferencial do Produto', crDiferencial, setCrDiferencial, 'O que te diferencia da concorrência?')}
              <div style={{ marginTop:8, marginBottom:16 }}>
                {inputField('CTA Desejado', crCta, setCrCta, 'Ex: Matricule-se agora, Saiba mais, Peça já')}
              </div>

              <button className="btn btn-primary" style={{ width:'100%' }} onClick={criarCampanha} disabled={crLoading||!crProduto}>
                {crLoading?'⟳ Gerando…':'🏗️ Criar Estrutura Completa'}
              </button>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
              {!crResultado&&!crLoading&&(
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--gr3)' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🏗️</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--wh)', marginBottom:8 }}>Criar Campanha Completa</div>
                  <div style={{ fontSize:13, maxWidth:420, margin:'0 auto', lineHeight:1.6 }}>Preencha o briefing e receba estrutura completa: campanhas, conjuntos de anúncios, segmentações, copies e KPIs esperados.</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, maxWidth:450, margin:'24px auto 0' }}>
                    {[{i:'🏗️',l:'Estrutura'},{i:'🎯',l:'Segmentação'},{i:'✍️',l:'3 Copies'},{i:'💰',l:'Orçamento'},{i:'📊',l:'KPIs'},{i:'⚙️',l:'Configuração'}].map(f=>(
                      <div key={f.l} className="card" style={{ padding:'10px', textAlign:'center' }}>
                        <div style={{ fontSize:20 }}>{f.i}</div><div style={{ fontSize:11, color:'var(--wh)' }}>{f.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {crLoading&&<div style={{ textAlign:'center', padding:'80px 20px' }}><div style={{ fontSize:32, animation:'spin 1s linear infinite' }}>⟳</div><div style={{ color:'var(--gr3)', marginTop:12 }}>Criando estrutura para {crPlataforma}…</div></div>}
              {crResultado&&(
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--al)' }}>🏗️ Campanha — {crPlataforma}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>copiar(crResultado)}>📋 Copiar</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>{ setMsgs([{role:'assistant',content:crResultado}]); setTab('chat') }}>💬 Chat</button>
                    </div>
                  </div>
                  <div className="card" style={{ padding:'20px 24px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.9, whiteSpace:'pre-wrap' }}>{crResultado}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab==='analisar'&&(
          <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
            <div style={{ width:300, flexShrink:0, borderRight:'1px solid var(--gr)', overflowY:'auto', padding:'16px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:12 }}>DADOS DA CAMPANHA</div>

              <div style={{ marginBottom:10 }}>
                {inputField('Nome da Campanha', anNome, setAnNome, 'Campanha Julho 2026')}
              </div>
              <div style={{ marginBottom:10 }}>
                <label className="lbl">Plataforma</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {PLATAFORMAS.map(p=>(
                    <button key={p} className={`btn btn-sm ${anPlataforma===p?'btn-primary':'btn-ghost'}`} onClick={()=>setAnPlataforma(p)} style={{ fontSize:10 }}>{p}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                {inputField('Orçamento Gasto R$ *', anGasto, setAnGasto, '1200', 'number')}
                {inputField('Impressões', anImpressoes, setAnImpressoes, '80000', 'number')}
                {inputField('Alcance', anAlcance, setAnAlcance, '60000', 'number')}
                {inputField('Cliques', anCliques, setAnCliques, '1200', 'number')}
                {inputField('CTR %', anCtr, setAnCtr, '1.5', 'number')}
                {inputField('CPC R$', anCpc, setAnCpc, '1.00', 'number')}
                {inputField('Conversões', anConversoes, setAnConversoes, '45', 'number')}
                {inputField('CPA R$', anCpa, setAnCpa, '26.67', 'number')}
                {inputField('ROAS x', anRoas, setAnRoas, '3.5', 'number')}
                {inputField('Frequência x', anFrequencia, setAnFrequencia, '2.5', 'number')}
              </div>
              <button className="btn btn-primary" style={{ width:'100%' }} onClick={analisarCampanha} disabled={anLoading||!anGasto}>
                {anLoading?'⟳ Analisando…':'📊 Analisar Performance'}
              </button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
              {!anResultado&&!anLoading&&(
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--gr3)' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📊</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--wh)', marginBottom:8 }}>Análise de Performance</div>
                  <div style={{ fontSize:12 }}>Insira os dados de uma campanha e receba diagnóstico completo com ações de otimização</div>
                </div>
              )}
              {anLoading&&<div style={{ textAlign:'center', padding:'80px 20px' }}><div style={{ fontSize:32, animation:'spin 1s linear infinite' }}>⟳</div></div>}
              {anResultado&&(
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--al)' }}>📊 {anNome||'Campanha'} — {anPlataforma}</div>
                    <button className="btn btn-ghost btn-sm" onClick={()=>copiar(anResultado)}>📋 Copiar</button>
                  </div>
                  <div className="card" style={{ padding:'20px 24px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.9, whiteSpace:'pre-wrap' }}>{anResultado}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab==='copies'&&(
          <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
            <div style={{ width:300, flexShrink:0, borderRight:'1px solid var(--gr)', overflowY:'auto', padding:'16px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:12 }}>GERADOR DE COPIES</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
                {inputField('Produto / Serviço *', cpProduto, setCpProduto, 'Ex: Hambúrguer artesanal 200g')}
                {inputField('Público-Alvo', cpPublico, setCpPublico, 'Ex: Jovens 18-35 que curtem hambúrguer')}
                {inputField('Diferencial', cpDiferencial, setCpDiferencial, 'Ex: Carne bovina premium, pão brioche')}
                {inputField('CTA', cpCta, setCpCta, 'Ex: Peça agora pelo WhatsApp')}
              </div>
              <div style={{ marginBottom:10 }}>
                <label className="lbl">Formato do Anúncio</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {FORMATOS_ANUNCIO.map(f=>(
                    <button key={f} className={`btn btn-sm ${cpFormato===f?'btn-primary':'btn-ghost'}`} onClick={()=>setCpFormato(f)} style={{ fontSize:10 }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label className="lbl">Tom</label>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {TONS_COPY.map(t=>(
                    <button key={t} className={`btn btn-sm ${cpTom===t?'btn-primary':'btn-ghost'}`} onClick={()=>setCpTom(t)} style={{ textAlign:'left', fontSize:11 }}>{t}</button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{ width:'100%' }} onClick={gerarCopies} disabled={cpLoading||!cpProduto}>
                {cpLoading?'⟳ Gerando…':'✍️ Gerar 5 Copies'}
              </button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
              {!cpResultado&&!cpLoading&&(
                <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--gr3)' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>✍️</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--wh)', marginBottom:8 }}>Gerador de Copies</div>
                  <div style={{ fontSize:12 }}>Gere 5 variações de copy profissional para seus anúncios — headline, texto e CTA</div>
                </div>
              )}
              {cpLoading&&<div style={{ textAlign:'center', padding:'80px 20px' }}><div style={{ fontSize:32, animation:'spin 1s linear infinite' }}>⟳</div></div>}
              {cpResultado&&(
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--al)' }}>✍️ Copies — {cpFormato}</div>
                    <button className="btn btn-ghost btn-sm" onClick={()=>copiar(cpResultado)}>📋 Copiar tudo</button>
                  </div>
                  <div className="card" style={{ padding:'20px 24px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.9, whiteSpace:'pre-wrap' }}>{cpResultado}</div>
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
                  <div style={{ fontSize:48, marginBottom:12 }}>🚀</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--wh)', marginBottom:8 }}>TRAFFIC+ — Agente de Campanhas</div>
                  <div style={{ fontSize:13, color:'var(--gr3)', maxWidth:440, margin:'0 auto' }}>Especialista em Meta Ads, Google Ads e TikTok Ads. Pergunte qualquer coisa sobre tráfego pago!</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, maxWidth:500, margin:'20px auto 0', textAlign:'left' }}>
                    {['Como reduzir o CPM alto no Meta Ads?','Qual a diferença entre CTR e CVR?','Como montar uma campanha de remarketing no Google?','Quando pausar uma campanha que não converte?'].map(s=>(
                      <button key={s} className="btn btn-ghost btn-sm" onClick={()=>setInput(s)} style={{ textAlign:'left', fontSize:12 }}>🚀 {s}</button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m,i)=>(
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection:m.role==='user'?'row-reverse':'row' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:m.role==='user'?'var(--al)':'linear-gradient(135deg,#1877F2,#42B72A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{m.role==='user'?'👤':'🚀'}</div>
                  <div style={{ maxWidth:'78%', background:m.role==='user'?'var(--al)22':'var(--bk3)', border:`1px solid ${m.role==='user'?'var(--al)44':'var(--gr)'}`, borderRadius:12, padding:'10px 14px' }}>
                    <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{m.content}</div>
                    {m.role==='assistant'&&<button className="btn btn-ghost btn-sm" style={{ marginTop:6, fontSize:10 }} onClick={()=>copiar(m.content)}>📋 Copiar</button>}
                  </div>
                </div>
              ))}
              {loading&&<div style={{ display:'flex', gap:10 }}><div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#1877F2,#42B72A)', display:'flex', alignItems:'center', justifyContent:'center' }}>🚀</div><div style={{ background:'var(--bk3)', border:'1px solid var(--gr)', borderRadius:12, padding:'10px 14px' }}><div style={{ display:'flex', gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#1877F2', animation:`bounce 1s ${i*0.15}s infinite` }}/>)}</div></div></div>}
              <div ref={bottomRef}/>
            </div>
            <div style={{ padding:'12px 24px', borderTop:'1px solid var(--gr)', flexShrink:0, display:'flex', gap:10 }}>
              <textarea className="inp" rows={2} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMsg() } }}
                placeholder="Pergunte sobre campanhas, otimização, segmentação..." style={{ flex:1, resize:'none' }}/>
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
