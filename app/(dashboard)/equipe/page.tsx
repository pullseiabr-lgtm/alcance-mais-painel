'use client'
import { useState, useEffect } from 'react'
import { db, type MembroEquipe } from '@/lib/db'

const nivelColor: Record<string,string> = { senior:'badge-ok', pleno:'badge-al', junior:'badge-bl' }
const statusColor: Record<string,string> = { ativo:'badge-ok', ferias:'badge-wr', afastado:'badge-er' }
const SPECS = ['Tráfego Pago','Redes Sociais','SEO','Copywriting','Design','Motion','Vídeo','Branding','Google Ads','Meta Ads','Analytics','Email Marketing','Account','iFood']
const EMPTY: Omit<MembroEquipe,'id'|'created_at'> = {
  nome:'', cargo:'', email:'', especializacao:[], status:'ativo', carga_horaria:40, nivel:'pleno'
}

export default function EquipePage() {
  const [equipe, setEquipe]   = useState<MembroEquipe[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState<Omit<MembroEquipe,'id'|'created_at'>>(EMPTY)
  const [editing, setEditing] = useState<string|null>(null)
  const [saving, setSaving]   = useState(false)
  const [view, setView]       = useState<'cards'|'tabela'>('cards')

  async function load() {
    setLoading(true)
    const { data } = await db.equipe.listar()
    setEquipe(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.nome) return
    setSaving(true)
    if (editing) await db.equipe.atualizar(editing, form)
    else await db.equipe.criar(form)
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover membro da equipe?')) return
    await db.equipe.deletar(id); load()
  }

  function openEdit(m: MembroEquipe) {
    const { id, created_at, ...rest } = m; setForm(rest); setEditing(id); setModal(true)
  }

  const ativos = equipe.filter(m=>m.status==='ativo').length

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Equipe</span>
          <span className="tb-sub">{equipe.length} membros · {ativos} ativos</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {(['cards','tabela'] as const).map(v=>(
            <button key={v} className={`btn btn-sm ${view===v?'btn-primary':'btn-ghost'}`} onClick={()=>setView(v)}>{v==='cards'?'Cards':'Tabela'}</button>
          ))}
          <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Novo Membro</button>
        </div>
      </div>

      <div className="content">
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando equipe…</div>
        ) : equipe.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
            Nenhum membro cadastrado.<br/>
            <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Adicionar membro</button>
          </div>
        ) : view==='cards' ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:16 }}>
            {equipe.map(m=>(
              <div key={m.id} className="card" style={{ padding:'20px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,var(--al),var(--al3))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff' }}>
                    {m.nome.charAt(0)}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(m)}>✏️</button>
                    <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)' }} onClick={()=>remove(m.id)}>🗑</button>
                  </div>
                </div>
                <div style={{ fontWeight:700, fontSize:14, color:'var(--wh)', marginBottom:2 }}>{m.nome}</div>
                <div style={{ fontSize:12, color:'var(--gr3)', marginBottom:10 }}>{m.cargo}</div>
                <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
                  <span className={`badge ${nivelColor[m.nivel]??''}`}>{m.nivel}</span>
                  <span className={`badge ${statusColor[m.status]??''}`}>{m.status}</span>
                  <span className="badge">{m.carga_horaria}h/sem</span>
                </div>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                  {m.especializacao.slice(0,3).map(e=>(
                    <span key={e} className="badge badge-al" style={{ fontSize:9 }}>{e}</span>
                  ))}
                  {m.especializacao.length>3 && <span className="badge" style={{ fontSize:9 }}>+{m.especializacao.length-3}</span>}
                </div>
                {m.email && <div style={{ fontSize:10, color:'var(--gr3)', marginTop:10 }}>✉️ {m.email}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding:0 }}>
            <table className="tbl">
              <thead><tr><th>Nome</th><th>Cargo</th><th>E-mail</th><th>Especializações</th><th>Nível</th><th>C.H.</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {equipe.map(m=>(
                  <tr key={m.id}>
                    <td style={{ fontWeight:600, color:'var(--wh)' }}>{m.nome}</td>
                    <td style={{ fontSize:12, color:'var(--gr3)' }}>{m.cargo}</td>
                    <td style={{ fontSize:11, color:'var(--gr3)' }}>{m.email||'—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {m.especializacao.slice(0,2).map(e=><span key={e} className="badge badge-al" style={{ fontSize:9 }}>{e}</span>)}
                        {m.especializacao.length>2&&<span className="badge" style={{ fontSize:9 }}>+{m.especializacao.length-2}</span>}
                      </div>
                    </td>
                    <td><span className={`badge ${nivelColor[m.nivel]??''}`}>{m.nivel}</span></td>
                    <td style={{ fontSize:11, fontFamily:'var(--mono)' }}>{m.carga_horaria}h</td>
                    <td><span className={`badge ${statusColor[m.status]??''}`}>{m.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(m)}>✏️</button>
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)' }} onClick={()=>remove(m.id)}>🗑</button>
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
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Membro':'Novo Membro'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Nome *</label>
                <input className="inp" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Nome completo"/>
              </div>
              <div>
                <label className="lbl">Cargo</label>
                <input className="inp" value={form.cargo} onChange={e=>setForm(f=>({...f,cargo:e.target.value}))} placeholder="Ex: Designer, Gestor de Tráfego"/>
              </div>
              <div>
                <label className="lbl">E-mail</label>
                <input className="inp" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@agencia.com"/>
              </div>
              <div>
                <label className="lbl">Nível</label>
                <select className="inp" value={form.nivel} onChange={e=>setForm(f=>({...f,nivel:e.target.value as any}))}>
                  <option value="senior">Sênior</option><option value="pleno">Pleno</option><option value="junior">Júnior</option>
                </select>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  <option value="ativo">Ativo</option><option value="ferias">Férias</option><option value="afastado">Afastado</option>
                </select>
              </div>
              <div>
                <label className="lbl">Carga Horária (h/semana)</label>
                <input className="inp" type="number" min="0" max="60" value={form.carga_horaria} onChange={e=>setForm(f=>({...f,carga_horaria:+e.target.value}))}/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Especializações</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                  {SPECS.map(s=>(
                    <button key={s} type="button"
                      className={`btn btn-sm ${form.especializacao.includes(s)?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setForm(f=>({...f,especializacao:f.especializacao.includes(s)?f.especializacao.filter(x=>x!==s):[...f.especializacao,s]}))}
                      style={{ fontSize:11 }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.nome}>{saving?'Salvando…':editing?'Salvar':'Adicionar Membro'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
