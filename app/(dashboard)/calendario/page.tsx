'use client'
import { useState, useEffect } from 'react'
import { db, type PostCalendario } from '@/lib/db'

const CANAIS = ['Instagram','Facebook','TikTok','YouTube','LinkedIn','Twitter/X','WhatsApp','Blog','iFood']
const FORMATOS = ['Imagem','Vídeo','Reels','Stories','Carrossel','Post','Live','Blog']
const statusColor: Record<string,string> = {
  em_criacao:'badge-bl', revisao:'badge-wr', aprovado:'badge-al', agendado:'badge-pu', publicado:'badge-ok'
}
const STATUS_LIST = ['em_criacao','revisao','aprovado','agendado','publicado']
const STATUS_LABEL: Record<string,string> = {
  em_criacao:'Em Criação', revisao:'Revisão', aprovado:'Aprovado', agendado:'Agendado', publicado:'Publicado'
}

const EMPTY: Omit<PostCalendario,'id'|'created_at'> = {
  titulo:'', cliente_id:null, cliente_nome:'', canal:'Instagram', data: new Date().toISOString().slice(0,10),
  hora:'10:00', status:'em_criacao', formato:'Imagem', legenda:''
}

export default function CalendarioPage() {
  const [posts, setPosts]       = useState<PostCalendario[]>([])
  const [clientes, setClientes] = useState<{id:string,nome:string}[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState<Omit<PostCalendario,'id'|'created_at'>>(EMPTY)
  const [editing, setEditing]   = useState<string|null>(null)
  const [saving, setSaving]     = useState(false)
  const [filter, setFilter]     = useState('todos')

  async function load() {
    setLoading(true)
    const [{ data: p }, { data: cls }] = await Promise.all([
      db.calendario.listar(),
      db.clientes.listar(),
    ])
    setPosts(p ?? [])
    setClientes((cls??[]).map(c=>({id:c.id,nome:c.nome})))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = posts.filter(p => filter==='todos' || p.status===filter)

  // Agrupa por data
  const porData = filtered.reduce<Record<string, PostCalendario[]>>((acc, p) => {
    acc[p.data] = acc[p.data] ?? []
    acc[p.data].push(p)
    return acc
  }, {})
  const datas = Object.keys(porData).sort()

  async function save() {
    if (!form.titulo) return
    setSaving(true)
    if (editing) await db.calendario.atualizar(editing, form)
    else await db.calendario.criar(form)
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover post?')) return
    await db.calendario.deletar(id); load()
  }

  function openEdit(p: PostCalendario) {
    const { id, created_at, ...rest } = p; setForm(rest); setEditing(id); setModal(true)
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Calendário de Conteúdo</span>
          <span className="tb-sub">{posts.length} posts · {posts.filter(p=>p.status==='publicado').length} publicados</span>
        </div>
        <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Novo Post</button>
      </div>

      <div className="content">
        {/* Filtros status */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          <button className={`btn btn-sm ${filter==='todos'?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter('todos')}>Todos</button>
          {STATUS_LIST.map(s=>(
            <button key={s} className={`btn btn-sm ${filter===s?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(s)}>{STATUS_LABEL[s]}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando calendário…</div>
        ) : datas.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
            Nenhum post encontrado.<br/>
            <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Criar primeiro post</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {datas.map(data=>(
              <div key={data}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--al)', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ background:'var(--al)22', padding:'3px 10px', borderRadius:6, fontFamily:'var(--mono)' }}>
                    {new Date(data+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}
                  </span>
                  <span style={{ color:'var(--gr3)', fontWeight:400 }}>{porData[data].length} post{porData[data].length!==1?'s':''}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
                  {porData[data].map(p=>(
                    <div key={p.id} className="card" style={{ padding:'14px 16px', cursor:'pointer' }} onClick={()=>openEdit(p)}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:13, color:'var(--wh)', marginBottom:2 }}>{p.titulo}</div>
                          <div style={{ fontSize:11, color:'var(--gr3)' }}>{p.cliente_nome||'Sem cliente'}</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)', minWidth:28 }}
                          onClick={ev=>{ev.stopPropagation();remove(p.id)}}>🗑</button>
                      </div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <span className="badge">{p.canal}</span>
                        <span className="badge">{p.formato}</span>
                        <span className="badge" style={{ fontFamily:'var(--mono)' }}>{p.hora}</span>
                        <span className={`badge ${statusColor[p.status]??''}`}>{STATUS_LABEL[p.status]}</span>
                      </div>
                      {p.legenda && (
                        <div style={{ marginTop:8, fontSize:11, color:'var(--gr3)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {p.legenda}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(false);setForm(EMPTY);setEditing(null)}}}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Post':'Novo Post'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Título *</label>
                <input className="inp" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="Título do post"/>
              </div>
              <div>
                <label className="lbl">Cliente</label>
                <select className="inp" value={form.cliente_id??''} onChange={e=>{
                  const cl=clientes.find(c=>c.id===e.target.value)
                  setForm(f=>({...f,cliente_id:e.target.value||null,cliente_nome:cl?.nome??''}))
                }}>
                  <option value="">Nenhum</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Canal</label>
                <select className="inp" value={form.canal} onChange={e=>setForm(f=>({...f,canal:e.target.value}))}>
                  {CANAIS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Data</label>
                <input className="inp" type="date" value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Hora</label>
                <input className="inp" type="time" value={form.hora} onChange={e=>setForm(f=>({...f,hora:e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Formato</label>
                <select className="inp" value={form.formato} onChange={e=>setForm(f=>({...f,formato:e.target.value}))}>
                  {FORMATOS.map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  {STATUS_LIST.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Legenda / Descrição</label>
                <textarea className="inp" rows={3} value={form.legenda} onChange={e=>setForm(f=>({...f,legenda:e.target.value}))} placeholder="Texto do post, legenda, descrição…" style={{ resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.titulo}>{saving?'Salvando…':editing?'Salvar':'Adicionar Post'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
