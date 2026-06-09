'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Briefing {
  id: string
  cliente_id: string | null
  cliente_nome: string
  projeto_id: string | null
  tipo: 'campanha' | 'conteudo' | 'criacao' | 'evento' | 'outro'
  titulo: string
  objetivos: string
  publico_alvo: string
  mensagem_chave: string
  referencias: string
  prazo: string | null
  orcamento: number | null
  status: 'aberto' | 'em_andamento' | 'concluido' | 'cancelado'
  criado_por: string
  created_at: string
}

const TIPOS = ['campanha','conteudo','criacao','evento','outro'] as const
const STATUS_LIST = ['aberto','em_andamento','concluido','cancelado'] as const
const tipoLabel: Record<string,string> = { campanha:'Campanha', conteudo:'Conteúdo', criacao:'Criação', evento:'Evento', outro:'Outro' }
const statusLabel: Record<string,string> = { aberto:'Aberto', em_andamento:'Em Andamento', concluido:'Concluído', cancelado:'Cancelado' }
const tipoColor: Record<string,string> = { campanha:'badge-al', conteudo:'badge-bl', criacao:'badge-pu', evento:'badge-ok', outro:'' }
const statusColor: Record<string,string> = { aberto:'badge-bl', em_andamento:'badge-wr', concluido:'badge-ok', cancelado:'badge-er' }

const EMPTY = {
  cliente_id: null as string | null,
  cliente_nome: '',
  projeto_id: null as string | null,
  tipo: 'campanha' as const,
  titulo: '',
  objetivos: '',
  publico_alvo: '',
  mensagem_chave: '',
  referencias: '',
  prazo: null as string | null,
  orcamento: null as number | null,
  status: 'aberto' as const,
  criado_por: '',
}

export default function BriefingsPage() {
  const [briefings, setBriefings] = useState<Briefing[]>([])
  const [clientes, setClientes]   = useState<{id:string,nome:string}[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [viewing, setViewing]     = useState<Briefing|null>(null)
  const [form, setForm]           = useState(EMPTY)
  const [editing, setEditing]     = useState<string|null>(null)
  const [saving, setSaving]       = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroTipo, setFiltroTipo]     = useState('todos')

  const sb = createClient()

  async function load() {
    setLoading(true)
    const [{ data: b }, { data: cls }] = await Promise.all([
      sb.from('briefings').select('*').order('created_at', { ascending: false }),
      sb.from('clientes').select('id,nome').order('nome'),
    ])
    setBriefings(b ?? [])
    setClientes(cls ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.titulo) return
    setSaving(true)
    const payload = { ...form }
    if (editing) {
      await sb.from('briefings').update(payload).eq('id', editing)
    } else {
      await sb.from('briefings').insert(payload)
    }
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover este briefing?')) return
    await sb.from('briefings').delete().eq('id', id)
    load()
  }

  async function changeStatus(id: string, status: string) {
    await sb.from('briefings').update({ status }).eq('id', id)
    load()
  }

  function openEdit(b: Briefing) {
    const { id, created_at, ...rest } = b
    setForm(rest as typeof EMPTY); setEditing(id); setViewing(null); setModal(true)
  }

  const filtrados = briefings.filter(b => {
    if (filtroStatus!=='todos' && b.status!==filtroStatus) return false
    if (filtroTipo!=='todos' && b.tipo!==filtroTipo) return false
    return true
  })

  const abertos   = briefings.filter(b=>b.status==='aberto').length
  const andamento = briefings.filter(b=>b.status==='em_andamento').length

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Briefings</span>
          <span className="tb-sub">{briefings.length} briefings · {abertos} abertos · {andamento} em andamento</span>
        </div>
        <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setViewing(null);setModal(true)}}>+ Novo Briefing</button>
      </div>

      <div className="content">
        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
          {[
            { label:'Total',        val:String(briefings.length),  color:'var(--gr3)' },
            { label:'Abertos',      val:String(abertos),            color:'var(--bl)' },
            { label:'Em Andamento', val:String(andamento),           color:'var(--wr)' },
            { label:'Concluídos',   val:String(briefings.filter(b=>b.status==='concluido').length), color:'var(--ok)' },
          ].map(k=>(
            <div key={k.label} className="card" style={{ padding:'16px 18px' }}>
              <div style={{ fontSize:11, color:'var(--gr3)', marginBottom:6 }}>{k.label}</div>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--mono)', color:k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:4 }}>
            {['todos',...STATUS_LIST].map(s=>(
              <button key={s} className={`btn btn-sm ${filtroStatus===s?'btn-primary':'btn-ghost'}`}
                onClick={()=>setFiltroStatus(s)}>{s==='todos'?'Todos Status':statusLabel[s]}</button>
            ))}
          </div>
          <div style={{ width:1, background:'var(--gr)', margin:'0 4px' }}/>
          <div style={{ display:'flex', gap:4 }}>
            {['todos',...TIPOS].map(t=>(
              <button key={t} className={`btn btn-sm ${filtroTipo===t?'btn-primary':'btn-ghost'}`}
                onClick={()=>setFiltroTipo(t)}>{t==='todos'?'Todos Tipos':tipoLabel[t]}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando briefings…</div>
        ) : filtrados.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
            Nenhum briefing encontrado.<br/>
            <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Criar briefing</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
            {filtrados.map(b=>(
              <div key={b.id} className="card" style={{ padding:'18px 20px', cursor:'pointer' }} onClick={()=>setViewing(b)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ flex:1, marginRight:8 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--wh)', marginBottom:4 }}>{b.titulo}</div>
                    <div style={{ fontSize:11, color:'var(--gr3)' }}>{b.cliente_nome||'Cliente não vinculado'}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)', minWidth:28 }}
                    onClick={ev=>{ev.stopPropagation();remove(b.id)}}>🗑</button>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
                  <span className={`badge ${tipoColor[b.tipo]??''}`}>{tipoLabel[b.tipo]}</span>
                  <span className={`badge ${statusColor[b.status]??''}`}>{statusLabel[b.status]}</span>
                  {b.prazo&&<span className="badge" style={{ fontFamily:'var(--mono)', fontSize:10 }}>📅 {new Date(b.prazo+'T12:00').toLocaleDateString('pt-BR')}</span>}
                  {b.orcamento&&<span className="badge badge-ok" style={{ fontFamily:'var(--mono)', fontSize:10 }}>R$ {b.orcamento.toLocaleString('pt-BR')}</span>}
                </div>
                {b.objetivos&&(
                  <div style={{ fontSize:11, color:'var(--gr3)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', marginBottom:10 }}>{b.objetivos}</div>
                )}
                <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }} onClick={e=>e.stopPropagation()}>
                  <select className="inp" style={{ padding:'3px 8px', fontSize:11, width:130 }}
                    value={b.status} onChange={e=>changeStatus(b.id, e.target.value)}>
                    {STATUS_LIST.map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}
                  </select>
                  <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(b)}>✏️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal visualização */}
      {viewing&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setViewing(null)}}>
          <div className="modal" style={{ maxWidth:640 }}>
            <div className="modal-hd">
              <div>
                <span style={{ fontWeight:800, fontSize:16 }}>{viewing.titulo}</span>
                <div style={{ display:'flex', gap:6, marginTop:4 }}>
                  <span className={`badge ${tipoColor[viewing.tipo]??''}`}>{tipoLabel[viewing.tipo]}</span>
                  <span className={`badge ${statusColor[viewing.status]??''}`}>{statusLabel[viewing.status]}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(viewing)}>✏️ Editar</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setViewing(null)}>✕</button>
              </div>
            </div>
            <div style={{ display:'grid', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { l:'Cliente', v: viewing.cliente_nome||'—' },
                  { l:'Criado por', v: viewing.criado_por||'—' },
                  { l:'Prazo', v: viewing.prazo ? new Date(viewing.prazo+'T12:00').toLocaleDateString('pt-BR') : '—' },
                  { l:'Orçamento', v: viewing.orcamento ? `R$ ${viewing.orcamento.toLocaleString('pt-BR')}` : '—' },
                ].map(f=>(
                  <div key={f.l}>
                    <div style={{ fontSize:10, color:'var(--gr3)', marginBottom:4, fontWeight:600 }}>{f.l.toUpperCase()}</div>
                    <div style={{ fontSize:13, color:'var(--wh)' }}>{f.v}</div>
                  </div>
                ))}
              </div>
              {[
                { l:'🎯 Objetivos', v: viewing.objetivos },
                { l:'👥 Público-Alvo', v: viewing.publico_alvo },
                { l:'💬 Mensagem-Chave', v: viewing.mensagem_chave },
                { l:'🔗 Referências', v: viewing.referencias },
              ].filter(f=>f.v).map(f=>(
                <div key={f.l} style={{ background:'var(--bk3)', borderRadius:8, padding:'12px 14px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--al)', marginBottom:6 }}>{f.l}</div>
                  <div style={{ fontSize:13, color:'var(--wh)', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{f.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal form */}
      {modal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(false);setForm(EMPTY);setEditing(null)}}}>
          <div className="modal" style={{ maxWidth:600 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Briefing':'Novo Briefing'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Título *</label>
                <input className="inp" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="Ex: Campanha Dia dos Namorados — Instagram"/>
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
                  {TIPOS.map(t=><option key={t} value={t}>{tipoLabel[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Prazo</label>
                <input className="inp" type="date" value={form.prazo??''} onChange={e=>setForm(f=>({...f,prazo:e.target.value||null}))}/>
              </div>
              <div>
                <label className="lbl">Orçamento (R$)</label>
                <input className="inp" type="number" min="0" value={form.orcamento??''} onChange={e=>setForm(f=>({...f,orcamento:e.target.value?+e.target.value:null}))}/>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  {STATUS_LIST.map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Criado por</label>
                <input className="inp" value={form.criado_por} onChange={e=>setForm(f=>({...f,criado_por:e.target.value}))} placeholder="Nome do responsável"/>
              </div>
              {[
                { key:'objetivos', label:'🎯 Objetivos *', ph:'O que queremos alcançar com esta campanha/peça?' },
                { key:'publico_alvo', label:'👥 Público-Alvo', ph:'Quem é a audiência? Faixa etária, interesses, localização…' },
                { key:'mensagem_chave', label:'💬 Mensagem-Chave', ph:'Qual é o conceito principal que queremos comunicar?' },
                { key:'referencias', label:'🔗 Referências', ph:'Links, exemplos, concorrentes, referências visuais…' },
              ].map(({ key, label, ph })=>(
                <div key={key} style={{ gridColumn:'1/-1' }}>
                  <label className="lbl">{label}</label>
                  <textarea className="inp" rows={3} value={(form as any)[key]}
                    onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                    placeholder={ph} style={{ resize:'vertical' }}/>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.titulo}>
                {saving?'Salvando…':editing?'Salvar':'Criar Briefing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
