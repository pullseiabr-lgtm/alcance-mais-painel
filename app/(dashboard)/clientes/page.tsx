'use client'
import { useState, useEffect } from 'react'
import { db, type Cliente } from '@/lib/db'

const statusColor: Record<string, string> = {
  ativo: 'badge-ok', onboarding: 'badge-al', pausado: 'badge-wr', inativo: 'badge-er',
}
const SEGMENTOS = ['Tecnologia','Saúde','Construção','Food','Fitness','Imóveis','Educação','Varejo','Beleza','Jurídico','Outro']
const SERVICOS_LIST = ['Tráfego Pago','Redes Sociais','SEO','Google Meu Negócio','Criação de Conteúdo','Fotografia','Vídeo','iFood','Branding','Landing Pages','Email Marketing','CRM']

const EMPTY: Omit<Cliente,'id'|'created_at'> = {
  nome:'', contato:'', email:'', telefone:'', setor:'', status:'ativo', mensalidade:0, desde:'', servicos:[],
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('todos')
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState<Omit<Cliente,'id'|'created_at'>>(EMPTY)
  const [editing, setEditing]   = useState<string|null>(null)
  const [saving, setSaving]     = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await db.clientes.listar()
    setClientes(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = clientes.filter(c => {
    const q = search.toLowerCase()
    const matchQ = c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.setor.toLowerCase().includes(q)
    const matchF = filter === 'todos' || c.status === filter
    return matchQ && matchF
  })

  async function save() {
    if (!form.nome) return
    setSaving(true)
    if (editing) {
      await db.clientes.atualizar(editing, form)
    } else {
      await db.clientes.criar(form)
    }
    setSaving(false)
    setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover este cliente?')) return
    await db.clientes.deletar(id)
    load()
  }

  function openNew()          { setForm(EMPTY); setEditing(null); setModal(true) }
  function openEdit(c: Cliente) {
    const { id, created_at, ...rest } = c
    setForm(rest); setEditing(id); setModal(true)
  }

  const totalMRR = clientes.filter(c=>c.status==='ativo').reduce((s,c)=>s+c.mensalidade,0)

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Clientes</span>
          <span className="tb-sub">{clientes.length} cadastrados · MRR {totalMRR ? `R$ ${totalMRR.toLocaleString('pt-BR')}` : '—'}</span>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Novo Cliente</button>
      </div>

      <div className="content">
        {/* Filtros */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          <input className="inp" placeholder="Buscar cliente…" value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:180 }}/>
          {['todos','ativo','onboarding','pausado','inativo'].map(s => (
            <button key={s} className={`btn ${filter===s?'btn-primary':'btn-ghost'} btn-sm`} onClick={()=>setFilter(s)}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando clientes…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
            {search || filter!=='todos' ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}
            <br/><button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={openNew}>+ Cadastrar primeiro cliente</button>
          </div>
        ) : (
          <div className="card" style={{ padding:0 }}>
            <table className="tbl">
              <thead>
                <tr><th>Cliente</th><th>Contato</th><th>Setor</th><th>Mensalidade</th><th>Serviços</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight:600, color:'var(--wh)' }}>{c.nome}</td>
                    <td>
                      <div style={{ fontSize:12 }}>{c.contato}</div>
                      <div style={{ fontSize:11, color:'var(--gr3)' }}>{c.telefone}</div>
                    </td>
                    <td style={{ color:'var(--gr3)' }}>{c.setor||'—'}</td>
                    <td style={{ fontFamily:'var(--mono)', color:'var(--al)' }}>
                      {c.mensalidade ? `R$ ${c.mensalidade.toLocaleString('pt-BR')}` : '—'}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {(c.servicos??[]).slice(0,2).map(s=>(
                          <span key={s} className="badge badge-al" style={{ fontSize:9 }}>{s}</span>
                        ))}
                        {(c.servicos??[]).length>2 && <span className="badge" style={{ fontSize:9 }}>+{c.servicos.length-2}</span>}
                      </div>
                    </td>
                    <td><span className={`badge ${statusColor[c.status]??''}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(c)}>✏️</button>
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)' }} onClick={()=>remove(c.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget){setModal(false);setForm(EMPTY);setEditing(null)} }}>
          <div className="modal" style={{ maxWidth:560 }}>
            <div className="modal-hd">
              <span>{editing ? 'Editar Cliente' : 'Novo Cliente'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Nome da Empresa *</label>
                <input className="inp" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: TechNova Solutions"/>
              </div>
              <div>
                <label className="lbl">Responsável / Contato</label>
                <input className="inp" value={form.contato} onChange={e=>setForm(f=>({...f,contato:e.target.value}))} placeholder="Nome do responsável"/>
              </div>
              <div>
                <label className="lbl">Telefone / WhatsApp</label>
                <input className="inp" value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))} placeholder="(11) 99999-9999"/>
              </div>
              <div>
                <label className="lbl">E-mail</label>
                <input className="inp" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@empresa.com"/>
              </div>
              <div>
                <label className="lbl">Setor</label>
                <select className="inp" value={form.setor} onChange={e=>setForm(f=>({...f,setor:e.target.value}))}>
                  <option value="">Selecionar…</option>
                  {SEGMENTOS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Mensalidade (R$)</label>
                <input className="inp" type="number" min="0" value={form.mensalidade} onChange={e=>setForm(f=>({...f,mensalidade:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  <option value="ativo">Ativo</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="pausado">Pausado</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div>
                <label className="lbl">Cliente desde</label>
                <input className="inp" value={form.desde} onChange={e=>setForm(f=>({...f,desde:e.target.value}))} placeholder="Jan 2024"/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Serviços contratados</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                  {SERVICOS_LIST.map(s=>(
                    <button key={s} type="button"
                      className={`btn btn-sm ${form.servicos.includes(s)?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setForm(f=>({...f, servicos: f.servicos.includes(s)?f.servicos.filter(x=>x!==s):[...f.servicos,s]}))}
                      style={{ fontSize:11 }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.nome}>
                {saving ? 'Salvando…' : editing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
