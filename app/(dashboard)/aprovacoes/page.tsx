'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Aprovacao {
  id: string
  projeto_id: string | null
  cliente_id: string | null
  cliente_nome: string
  titulo: string
  descricao: string
  arquivo_url: string
  tipo: 'imagem' | 'video' | 'copy' | 'layout' | 'outro'
  status: 'aguardando' | 'aprovado' | 'reprovado' | 'em_revisao'
  feedback: string
  aprovado_por: string
  criado_por: string
  created_at: string
}

const TIPOS = ['imagem','video','copy','layout','outro'] as const
const STATUS_LIST = ['aguardando','aprovado','reprovado','em_revisao'] as const
const tipoLabel: Record<string,string> = { imagem:'Imagem', video:'Vídeo', copy:'Copy', layout:'Layout', outro:'Outro' }
const statusLabel: Record<string,string> = { aguardando:'Aguardando', aprovado:'Aprovado', reprovado:'Reprovado', em_revisao:'Em Revisão' }
const statusColor: Record<string,string> = { aguardando:'badge-wr', aprovado:'badge-ok', reprovado:'badge-er', em_revisao:'badge-bl' }
const tipoIcon: Record<string,string> = { imagem:'🖼️', video:'🎬', copy:'📝', layout:'🎨', outro:'📎' }

const EMPTY = {
  projeto_id: null as string|null,
  cliente_id: null as string|null,
  cliente_nome: '',
  titulo: '',
  descricao: '',
  arquivo_url: '',
  tipo: 'imagem' as const,
  status: 'aguardando' as const,
  feedback: '',
  aprovado_por: '',
  criado_por: '',
}

export default function AprovacoesPage() {
  const [pecas, setPecas]       = useState<Aprovacao[]>([])
  const [clientes, setClientes] = useState<{id:string,nome:string}[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [detail, setDetail]     = useState<Aprovacao|null>(null)
  const [form, setForm]         = useState(EMPTY)
  const [editing, setEditing]   = useState<string|null>(null)
  const [saving, setSaving]     = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [feedback, setFeedback] = useState('')
  const [feedbackModal, setFeedbackModal] = useState(false)

  const sb = createClient()

  async function load() {
    setLoading(true)
    const [{ data: p }, { data: cls }] = await Promise.all([
      sb.from('aprovacoes_pecas').select('*').order('created_at', { ascending: false }),
      sb.from('clientes').select('id,nome').order('nome'),
    ])
    setPecas(p ?? [])
    setClientes(cls ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.titulo) return
    setSaving(true)
    const payload = { ...form }
    if (editing) {
      await sb.from('aprovacoes_pecas').update(payload).eq('id', editing)
    } else {
      await sb.from('aprovacoes_pecas').insert(payload)
    }
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function aprovar(id: string, aprovadoPor: string) {
    await sb.from('aprovacoes_pecas').update({ status:'aprovado', aprovado_por:aprovadoPor }).eq('id', id)
    setDetail(null); load()
  }

  async function reprovar(id: string, feedbackText: string) {
    await sb.from('aprovacoes_pecas').update({ status:'reprovado', feedback:feedbackText }).eq('id', id)
    setFeedbackModal(false); setFeedback(''); setDetail(null); load()
  }

  async function changeStatus(id: string, status: string) {
    await sb.from('aprovacoes_pecas').update({ status }).eq('id', id)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover esta peça?')) return
    await sb.from('aprovacoes_pecas').delete().eq('id', id)
    load()
  }

  function openEdit(p: Aprovacao) {
    const { id, created_at, ...rest } = p
    setForm(rest as typeof EMPTY); setEditing(id); setDetail(null); setModal(true)
  }

  const filtrados = filtroStatus==='todos' ? pecas : pecas.filter(p=>p.status===filtroStatus)
  const aguardando = pecas.filter(p=>p.status==='aguardando').length
  const aprovados  = pecas.filter(p=>p.status==='aprovado').length
  const reprovados = pecas.filter(p=>p.status==='reprovado').length

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Aprovação de Peças</span>
          <span className="tb-sub">{pecas.length} peças · {aguardando} aguardando · {aprovados} aprovadas</span>
        </div>
        <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setDetail(null);setModal(true)}}>+ Enviar para Aprovação</button>
      </div>

      <div className="content">
        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
          {[
            { label:'Total de Peças',  val:String(pecas.length),     color:'var(--gr3)' },
            { label:'Aguardando',      val:String(aguardando),         color:'var(--wr)', blink: aguardando>0 },
            { label:'Aprovadas',       val:String(aprovados),          color:'var(--ok)' },
            { label:'Reprovadas',      val:String(reprovados),         color: reprovados>0?'var(--er)':'var(--gr3)' },
          ].map(k=>(
            <div key={k.label} className="card" style={{ padding:'16px 18px' }}>
              <div style={{ fontSize:11, color:'var(--gr3)', marginBottom:6 }}>{k.label}</div>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--mono)', color:k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Filtros por status */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {['todos',...STATUS_LIST].map(s=>(
            <button key={s} className={`btn btn-sm ${filtroStatus===s?'btn-primary':'btn-ghost'}`}
              onClick={()=>setFiltroStatus(s)}>{s==='todos'?'Todas':statusLabel[s]}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando peças…</div>
        ) : filtrados.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
            Nenhuma peça encontrada.<br/>
            <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Enviar para aprovação</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
            {filtrados.map(p=>(
              <div key={p.id} className="card" style={{ padding:'18px 20px', cursor:'pointer', borderLeft:`3px solid ${p.status==='aprovado'?'var(--ok)':p.status==='reprovado'?'var(--er)':p.status==='aguardando'?'var(--wr)':'var(--bl)'}` }}
                onClick={()=>setDetail(p)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ flex:1, marginRight:8 }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>{tipoIcon[p.tipo]}</div>
                    <div style={{ fontWeight:700, fontSize:13, color:'var(--wh)', marginBottom:2 }}>{p.titulo}</div>
                    <div style={{ fontSize:11, color:'var(--gr3)' }}>{p.cliente_nome||'—'}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)', minWidth:28 }}
                    onClick={ev=>{ev.stopPropagation();remove(p.id)}}>🗑</button>
                </div>
                <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                  <span className="badge">{tipoLabel[p.tipo]}</span>
                  <span className={`badge ${statusColor[p.status]??''}`}>{statusLabel[p.status]}</span>
                </div>
                {p.descricao&&<div style={{ fontSize:11, color:'var(--gr3)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', marginBottom:10 }}>{p.descricao}</div>}
                {p.feedback&&p.status==='reprovado'&&(
                  <div style={{ background:'var(--er)15', borderRadius:6, padding:'8px 10px', fontSize:11, color:'var(--er)', marginBottom:10 }}>
                    ❌ {p.feedback}
                  </div>
                )}
                {p.aprovado_por&&p.status==='aprovado'&&(
                  <div style={{ fontSize:10, color:'var(--ok)' }}>✅ Aprovado por {p.aprovado_por}</div>
                )}
                {p.status==='aguardando'&&(
                  <div style={{ display:'flex', gap:6, marginTop:10 }} onClick={e=>e.stopPropagation()}>
                    <button className="btn btn-sm" style={{ background:'var(--ok)22', color:'var(--ok)', border:'1px solid var(--ok)44', flex:1 }}
                      onClick={()=>{ const nome=prompt('Aprovado por:',''); if(nome) aprovar(p.id,nome) }}>✅ Aprovar</button>
                    <button className="btn btn-sm" style={{ background:'var(--er)22', color:'var(--er)', border:'1px solid var(--er)44', flex:1 }}
                      onClick={()=>{ setDetail(p); setFeedbackModal(true) }}>❌ Reprovar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal detalhe */}
      {detail&&!feedbackModal&&!modal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setDetail(null)}}>
          <div className="modal" style={{ maxWidth:560 }}>
            <div className="modal-hd">
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:'var(--wh)' }}>{tipoIcon[detail.tipo]} {detail.titulo}</div>
                <div style={{ display:'flex', gap:6, marginTop:4 }}>
                  <span className="badge">{tipoLabel[detail.tipo]}</span>
                  <span className={`badge ${statusColor[detail.status]}`}>{statusLabel[detail.status]}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(detail)}>✏️</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setDetail(null)}>✕</button>
              </div>
            </div>
            <div style={{ display:'grid', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { l:'Cliente', v:detail.cliente_nome||'—' },
                  { l:'Criado por', v:detail.criado_por||'—' },
                ].map(f=>(
                  <div key={f.l}>
                    <div style={{ fontSize:10, color:'var(--gr3)', fontWeight:700 }}>{f.l.toUpperCase()}</div>
                    <div style={{ fontSize:13, color:'var(--wh)' }}>{f.v}</div>
                  </div>
                ))}
              </div>
              {detail.descricao&&(
                <div style={{ background:'var(--bk3)', borderRadius:8, padding:'12px 14px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--al)', marginBottom:6 }}>Descrição</div>
                  <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.6 }}>{detail.descricao}</div>
                </div>
              )}
              {detail.arquivo_url&&(
                <a href={detail.arquivo_url} target="_blank" rel="noreferrer">
                  <button className="btn btn-ghost" style={{ width:'100%' }}>🔗 Ver Arquivo / Link da Peça</button>
                </a>
              )}
              {detail.feedback&&(
                <div style={{ background:'var(--er)15', border:'1px solid var(--er)33', borderRadius:8, padding:'12px 14px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--er)', marginBottom:4 }}>Feedback do Cliente</div>
                  <div style={{ fontSize:13, color:'var(--wh)' }}>{detail.feedback}</div>
                </div>
              )}
              {detail.status==='aguardando'&&(
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn" style={{ flex:1, background:'var(--ok)22', color:'var(--ok)', border:'1px solid var(--ok)44' }}
                    onClick={()=>{ const nome=prompt('Aprovado por:',''); if(nome) aprovar(detail.id,nome) }}>✅ Aprovar</button>
                  <button className="btn" style={{ flex:1, background:'var(--er)22', color:'var(--er)', border:'1px solid var(--er)44' }}
                    onClick={()=>setFeedbackModal(true)}>❌ Reprovar com Feedback</button>
                </div>
              )}
              {detail.status==='reprovado'&&(
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-ghost" style={{ flex:1 }}
                    onClick={()=>changeStatus(detail.id,'em_revisao').then(()=>setDetail(null))}>🔄 Enviar para Revisão</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal feedback reprovar */}
      {feedbackModal&&(
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth:440 }}>
            <div className="modal-hd">
              <span>❌ Reprovar Peça</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>setFeedbackModal(false)}>✕</button>
            </div>
            <div>
              <label className="lbl">Motivo / Feedback para a equipe</label>
              <textarea className="inp" rows={4} value={feedback} onChange={e=>setFeedback(e.target.value)}
                placeholder="Descreva o motivo da reprovação e o que precisa ser ajustado…" style={{ resize:'vertical' }}/>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
              <button className="btn btn-ghost" onClick={()=>setFeedbackModal(false)}>Cancelar</button>
              <button className="btn" style={{ background:'var(--er)', color:'#fff' }}
                onClick={()=>{ if(detail) reprovar(detail.id, feedback) }}>Reprovar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal form */}
      {modal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(false);setForm(EMPTY);setEditing(null)}}}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Peça':'Enviar para Aprovação'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Título da Peça *</label>
                <input className="inp" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="Ex: Post Feed — Promoção de Verão"/>
              </div>
              <div>
                <label className="lbl">Cliente</label>
                <select className="inp" value={form.cliente_id??''} onChange={e=>{
                  const cl=clientes.find(c=>c.id===e.target.value)
                  setForm(f=>({...f,cliente_id:e.target.value||null,cliente_nome:cl?.nome??''}))
                }}>
                  <option value="">Selecionar…</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Tipo</label>
                <select className="inp" value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value as any}))}>
                  {TIPOS.map(t=><option key={t} value={t}>{tipoIcon[t]} {tipoLabel[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  {STATUS_LIST.map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Criado por</label>
                <input className="inp" value={form.criado_por} onChange={e=>setForm(f=>({...f,criado_por:e.target.value}))} placeholder="Designer / Redator"/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Link do Arquivo (Drive, Figma, YouTube…)</label>
                <input className="inp" value={form.arquivo_url} onChange={e=>setForm(f=>({...f,arquivo_url:e.target.value}))} placeholder="https://drive.google.com/..."/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Descrição / Instruções</label>
                <textarea className="inp" rows={3} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))}
                  placeholder="Contexto, legenda sugerida, instruções de uso…" style={{ resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.titulo}>
                {saving?'Salvando…':editing?'Salvar':'Enviar para Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
