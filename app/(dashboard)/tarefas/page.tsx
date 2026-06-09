'use client'
import { useState, useEffect } from 'react'
import { db, type Tarefa } from '@/lib/db'

const STATUS_COLS = ['a_fazer','em_andamento','revisao','concluido'] as const
const STATUS_LABEL: Record<string,string> = { a_fazer:'A Fazer', em_andamento:'Em Andamento', revisao:'Revisão', concluido:'Concluído' }
const STATUS_COLOR: Record<string,string> = { a_fazer:'#8892B0', em_andamento:'#00C4B4', revisao:'#F59E0B', concluido:'#22C55E' }
const PRIOR_COLOR: Record<string,string> = { urgente:'var(--er)', alta:'var(--wr)', media:'var(--bl)', baixa:'var(--gr3)' }
const TAGS_SUGESTOES = ['Design','Copywriting','Tráfego','SEO','Social','Vídeo','Landing Page','E-mail','Analytics','CRM']

const EMPTY: Omit<Tarefa,'id'|'created_at'|'updated_at'> = {
  titulo:'', descricao:'', responsavel:'', responsavel_id:null, projeto_id:null,
  cliente_id:null, cliente_nome:'', prioridade:'media', status:'a_fazer', prazo:null, tags:[], checklist:[]
}

export default function TarefasPage() {
  const [tarefas, setTarefas]   = useState<Tarefa[]>([])
  const [clientes, setClientes] = useState<{id:string,nome:string}[]>([])
  const [projetos, setProjetos] = useState<{id:string,titulo:string}[]>([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState<'kanban'|'lista'>('kanban')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState<Omit<Tarefa,'id'|'created_at'|'updated_at'>>(EMPTY)
  const [editing, setEditing]   = useState<string|null>(null)
  const [saving, setSaving]     = useState(false)
  const [tagInput, setTagInput] = useState('')

  async function load() {
    setLoading(true)
    const [{ data: tar }, { data: cls }, { data: prj }] = await Promise.all([
      db.tarefas.listar(),
      db.clientes.listar(),
      db.projetos.listar(),
    ])
    setTarefas(tar ?? [])
    setClientes((cls??[]).map(c=>({id:c.id,nome:c.nome})))
    setProjetos((prj??[]).map(p=>({id:p.id,titulo:p.titulo})))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.titulo) return
    setSaving(true)
    if (editing) await db.tarefas.atualizar(editing, form)
    else await db.tarefas.criar(form)
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover tarefa?')) return
    await db.tarefas.deletar(id); load()
  }

  async function moverStatus(id: string, status: Tarefa['status']) {
    await db.tarefas.atualizar(id, { status }); load()
  }

  function openEdit(t: Tarefa) {
    const { id, created_at, updated_at, ...rest } = t; setForm(rest); setEditing(id); setModal(true)
  }

  function addTag(tag: string) {
    if (!tag.trim() || form.tags.includes(tag.trim())) return
    setForm(f=>({...f, tags:[...f.tags, tag.trim()]})); setTagInput('')
  }

  function addCheckItem() {
    const id = Date.now().toString()
    setForm(f=>({...f, checklist:[...f.checklist, {id, texto:'', feito:false}]}))
  }

  const concluidasPct = tarefas.length ? Math.round(tarefas.filter(t=>t.status==='concluido').length/tarefas.length*100) : 0

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Tarefas</span>
          <span className="tb-sub">{tarefas.length} tarefas · {concluidasPct}% concluídas</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {(['kanban','lista'] as const).map(v=>(
            <button key={v} className={`btn btn-sm ${view===v?'btn-primary':'btn-ghost'}`} onClick={()=>setView(v)}>{v==='kanban'?'Kanban':'Lista'}</button>
          ))}
          <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Nova Tarefa</button>
        </div>
      </div>

      <div className="content">
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando tarefas…</div>
        ) : view === 'kanban' ? (
          <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:8 }}>
            {STATUS_COLS.map(st=>{
              const col = tarefas.filter(t=>t.status===st)
              return (
                <div key={st} style={{ minWidth:240, flex:'0 0 240px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, padding:'0 2px' }}>
                    <span style={{ fontSize:11, fontWeight:700, color:STATUS_COLOR[st] }}>{STATUS_LABEL[st]}</span>
                    <span className="badge" style={{ fontSize:9 }}>{col.length}</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {col.map(t=>(
                      <div key={t.id} className="card" style={{ padding:'12px 14px', cursor:'pointer', borderLeft:`3px solid ${PRIOR_COLOR[t.prioridade]}` }} onClick={()=>openEdit(t)}>
                        <div style={{ fontWeight:600, fontSize:12, color:'var(--wh)', marginBottom:4 }}>{t.titulo}</div>
                        {t.cliente_nome && <div style={{ fontSize:10, color:'var(--gr3)', marginBottom:6 }}>{t.cliente_nome}</div>}
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
                          {t.tags.map(tag=><span key={tag} className="badge badge-al" style={{ fontSize:9 }}>{tag}</span>)}
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:10, color:PRIOR_COLOR[t.prioridade] }}>{t.prioridade}</span>
                          {t.prazo && <span style={{ fontSize:9, color:'var(--gr3)' }}>📅 {t.prazo}</span>}
                        </div>
                        {t.checklist.length>0 && (
                          <div style={{ marginTop:6, fontSize:10, color:'var(--gr3)' }}>
                            ✓ {t.checklist.filter(c=>c.feito).length}/{t.checklist.length}
                          </div>
                        )}
                        <div style={{ display:'flex', gap:4, marginTop:8, flexWrap:'wrap' }}>
                          {STATUS_COLS.filter(s=>s!==st).slice(0,2).map(s=>(
                            <button key={s} className="btn btn-ghost btn-sm" style={{ fontSize:9, padding:'2px 6px' }}
                              onClick={ev=>{ev.stopPropagation();moverStatus(t.id,s)}}>→{STATUS_LABEL[s].split(' ')[0]}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {col.length===0&&<div style={{ textAlign:'center', padding:'20px 0', color:'var(--gr3)', fontSize:11, border:'1px dashed var(--bk4)', borderRadius:8 }}>Vazio</div>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card" style={{ padding:0 }}>
            <table className="tbl">
              <thead><tr><th>Tarefa</th><th>Cliente</th><th>Responsável</th><th>Prioridade</th><th>Status</th><th>Prazo</th><th>Checklist</th><th>Ações</th></tr></thead>
              <tbody>
                {tarefas.map(t=>(
                  <tr key={t.id}>
                    <td style={{ fontWeight:600, color:'var(--wh)' }}>
                      {t.titulo}
                      {t.tags.length>0&&<div style={{ display:'flex', gap:4, marginTop:4 }}>{t.tags.map(tag=><span key={tag} className="badge badge-al" style={{ fontSize:9 }}>{tag}</span>)}</div>}
                    </td>
                    <td style={{ fontSize:12, color:'var(--gr3)' }}>{t.cliente_nome||'—'}</td>
                    <td style={{ fontSize:12 }}>{t.responsavel||'—'}</td>
                    <td><span style={{ color:PRIOR_COLOR[t.prioridade], fontSize:11 }}>{t.prioridade}</span></td>
                    <td><span style={{ color:STATUS_COLOR[t.status], fontSize:11 }}>{STATUS_LABEL[t.status]}</span></td>
                    <td style={{ fontSize:11, color:'var(--gr3)' }}>{t.prazo||'—'}</td>
                    <td style={{ fontSize:11 }}>{t.checklist.length>0?`${t.checklist.filter(c=>c.feito).length}/${t.checklist.length}`:'—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(t)}>✏️</button>
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)' }} onClick={()=>remove(t.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(false);setForm(EMPTY);setEditing(null)}}}>
          <div className="modal" style={{ maxWidth:560 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Tarefa':'Nova Tarefa'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Título *</label>
                <input className="inp" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="O que precisa ser feito?"/>
              </div>
              <div>
                <label className="lbl">Responsável</label>
                <input className="inp" value={form.responsavel} onChange={e=>setForm(f=>({...f,responsavel:e.target.value}))} placeholder="Nome do responsável"/>
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
                <label className="lbl">Projeto</label>
                <select className="inp" value={form.projeto_id??''} onChange={e=>setForm(f=>({...f,projeto_id:e.target.value||null}))}>
                  <option value="">Nenhum</option>
                  {projetos.map(p=><option key={p.id} value={p.id}>{p.titulo}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Prioridade</label>
                <select className="inp" value={form.prioridade} onChange={e=>setForm(f=>({...f,prioridade:e.target.value as any}))}>
                  <option value="urgente">Urgente</option><option value="alta">Alta</option>
                  <option value="media">Média</option><option value="baixa">Baixa</option>
                </select>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  {STATUS_COLS.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Prazo</label>
                <input className="inp" type="date" value={form.prazo??''} onChange={e=>setForm(f=>({...f,prazo:e.target.value||null}))}/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Tags</label>
                <div style={{ display:'flex', gap:6, marginBottom:6, flexWrap:'wrap' }}>
                  {TAGS_SUGESTOES.map(t=>(
                    <button key={t} type="button" className={`btn btn-sm ${form.tags.includes(t)?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setForm(f=>({...f,tags:f.tags.includes(t)?f.tags.filter(x=>x!==t):[...f.tags,t]}))}
                      style={{ fontSize:10 }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Checklist</label>
                {form.checklist.map((item,i)=>(
                  <div key={item.id} style={{ display:'flex', gap:6, marginBottom:6 }}>
                    <input type="checkbox" checked={item.feito} onChange={e=>setForm(f=>({...f,checklist:f.checklist.map((c,j)=>j===i?{...c,feito:e.target.checked}:c)}))}/>
                    <input className="inp" style={{ flex:1 }} value={item.texto} onChange={e=>setForm(f=>({...f,checklist:f.checklist.map((c,j)=>j===i?{...c,texto:e.target.value}:c)}))} placeholder="Item do checklist"/>
                    <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)' }} onClick={()=>setForm(f=>({...f,checklist:f.checklist.filter((_,j)=>j!==i)}))}>✕</button>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={addCheckItem} style={{ marginTop:4 }}>+ Adicionar item</button>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Descrição</label>
                <textarea className="inp" rows={2} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} style={{ resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.titulo}>{saving?'Salvando…':editing?'Salvar':'Criar Tarefa'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
