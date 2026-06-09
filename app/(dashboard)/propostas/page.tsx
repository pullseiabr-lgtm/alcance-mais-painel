'use client'
import { useState, useEffect } from 'react'
import { db, type Proposta } from '@/lib/db'

const statusColor: Record<string, string> = {
  aprovada:'badge-ok', aguardando:'badge-wr', em_analise:'badge-al', rascunho:'badge-gr', recusada:'badge-er'
}
const SERVICOS_LIST = ['Tráfego Pago','Redes Sociais','SEO','Google Meu Negócio','Criação de Conteúdo','Fotografia','Vídeo','iFood','Branding','Landing Page','Email Marketing','Google Ads','Meta Ads']
const EMPTY: Omit<Proposta,'id'|'created_at'> = {
  titulo:'', cliente_id:null, cliente_nome:'', valor:0, status:'rascunho',
  criado: new Date().toISOString().slice(0,10), validade:null, servicos:[], desconto:0, observacoes:''
}

export default function PropostasPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([])
  const [clientes, setClientes]   = useState<{id:string,nome:string}[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState<Omit<Proposta,'id'|'created_at'>>(EMPTY)
  const [editing, setEditing]     = useState<string|null>(null)
  const [saving, setSaving]       = useState(false)
  const [filter, setFilter]       = useState('todas')

  async function load() {
    setLoading(true)
    const [{ data: prp }, { data: cls }] = await Promise.all([
      db.propostas.listar(),
      db.clientes.listar(),
    ])
    setPropostas(prp ?? [])
    setClientes((cls ?? []).map(c=>({id:c.id,nome:c.nome})))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = propostas.filter(p => filter==='todas' || p.status===filter)
  const totalAprovado = propostas.filter(p=>p.status==='aprovada').reduce((s,p)=>s+p.valor*(1-p.desconto/100),0)
  const totalPendente = propostas.filter(p=>['aguardando','em_analise'].includes(p.status)).reduce((s,p)=>s+p.valor,0)

  async function save() {
    if (!form.titulo) return
    setSaving(true)
    if (editing) await db.propostas.atualizar(editing, form)
    else await db.propostas.criar(form)
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover proposta?')) return
    await db.propostas.deletar(id); load()
  }

  function openEdit(p: Proposta) {
    const { id, created_at, ...rest } = p; setForm(rest); setEditing(id); setModal(true)
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Propostas Comerciais</span>
          <span className="tb-sub">Aprovado: R$ {totalAprovado.toLocaleString('pt-BR')} · Pendente: R$ {totalPendente.toLocaleString('pt-BR')}</span>
        </div>
        <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Nova Proposta</button>
      </div>

      <div className="content">
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {['todas','rascunho','aguardando','em_analise','aprovada','recusada'].map(s=>(
            <button key={s} className={`btn btn-sm ${filter===s?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(s)}>
              {({todas:'Todas',rascunho:'Rascunho',aguardando:'Aguardando',em_analise:'Em Análise',aprovada:'Aprovada',recusada:'Recusada'})[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando propostas…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
            Nenhuma proposta encontrada.<br/>
            <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Criar proposta</button>
          </div>
        ) : (
          <div className="card" style={{ padding:0 }}>
            <table className="tbl">
              <thead><tr><th>Título</th><th>Cliente</th><th>Valor</th><th>Serviços</th><th>Validade</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {filtered.map(p=>(
                  <tr key={p.id}>
                    <td style={{ fontWeight:600, color:'var(--wh)', maxWidth:220 }}>
                      <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.titulo}</div>
                    </td>
                    <td style={{ color:'var(--gr3)', fontSize:12 }}>{p.cliente_nome||'—'}</td>
                    <td>
                      <div style={{ fontFamily:'var(--mono)', color:'var(--al)', fontSize:13 }}>R$ {p.valor.toLocaleString('pt-BR')}</div>
                      {p.desconto>0 && <div style={{ fontSize:10, color:'var(--ok)' }}>-{p.desconto}% desc.</div>}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {p.servicos.slice(0,2).map(s=><span key={s} className="badge badge-al" style={{ fontSize:9 }}>{s}</span>)}
                        {p.servicos.length>2 && <span className="badge" style={{ fontSize:9 }}>+{p.servicos.length-2}</span>}
                      </div>
                    </td>
                    <td style={{ fontSize:11, color:'var(--gr3)' }}>{p.validade||'—'}</td>
                    <td><span className={`badge ${statusColor[p.status]??''}`}>{p.status.replace('_',' ')}</span></td>
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
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(false);setForm(EMPTY);setEditing(null)}}}>
          <div className="modal" style={{ maxWidth:560 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Proposta':'Nova Proposta'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Título da Proposta *</label>
                <input className="inp" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} placeholder="Ex: Gestão Completa — Empresa X"/>
              </div>
              <div>
                <label className="lbl">Cliente</label>
                <select className="inp" value={form.cliente_id??''} onChange={e=>{
                  const cl = clientes.find(c=>c.id===e.target.value)
                  setForm(f=>({...f, cliente_id:e.target.value||null, cliente_nome:cl?.nome??''}))
                }}>
                  <option value="">Selecionar cliente…</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Valor (R$)</label>
                <input className="inp" type="number" min="0" value={form.valor} onChange={e=>setForm(f=>({...f,valor:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  <option value="rascunho">Rascunho</option>
                  <option value="aguardando">Aguardando</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="aprovada">Aprovada</option>
                  <option value="recusada">Recusada</option>
                </select>
              </div>
              <div>
                <label className="lbl">Desconto (%)</label>
                <input className="inp" type="number" min="0" max="100" value={form.desconto} onChange={e=>setForm(f=>({...f,desconto:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Validade</label>
                <input className="inp" type="date" value={form.validade??''} onChange={e=>setForm(f=>({...f,validade:e.target.value||null}))}/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Serviços</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                  {SERVICOS_LIST.map(s=>(
                    <button key={s} type="button"
                      className={`btn btn-sm ${form.servicos.includes(s)?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setForm(f=>({...f,servicos:f.servicos.includes(s)?f.servicos.filter(x=>x!==s):[...f.servicos,s]}))}
                      style={{ fontSize:11 }}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Observações</label>
                <textarea className="inp" rows={2} value={form.observacoes} onChange={e=>setForm(f=>({...f,observacoes:e.target.value}))} style={{ resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.titulo}>{saving?'Salvando…':editing?'Salvar':'Criar Proposta'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
