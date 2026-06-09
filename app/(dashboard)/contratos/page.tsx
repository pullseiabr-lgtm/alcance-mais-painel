'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Contrato {
  id: string
  cliente_id: string | null
  cliente_nome: string
  tipo: 'mensalidade' | 'projeto' | 'avulso' | 'retainer'
  valor_mensal: number
  dia_cobranca: number
  inicio: string
  vencimento: string | null
  reajuste_anual: number
  status: 'ativo' | 'pausado' | 'encerrado' | 'inadimplente'
  servicos: string[]
  observacoes: string
  arquivo_url: string
  created_at: string
}

const TIPOS = ['mensalidade','projeto','avulso','retainer'] as const
const STATUS_LIST = ['ativo','pausado','encerrado','inadimplente'] as const
const SERVICOS_OPCOES = ['Gestão de Tráfego','Social Media','SEO','Criação de Conteúdo','Design','Branding','E-mail Marketing','Landing Pages','Google Ads','Meta Ads','TikTok Ads','YouTube Ads','Analytics','Consultoria']

const tipoColor: Record<string,string> = { mensalidade:'badge-al', projeto:'badge-bl', avulso:'badge-pu', retainer:'badge-ok' }
const statusColor: Record<string,string> = { ativo:'badge-ok', pausado:'badge-wr', encerrado:'badge-er', inadimplente:'badge-er' }
const statusLabel: Record<string,string> = { ativo:'Ativo', pausado:'Pausado', encerrado:'Encerrado', inadimplente:'Inadimplente' }
const tipoLabel: Record<string,string> = { mensalidade:'Mensalidade', projeto:'Projeto', avulso:'Avulso', retainer:'Retainer' }

const EMPTY = {
  cliente_id: '' as string | null,
  cliente_nome: '',
  tipo: 'mensalidade' as const,
  valor_mensal: 0,
  dia_cobranca: 5,
  inicio: new Date().toISOString().slice(0,10),
  vencimento: null as string | null,
  reajuste_anual: 0,
  status: 'ativo' as const,
  servicos: [] as string[],
  observacoes: '',
  arquivo_url: '',
}

export default function ContratosPage() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [clientes, setClientes]   = useState<{id:string, nome:string}[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState(EMPTY)
  const [editing, setEditing]     = useState<string|null>(null)
  const [saving, setSaving]       = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [view, setView]           = useState<'cards'|'tabela'>('tabela')

  const sb = createClient()

  async function load() {
    setLoading(true)
    const [{ data: c }, { data: cls }] = await Promise.all([
      sb.from('contratos').select('*').order('created_at', { ascending: false }),
      sb.from('clientes').select('id,nome').eq('status','ativo').order('nome'),
    ])
    setContratos(c ?? [])
    setClientes(cls ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.cliente_nome) return
    setSaving(true)
    const payload = { ...form, cliente_id: form.cliente_id || null }
    if (editing) {
      await sb.from('contratos').update(payload).eq('id', editing)
    } else {
      await sb.from('contratos').insert(payload)
    }
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Encerrar e remover este contrato?')) return
    await sb.from('contratos').delete().eq('id', id)
    load()
  }

  async function changeStatus(id: string, status: string) {
    await sb.from('contratos').update({ status }).eq('id', id)
    load()
  }

  function openEdit(c: Contrato) {
    const { id, created_at, ...rest } = c
    setForm({ ...rest, cliente_id: rest.cliente_id ?? '' } as typeof EMPTY)
    setEditing(id); setModal(true)
  }

  function toggleServico(s: string) {
    setForm(f => ({
      ...f,
      servicos: f.servicos.includes(s) ? f.servicos.filter(x=>x!==s) : [...f.servicos, s]
    }))
  }

  function selecionarCliente(id: string) {
    const cl = clientes.find(c=>c.id===id)
    setForm(f => ({ ...f, cliente_id: id||null, cliente_nome: cl?.nome ?? '' }))
  }

  const filtrados = filtroStatus === 'todos' ? contratos : contratos.filter(c=>c.status===filtroStatus)
  const mrr = contratos.filter(c=>c.status==='ativo'&&c.tipo==='mensalidade').reduce((s,c)=>s+c.valor_mensal,0)
  const ativos = contratos.filter(c=>c.status==='ativo').length
  const inadimplentes = contratos.filter(c=>c.status==='inadimplente').length
  const totalCarteira = contratos.filter(c=>c.status==='ativo').reduce((s,c)=>s+c.valor_mensal,0)

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Contratos</span>
          <span className="tb-sub">{contratos.length} contratos · {ativos} ativos</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {(['tabela','cards'] as const).map(v=>(
            <button key={v} className={`btn btn-sm ${view===v?'btn-primary':'btn-ghost'}`} onClick={()=>setView(v)}>
              {v==='tabela'?'Tabela':'Cards'}
            </button>
          ))}
          <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Novo Contrato</button>
        </div>
      </div>

      <div className="content">
        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
          {[
            { label:'MRR (Mensalidades)',   val:`R$ ${mrr.toLocaleString('pt-BR')}`,          color:'var(--al)' },
            { label:'Carteira Ativa',       val:`R$ ${totalCarteira.toLocaleString('pt-BR')}`, color:'var(--ok)' },
            { label:'Contratos Ativos',     val:String(ativos),                                 color:'var(--bl)' },
            { label:'Inadimplentes',        val:String(inadimplentes),                          color: inadimplentes>0?'var(--er)':'var(--gr3)' },
          ].map(k=>(
            <div key={k.label} className="card" style={{ padding:'16px 18px' }}>
              <div style={{ fontSize:11, color:'var(--gr3)', marginBottom:6 }}>{k.label}</div>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--mono)', color:k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {['todos',...STATUS_LIST].map(s=>(
            <button key={s} className={`btn btn-sm ${filtroStatus===s?'btn-primary':'btn-ghost'}`}
              onClick={()=>setFiltroStatus(s)}>
              {s==='todos'?'Todos':statusLabel[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando contratos…</div>
        ) : filtrados.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
            Nenhum contrato encontrado.<br/>
            <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Cadastrar contrato</button>
          </div>
        ) : view==='tabela' ? (
          <div className="card" style={{ padding:0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Cliente</th><th>Tipo</th><th>Valor</th><th>Dia Cobr.</th><th>Início</th>
                  <th>Serviços</th><th>Status</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(c=>(
                  <tr key={c.id}>
                    <td style={{ fontWeight:600, color:'var(--wh)' }}>{c.cliente_nome||'—'}</td>
                    <td><span className={`badge ${tipoColor[c.tipo]??''}`}>{tipoLabel[c.tipo]}</span></td>
                    <td style={{ fontFamily:'var(--mono)', color:'var(--al)', fontWeight:700 }}>R$ {c.valor_mensal.toLocaleString('pt-BR')}</td>
                    <td style={{ fontFamily:'var(--mono)', textAlign:'center' }}>dia {c.dia_cobranca}</td>
                    <td style={{ fontSize:11, color:'var(--gr3)' }}>{new Date(c.inicio+'T12:00').toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {c.servicos.slice(0,2).map(s=><span key={s} className="badge" style={{ fontSize:9 }}>{s}</span>)}
                        {c.servicos.length>2&&<span className="badge" style={{ fontSize:9 }}>+{c.servicos.length-2}</span>}
                      </div>
                    </td>
                    <td>
                      <select className="inp" style={{ padding:'4px 8px', fontSize:11, width:130 }}
                        value={c.status} onChange={e=>changeStatus(c.id, e.target.value)}>
                        {STATUS_LIST.map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}
                      </select>
                    </td>
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
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
            {filtrados.map(c=>(
              <div key={c.id} className="card" style={{ padding:'18px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--wh)', marginBottom:2 }}>{c.cliente_nome||'Cliente não vinculado'}</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <span className={`badge ${tipoColor[c.tipo]??''}`}>{tipoLabel[c.tipo]}</span>
                      <span className={`badge ${statusColor[c.status]??''}`}>{statusLabel[c.status]}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:800, fontFamily:'var(--mono)', color:'var(--al)' }}>R$ {c.valor_mensal.toLocaleString('pt-BR')}</div>
                    <div style={{ fontSize:10, color:'var(--gr3)' }}>dia {c.dia_cobranca} · {c.reajuste_anual>0?`+${c.reajuste_anual}% a.a.`:'sem reajuste'}</div>
                  </div>
                </div>
                {c.servicos.length>0&&(
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:10 }}>
                    {c.servicos.slice(0,4).map(s=><span key={s} className="badge" style={{ fontSize:9 }}>{s}</span>)}
                    {c.servicos.length>4&&<span className="badge" style={{ fontSize:9 }}>+{c.servicos.length-4}</span>}
                  </div>
                )}
                {c.observacoes&&<div style={{ fontSize:11, color:'var(--gr3)', marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.observacoes}</div>}
                <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(c)}>✏️ Editar</button>
                  <button className="btn btn-ghost btn-sm" style={{ color:'var(--er)' }} onClick={()=>remove(c.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(false);setForm(EMPTY);setEditing(null)}}}>
          <div className="modal" style={{ maxWidth:600 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Contrato':'Novo Contrato'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Cliente *</label>
                <select className="inp" value={form.cliente_id??''} onChange={e=>selecionarCliente(e.target.value)}>
                  <option value="">Selecione ou deixe em branco</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                {!form.cliente_id&&(
                  <input className="inp" style={{ marginTop:6 }} placeholder="Ou digite o nome do cliente"
                    value={form.cliente_nome} onChange={e=>setForm(f=>({...f,cliente_nome:e.target.value}))}/>
                )}
              </div>
              <div>
                <label className="lbl">Tipo de Contrato</label>
                <select className="inp" value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value as any}))}>
                  {TIPOS.map(t=><option key={t} value={t}>{tipoLabel[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Valor Mensal (R$)</label>
                <input className="inp" type="number" min="0" step="0.01" value={form.valor_mensal}
                  onChange={e=>setForm(f=>({...f,valor_mensal:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Dia de Cobrança</label>
                <input className="inp" type="number" min="1" max="31" value={form.dia_cobranca}
                  onChange={e=>setForm(f=>({...f,dia_cobranca:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Reajuste Anual (%)</label>
                <input className="inp" type="number" min="0" step="0.1" value={form.reajuste_anual}
                  onChange={e=>setForm(f=>({...f,reajuste_anual:+e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Data de Início</label>
                <input className="inp" type="date" value={form.inicio}
                  onChange={e=>setForm(f=>({...f,inicio:e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">Vencimento (opcional)</label>
                <input className="inp" type="date" value={form.vencimento??''}
                  onChange={e=>setForm(f=>({...f,vencimento:e.target.value||null}))}/>
              </div>
              <div>
                <label className="lbl">Status</label>
                <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                  {STATUS_LIST.map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Link do Arquivo (PDF/Drive)</label>
                <input className="inp" placeholder="https://..." value={form.arquivo_url}
                  onChange={e=>setForm(f=>({...f,arquivo_url:e.target.value}))}/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Serviços Contratados</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                  {SERVICOS_OPCOES.map(s=>(
                    <button key={s} type="button"
                      className={`btn btn-sm ${form.servicos.includes(s)?'btn-primary':'btn-ghost'}`}
                      onClick={()=>toggleServico(s)} style={{ fontSize:11 }}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Observações</label>
                <textarea className="inp" rows={3} value={form.observacoes}
                  onChange={e=>setForm(f=>({...f,observacoes:e.target.value}))}
                  placeholder="Cláusulas especiais, condições de pagamento, renovação automática…"
                  style={{ resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.cliente_nome}>
                {saving?'Salvando…':editing?'Salvar':'Criar Contrato'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
