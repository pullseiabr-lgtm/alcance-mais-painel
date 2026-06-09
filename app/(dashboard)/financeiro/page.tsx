'use client'
import { useState, useEffect } from 'react'
import { db, type Transacao } from '@/lib/db'

const CATEGORIAS_R = ['Mensalidade','Projeto Pontual','Consultoria','Bônus','Reembolso','Outro']
const CATEGORIAS_D = ['Pessoal','Ferramentas','Infraestrutura','Marketing','Impostos','Fornecedores','Outro']
const EMPTY: Omit<Transacao,'id'|'created_at'> = {
  descricao:'', tipo:'receita', categoria:'Mensalidade', valor:0,
  data: new Date().toISOString().slice(0,10), cliente_id:null, cliente_nome:'', status:'pendente'
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [clientes, setClientes]     = useState<{id:string,nome:string}[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [form, setForm]             = useState<Omit<Transacao,'id'|'created_at'>>(EMPTY)
  const [editing, setEditing]       = useState<string|null>(null)
  const [saving, setSaving]         = useState(false)
  const [filter, setFilter]         = useState('todos')

  async function load() {
    setLoading(true)
    const [{ data: tr }, { data: cls }] = await Promise.all([
      db.transacoes.listar(),
      db.clientes.listar(),
    ])
    setTransacoes(tr ?? [])
    setClientes((cls??[]).map(c=>({id:c.id,nome:c.nome})))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = transacoes.filter(t => filter==='todos' || t.tipo===filter)
  const receitas = transacoes.filter(t=>t.tipo==='receita').reduce((s,t)=>s+t.valor,0)
  const despesas = transacoes.filter(t=>t.tipo==='despesa').reduce((s,t)=>s+t.valor,0)
  const lucro    = receitas - despesas
  const margem   = receitas > 0 ? Math.round((lucro/receitas)*100) : 0

  async function save() {
    if (!form.descricao) return
    setSaving(true)
    if (editing) await db.transacoes.atualizar(editing, form)
    else await db.transacoes.criar(form)
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover transação?')) return
    await db.transacoes.deletar(id); load()
  }

  function openEdit(t: Transacao) {
    const { id, created_at, ...rest } = t; setForm(rest); setEditing(id); setModal(true)
  }

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR',{minimumFractionDigits:2})}`

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Financeiro</span>
          <span className="tb-sub">Receitas, despesas e resultado</span>
        </div>
        <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Lançamento</button>
      </div>

      <div className="content">
        {/* KPIs */}
        <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:16 }}>
          {[
            { label:'Receitas', val:fmt(receitas), color:'var(--ok)', icon:'📈' },
            { label:'Despesas', val:fmt(despesas), color:'var(--er)', icon:'📉' },
            { label:'Lucro',    val:fmt(lucro),    color:lucro>=0?'var(--al)':'var(--er)', icon:'💰' },
            { label:'Margem',   val:`${margem}%`,  color:margem>=30?'var(--ok)':margem>=15?'var(--wr)':'var(--er)', icon:'📊' },
          ].map(k=>(
            <div key={k.label} className="kpi">
              <div className="kpi-icon" style={{ background:`${k.color}22` }}><span style={{ fontSize:16 }}>{k.icon}</span></div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val" style={{ color:k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {[['todos','Todos'],['receita','Receitas'],['despesa','Despesas']].map(([v,l])=>(
            <button key={v} className={`btn btn-sm ${filter===v?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando…</div>
        ) : (
          <div className="card" style={{ padding:0 }}>
            <table className="tbl">
              <thead><tr><th>Descrição</th><th>Tipo</th><th>Categoria</th><th>Cliente</th><th>Data</th><th>Status</th><th>Valor</th><th>Ações</th></tr></thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:'32px 0', color:'var(--gr3)' }}>Nenhum lançamento encontrado.</td></tr>
                ) : filtered.map(t=>(
                  <tr key={t.id}>
                    <td style={{ fontWeight:600, color:'var(--wh)' }}>{t.descricao}</td>
                    <td><span className={`badge ${t.tipo==='receita'?'badge-ok':'badge-er'}`}>{t.tipo}</span></td>
                    <td style={{ fontSize:12, color:'var(--gr3)' }}>{t.categoria}</td>
                    <td style={{ fontSize:12, color:'var(--gr3)' }}>{t.cliente_nome||'—'}</td>
                    <td style={{ fontSize:11, color:'var(--gr3)' }}>{t.data}</td>
                    <td><span className={`badge ${t.status==='pago'?'badge-ok':t.status==='atrasado'?'badge-er':'badge-wr'}`}>{t.status}</span></td>
                    <td style={{ fontFamily:'var(--mono)', color:t.tipo==='receita'?'var(--ok)':'var(--er)', fontWeight:700 }}>{fmt(t.valor)}</td>
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
          <div className="modal" style={{ maxWidth:500 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Lançamento':'Novo Lançamento'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Descrição *</label>
                <input className="inp" value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} placeholder="Ex: Mensalidade Cliente X"/>
              </div>
              <div>
                <label className="lbl">Tipo</label>
                <select className="inp" value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value as any, categoria:e.target.value==='receita'?'Mensalidade':'Pessoal'}))}>
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div>
                <label className="lbl">Categoria</label>
                <select className="inp" value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))}>
                  {(form.tipo==='receita'?CATEGORIAS_R:CATEGORIAS_D).map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Valor (R$)</label>
                <input className="inp" type="number" min="0" step="0.01" value={form.valor} onChange={e=>setForm(f=>({...f,valor:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Data</label>
                <input className="inp" type="date" value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))}/>
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
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                  <option value="atrasado">Atrasado</option>
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.descricao}>{saving?'Salvando…':editing?'Salvar':'Lançar'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
