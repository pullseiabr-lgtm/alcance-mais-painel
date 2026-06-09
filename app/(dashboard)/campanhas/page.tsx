'use client'
import { useState, useEffect } from 'react'
import { db, type Campanha } from '@/lib/db'

const statusColor: Record<string,string> = { planejada:'badge-bl', ativa:'badge-ok', pausada:'badge-wr', encerrada:'badge-gr' }
const CANAIS = ['Meta Ads','Google Ads','TikTok Ads','Instagram Orgânico','YouTube','Email Marketing','SEO','iFood']
const EMPTY: Omit<Campanha,'id'|'created_at'> = {
  nome:'', cliente_id:null, cliente_nome:'', canal:'', status:'planejada', orcamento:0, gasto:0,
  inicio:null, fim:null, impressoes:0, cliques:0, conversoes:0, objetivo:''
}

export default function CampanhasPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [clientes, setClientes]   = useState<{id:string,nome:string}[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState<Omit<Campanha,'id'|'created_at'>>(EMPTY)
  const [editing, setEditing]     = useState<string|null>(null)
  const [saving, setSaving]       = useState(false)
  const [filter, setFilter]       = useState('todas')

  async function load() {
    setLoading(true)
    const [{ data: camp }, { data: cls }] = await Promise.all([
      db.campanhas.listar(),
      db.clientes.listar(),
    ])
    setCampanhas(camp ?? [])
    setClientes((cls??[]).map(c=>({id:c.id,nome:c.nome})))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = campanhas.filter(c => filter==='todas' || c.status===filter)

  async function save() {
    if (!form.nome) return
    setSaving(true)
    if (editing) await db.campanhas.atualizar(editing, form)
    else await db.campanhas.criar(form)
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover campanha?')) return
    await db.campanhas.deletar(id); load()
  }

  function openEdit(c: Campanha) {
    const { id, created_at, ...rest } = c; setForm(rest); setEditing(id); setModal(true)
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Campanhas</span>
          <span className="tb-sub">{campanhas.filter(c=>c.status==='ativa').length} ativas · {campanhas.length} total</span>
        </div>
        <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Nova Campanha</button>
      </div>

      <div className="content">
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {[['todas','Todas'],['planejada','Planejadas'],['ativa','Ativas'],['pausada','Pausadas'],['encerrada','Encerradas']].map(([v,l])=>(
            <button key={v} className={`btn btn-sm ${filter===v?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando campanhas…</div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
            Nenhuma campanha encontrada.<br/>
            <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Criar campanha</button>
          </div>
        ) : (
          <div className="card" style={{ padding:0 }}>
            <table className="tbl">
              <thead><tr><th>Campanha</th><th>Cliente</th><th>Canal</th><th>Orçamento</th><th>Métricas</th><th>Período</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {filtered.map(c=>{
                  const ctr = c.impressoes>0 ? ((c.cliques/c.impressoes)*100).toFixed(2) : '0.00'
                  const cpc = c.cliques>0 ? (c.gasto/c.cliques).toFixed(2) : '0.00'
                  const pct = c.orcamento>0 ? Math.min((c.gasto/c.orcamento)*100,100) : 0
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight:600, color:'var(--wh)', maxWidth:180 }}>
                        <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.nome}</div>
                        {c.objetivo && <div style={{ fontSize:10, color:'var(--gr3)', marginTop:2 }}>{c.objetivo}</div>}
                      </td>
                      <td style={{ fontSize:12, color:'var(--gr3)' }}>{c.cliente_nome||'—'}</td>
                      <td style={{ fontSize:12 }}>{c.canal||'—'}</td>
                      <td>
                        <div style={{ fontSize:12, fontFamily:'var(--mono)' }}>R$ {c.gasto.toLocaleString('pt-BR')} / {c.orcamento.toLocaleString('pt-BR')}</div>
                        <div className="progress-bar" style={{ marginTop:4 }}>
                          <div className="progress-fill" style={{ width:`${pct}%`, background:pct>90?'var(--er)':pct>70?'var(--wr)':'var(--al)' }}/>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize:10, color:'var(--gr3)' }}>CTR: <span style={{ color:'var(--al)' }}>{ctr}%</span></div>
                        <div style={{ fontSize:10, color:'var(--gr3)' }}>CPC: <span style={{ color:'var(--al)' }}>R$ {cpc}</span></div>
                        <div style={{ fontSize:10, color:'var(--gr3)' }}>Conv.: <span style={{ color:'var(--ok)' }}>{c.conversoes}</span></div>
                      </td>
                      <td style={{ fontSize:11, color:'var(--gr3)' }}>{c.inicio||'—'}{c.fim?` → ${c.fim}`:''}</td>
                      <td><span className={`badge ${statusColor[c.status]??''}`}>{c.status}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(c)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)' }} onClick={()=>remove(c.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(false);setForm(EMPTY);setEditing(null)}}}>
          <div className="modal" style={{ maxWidth:540 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Campanha':'Nova Campanha'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Nome da Campanha *</label>
                <input className="inp" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: Black Friday Meta Ads"/>
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
                <label className="lbl">Canal</label>
                <select className="inp" value={form.canal} onChange={e=>setForm(f=>({...f,canal:e.target.value}))}>
                  <option value="">Selecionar…</option>
                  {CANAIS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Orçamento (R$)</label>
                <input className="inp" type="number" min="0" value={form.orcamento} onChange={e=>setForm(f=>({...f,orcamento:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Gasto Atual (R$)</label>
                <input className="inp" type="number" min="0" value={form.gasto} onChange={e=>setForm(f=>({...f,gasto:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  <option value="planejada">Planejada</option><option value="ativa">Ativa</option>
                  <option value="pausada">Pausada</option><option value="encerrada">Encerrada</option>
                </select>
              </div>
              <div>
                <label className="lbl">Início</label>
                <input className="inp" type="date" value={form.inicio??''} onChange={e=>setForm(f=>({...f,inicio:e.target.value||null}))}/>
              </div>
              <div>
                <label className="lbl">Fim</label>
                <input className="inp" type="date" value={form.fim??''} onChange={e=>setForm(f=>({...f,fim:e.target.value||null}))}/>
              </div>
              <div>
                <label className="lbl">Impressões</label>
                <input className="inp" type="number" min="0" value={form.impressoes} onChange={e=>setForm(f=>({...f,impressoes:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Cliques</label>
                <input className="inp" type="number" min="0" value={form.cliques} onChange={e=>setForm(f=>({...f,cliques:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Conversões</label>
                <input className="inp" type="number" min="0" value={form.conversoes} onChange={e=>setForm(f=>({...f,conversoes:+e.target.value}))}/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Objetivo</label>
                <input className="inp" value={form.objetivo} onChange={e=>setForm(f=>({...f,objetivo:e.target.value}))} placeholder="Ex: Geração de leads"/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.nome}>{saving?'Salvando…':editing?'Salvar':'Criar Campanha'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
