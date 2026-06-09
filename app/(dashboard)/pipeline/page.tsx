'use client'
import { useState, useEffect } from 'react'
import { db, type Lead } from '@/lib/db'

const ETAPAS = [
  { key:'prospeccao',  label:'Prospecção',  color:'var(--gr3)' },
  { key:'qualificacao',label:'Qualificação', color:'var(--bl)'  },
  { key:'proposta',    label:'Proposta',     color:'var(--pu)'  },
  { key:'negociacao',  label:'Negociação',   color:'var(--wr)'  },
  { key:'fechado',     label:'Fechado',      color:'var(--ok)'  },
  { key:'perdido',     label:'Perdido',      color:'var(--er)'  },
]
const ORIGENS = ['Indicação','Instagram','Google','LinkedIn','Site','WhatsApp','Evento','Outro']
const EMPTY: Omit<Lead,'id'|'created_at'> = {
  empresa:'', contato:'', valor:0, etapa:'prospeccao', origem:'Indicação', probabilidade:30, proximo_contato:null, observacoes:''
}

export default function PipelinePage() {
  const [leads, setLeads]     = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState<Omit<Lead,'id'|'created_at'>>(EMPTY)
  const [editing, setEditing] = useState<string|null>(null)
  const [saving, setSaving]   = useState(false)
  const [view, setView]       = useState<'kanban'|'lista'>('kanban')

  async function load() {
    setLoading(true)
    const { data } = await db.pipeline.listar()
    setLeads(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.empresa) return
    setSaving(true)
    if (editing) await db.pipeline.atualizar(editing, form)
    else await db.pipeline.criar(form)
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover lead?')) return
    await db.pipeline.deletar(id); load()
  }

  async function moverEtapa(id: string, etapa: Lead['etapa']) {
    await db.pipeline.atualizar(id, { etapa }); load()
  }

  function openEdit(l: Lead) {
    const { id, created_at, ...rest } = l; setForm(rest); setEditing(id); setModal(true)
  }

  const totalPipeline = leads.filter(l=>!['fechado','perdido'].includes(l.etapa)).reduce((s,l)=>s+l.valor,0)
  const totalFechado  = leads.filter(l=>l.etapa==='fechado').reduce((s,l)=>s+l.valor,0)

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Pipeline Comercial</span>
          <span className="tb-sub">{leads.length} leads · Pipeline R$ {totalPipeline.toLocaleString('pt-BR')} · Fechado R$ {totalFechado.toLocaleString('pt-BR')}</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {(['kanban','lista'] as const).map(v=>(
            <button key={v} className={`btn btn-sm ${view===v?'btn-primary':'btn-ghost'}`} onClick={()=>setView(v)}>{v==='kanban'?'Kanban':'Lista'}</button>
          ))}
          <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Novo Lead</button>
        </div>
      </div>

      <div className="content">
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando pipeline…</div>
        ) : view === 'kanban' ? (
          <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:8 }}>
            {ETAPAS.map(etapa => {
              const col = leads.filter(l=>l.etapa===etapa.key)
              const total = col.reduce((s,l)=>s+l.valor,0)
              return (
                <div key={etapa.key} style={{ minWidth:220, flex:'0 0 220px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, padding:'0 2px' }}>
                    <div>
                      <span style={{ fontSize:11, fontWeight:700, color:etapa.color }}>{etapa.label}</span>
                      <span className="badge" style={{ marginLeft:6, fontSize:9 }}>{col.length}</span>
                    </div>
                    <span style={{ fontSize:9, fontFamily:'var(--mono)', color:'var(--gr3)' }}>
                      {total>0?`R$ ${(total/1000).toFixed(0)}k`:''}
                    </span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {col.map(l => (
                      <div key={l.id} className="card" style={{ padding:'12px 14px', cursor:'pointer' }} onClick={()=>openEdit(l)}>
                        <div style={{ fontWeight:600, fontSize:12, color:'var(--wh)', marginBottom:4 }}>{l.empresa}</div>
                        <div style={{ fontSize:10, color:'var(--gr3)', marginBottom:8 }}>{l.contato} · {l.origem}</div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--al)' }}>R$ {l.valor.toLocaleString('pt-BR')}</span>
                          <span style={{ fontSize:10, color:l.probabilidade>=70?'var(--ok)':l.probabilidade>=40?'var(--wr)':'var(--gr3)' }}>{l.probabilidade}%</span>
                        </div>
                        {etapa.key !== 'fechado' && etapa.key !== 'perdido' && (
                          <div style={{ display:'flex', gap:4, marginTop:8, flexWrap:'wrap' }}>
                            {ETAPAS.filter(e=>e.key!==etapa.key&&e.key!=='perdido').slice(0,2).map(e=>(
                              <button key={e.key} className="btn btn-ghost btn-sm" style={{ fontSize:9, padding:'2px 6px' }}
                                onClick={ev=>{ev.stopPropagation();moverEtapa(l.id,e.key as any)}}>→{e.label}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {col.length===0 && <div style={{ textAlign:'center', padding:'20px 0', color:'var(--gr3)', fontSize:11 }}>Vazio</div>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card" style={{ padding:0 }}>
            <table className="tbl">
              <thead><tr><th>Empresa</th><th>Contato</th><th>Valor</th><th>Etapa</th><th>Prob.</th><th>Origem</th><th>Próx. Contato</th><th>Ações</th></tr></thead>
              <tbody>
                {leads.map(l=>{
                  const et = ETAPAS.find(e=>e.key===l.etapa)
                  return (
                    <tr key={l.id}>
                      <td style={{ fontWeight:600, color:'var(--wh)' }}>{l.empresa}</td>
                      <td style={{ color:'var(--gr3)', fontSize:12 }}>{l.contato}</td>
                      <td style={{ fontFamily:'var(--mono)', color:'var(--al)' }}>R$ {l.valor.toLocaleString('pt-BR')}</td>
                      <td><span style={{ color:et?.color, fontSize:11 }}>{et?.label}</span></td>
                      <td style={{ fontFamily:'var(--mono)', color:l.probabilidade>=70?'var(--ok)':l.probabilidade>=40?'var(--wr)':'var(--gr3)' }}>{l.probabilidade}%</td>
                      <td style={{ color:'var(--gr3)', fontSize:12 }}>{l.origem}</td>
                      <td style={{ fontSize:11, color:'var(--gr3)' }}>{l.proximo_contato||'—'}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(l)}>✏️</button>
                          <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)' }} onClick={()=>remove(l.id)}>🗑</button>
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
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Lead':'Novo Lead'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Empresa *</label>
                <input className="inp" value={form.empresa} onChange={e=>setForm(f=>({...f,empresa:e.target.value}))} placeholder="Nome da empresa"/>
              </div>
              <div><label className="lbl">Contato</label><input className="inp" value={form.contato} onChange={e=>setForm(f=>({...f,contato:e.target.value}))} placeholder="Nome do contato"/></div>
              <div><label className="lbl">Valor (R$)</label><input className="inp" type="number" min="0" value={form.valor} onChange={e=>setForm(f=>({...f,valor:+e.target.value}))}/></div>
              <div>
                <label className="lbl">Etapa</label>
                <select className="inp" value={form.etapa} onChange={e=>setForm(f=>({...f,etapa:e.target.value as any}))}>
                  {ETAPAS.map(e=><option key={e.key} value={e.key}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Origem</label>
                <select className="inp" value={form.origem} onChange={e=>setForm(f=>({...f,origem:e.target.value}))}>
                  {ORIGENS.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Probabilidade (%)</label>
                <input className="inp" type="number" min="0" max="100" value={form.probabilidade} onChange={e=>setForm(f=>({...f,probabilidade:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Próximo Contato</label>
                <input className="inp" type="date" value={form.proximo_contato??''} onChange={e=>setForm(f=>({...f,proximo_contato:e.target.value||null}))}/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Observações</label>
                <textarea className="inp" rows={3} value={form.observacoes} onChange={e=>setForm(f=>({...f,observacoes:e.target.value}))} style={{ resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.empresa}>{saving?'Salvando…':editing?'Salvar':'Adicionar Lead'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
