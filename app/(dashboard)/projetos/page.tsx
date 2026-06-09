'use client'
import { useState, useEffect } from 'react'
import { db, type Projeto } from '@/lib/db'

const statusColor: Record<string,string> = {
  em_andamento:'badge-al', planejamento:'badge-bl', revisao:'badge-wr', concluido:'badge-ok', pausado:'badge-gr'
}
const priorColor: Record<string,string> = { alta:'badge-er', media:'badge-wr', baixa:'badge-gr' }
const STATUS_LIST = ['planejamento','em_andamento','revisao','concluido','pausado']
const STATUS_LABEL: Record<string,string> = { planejamento:'Planejamento', em_andamento:'Em Andamento', revisao:'Revisão', concluido:'Concluído', pausado:'Pausado' }

const EMPTY: Omit<Projeto,'id'|'created_at'> = {
  titulo:'', cliente_id:null, cliente_nome:'', responsavel:'', status:'planejamento', prioridade:'media', prazo:null, progresso:0, descricao:''
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [clientes, setClientes] = useState<{id:string,nome:string}[]>([])
  const [loading, setLoading]   = useState(true)
  const [view, setView]         = useState<'lista'|'kanban'>('lista')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState<Omit<Projeto,'id'|'created_at'>>(EMPTY)
  const [editing, setEditing]   = useState<string|null>(null)
  const [search, setSearch]     = useState('')
  const [saving, setSaving]     = useState(false)

  async function load() {
    setLoading(true)
    const [{ data: prj }, { data: cls }] = await Promise.all([
      db.projetos.listar(),
      db.clientes.listar(),
    ])
    setProjetos(prj ?? [])
    setClientes((cls??[]).map(c=>({id:c.id,nome:c.nome})))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = projetos.filter(p => p.titulo.toLowerCase().includes(search.toLowerCase()) || p.cliente_nome.toLowerCase().includes(search.toLowerCase()))

  async function save() {
    if (!form.titulo) return
    setSaving(true)
    if (editing) await db.projetos.atualizar(editing, form)
    else await db.projetos.criar(form)
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover projeto?')) return
    await db.projetos.deletar(id); load()
  }

  function openEdit(p: Projeto) {
    const { id, created_at, ...rest } = p; setForm(rest); setEditing(id); setModal(true)
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Projetos</span>
          <span className="tb-sub">{projetos.filter(p=>p.status==='em_andamento').length} em andamento · {projetos.filter(p=>p.status==='concluido').length} concluídos</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {(['lista','kanban'] as const).map(v=>(
            <button key={v} className={`btn btn-sm ${view===v?'btn-primary':'btn-ghost'}`} onClick={()=>setView(v)}>{v==='lista'?'Lista':'Kanban'}</button>
          ))}
          <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Novo Projeto</button>
        </div>
      </div>

      <div className="content">
        <input className="inp" placeholder="Buscar projeto…" value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:16, maxWidth:320 }}/>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando projetos…</div>
        ) : view === 'lista' ? (
          filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
              Nenhum projeto encontrado.<br/>
              <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Criar projeto</button>
            </div>
          ) : (
            <div className="card" style={{ padding:0 }}>
              <table className="tbl">
                <thead><tr><th>Projeto</th><th>Cliente</th><th>Responsável</th><th>Prioridade</th><th>Prazo</th><th>Progresso</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {filtered.map(p=>(
                    <tr key={p.id}>
                      <td style={{ fontWeight:600, color:'var(--wh)', maxWidth:200 }}>
                        <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.titulo}</div>
                        {p.descricao && <div style={{ fontSize:10, color:'var(--gr3)', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.descricao}</div>}
                      </td>
                      <td style={{ color:'var(--gr3)', fontSize:12 }}>{p.cliente_nome||'—'}</td>
                      <td style={{ fontSize:12 }}>{p.responsavel||'—'}</td>
                      <td><span className={`badge ${priorColor[p.prioridade]??''}`}>{p.prioridade}</span></td>
                      <td style={{ fontSize:11, color:'var(--gr3)' }}>{p.prazo||'—'}</td>
                      <td style={{ minWidth:100 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div className="progress-bar" style={{ flex:1 }}>
                            <div className="progress-fill" style={{ width:`${p.progresso}%` }}/>
                          </div>
                          <span style={{ fontSize:10, fontFamily:'var(--mono)', color:'var(--al)', minWidth:28 }}>{p.progresso}%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${statusColor[p.status]??''}`}>{STATUS_LABEL[p.status]??p.status}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(p)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)' }} onClick={()=>remove(p.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:8 }}>
            {STATUS_LIST.map(st=>{
              const col = filtered.filter(p=>p.status===st)
              return (
                <div key={st} style={{ minWidth:220, flex:'0 0 220px' }}>
                  <div style={{ marginBottom:10 }}>
                    <span className={`badge ${statusColor[st]}`}>{STATUS_LABEL[st]}</span>
                    <span className="badge" style={{ marginLeft:6, fontSize:9 }}>{col.length}</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {col.map(p=>(
                      <div key={p.id} className="card" style={{ padding:'12px 14px', cursor:'pointer' }} onClick={()=>openEdit(p)}>
                        <div style={{ fontWeight:600, fontSize:12, color:'var(--wh)', marginBottom:4 }}>{p.titulo}</div>
                        <div style={{ fontSize:10, color:'var(--gr3)', marginBottom:8 }}>{p.cliente_nome||'Sem cliente'}</div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width:`${p.progresso}%` }}/></div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                          <span className={`badge ${priorColor[p.prioridade]??''}`} style={{ fontSize:9 }}>{p.prioridade}</span>
                          <span style={{ fontSize:9, color:'var(--al)', fontFamily:'var(--mono)' }}>{p.progresso}%</span>
                        </div>
                      </div>
                    ))}
                    {col.length===0&&<div style={{ textAlign:'center', padding:'16px 0', color:'var(--gr3)', fontSize:11 }}>Vazio</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(false);setForm(EMPTY);setEditing(null)}}}>
          <div className="modal" style={{ maxWidth:540 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Projeto':'Novo Projeto'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Título *</label>
                <input className="inp" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="Nome do projeto"/>
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
                <label className="lbl">Responsável</label>
                <input className="inp" value={form.responsavel} onChange={e=>setForm(f=>({...f,responsavel:e.target.value}))} placeholder="Nome do responsável"/>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  {STATUS_LIST.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Prioridade</label>
                <select className="inp" value={form.prioridade} onChange={e=>setForm(f=>({...f,prioridade:e.target.value as any}))}>
                  <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
                </select>
              </div>
              <div>
                <label className="lbl">Prazo</label>
                <input className="inp" type="date" value={form.prazo??''} onChange={e=>setForm(f=>({...f,prazo:e.target.value||null}))}/>
              </div>
              <div>
                <label className="lbl">Progresso ({form.progresso}%)</label>
                <input className="inp" type="range" min="0" max="100" value={form.progresso} onChange={e=>setForm(f=>({...f,progresso:+e.target.value}))}/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Descrição</label>
                <textarea className="inp" rows={2} value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} style={{ resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.titulo}>{saving?'Salvando…':editing?'Salvar':'Criar Projeto'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
