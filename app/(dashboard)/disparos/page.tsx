'use client'

import { useState, useEffect, useCallback } from 'react'
import { db, type ContatoMkt, type ContatoStatus, type ContatoOrigem, type Cliente } from '@/lib/db'

const ORIGENS: { id: ContatoOrigem; label: string }[] = [
  { id: 'qr_code', label: 'QR Code' }, { id: 'wifi', label: 'Wi-Fi' },
  { id: 'delivery', label: 'Delivery' }, { id: 'site', label: 'Site' },
  { id: 'instagram', label: 'Instagram' }, { id: 'presencial', label: 'Presencial' },
  { id: 'manual', label: 'Manual' }, { id: 'importacao', label: 'Importação' },
]
const STATUS: Record<ContatoStatus, { label: string; cls: string }> = {
  ativo:     { label: 'Ativo',     cls: 'bg-green-100 text-green-700' },
  cancelado: { label: 'Cancelado', cls: 'bg-amber-100 text-amber-700' },
  bloqueado: { label: 'Bloqueado', cls: 'bg-red-100 text-red-700' },
}
const soDig = (s: string) => (s || '').replace(/\D/g, '')
const EMPTY = { nome: '', telefone: '', email: '', origem: 'manual' as ContatoOrigem, status: 'ativo' as ContatoStatus, aniversario: '', cliente_id: '', observacoes: '' }

export default function DisparosContatosPage() {
  const [contatos, setContatos] = useState<ContatoMkt[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [fStatus, setFStatus] = useState<'todos' | ContatoStatus>('todos')
  const [fCliente, setFCliente] = useState('todos')
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [imp, setImp] = useState(false)
  const [impTxt, setImpTxt] = useState('')
  const [impCliente, setImpCliente] = useState('')
  const [impBusy, setImpBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await db.contatos.listar()
    setContatos((data as ContatoMkt[]) || [])
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
    db.clientes.listar().then(r => setClientes((r.data as Cliente[]) || []))
  }, [load])

  const filtrados = contatos.filter(c => {
    const q = busca.toLowerCase()
    const mB = !q || c.nome.toLowerCase().includes(q) || (c.telefone || '').includes(q)
    const mS = fStatus === 'todos' || c.status === fStatus
    const mC = fCliente === 'todos' || c.cliente_id === fCliente
    return mB && mS && mC
  })
  const stats = {
    total: contatos.length,
    ativo: contatos.filter(c => c.status === 'ativo').length,
    cancelado: contatos.filter(c => c.status === 'cancelado').length,
    bloqueado: contatos.filter(c => c.status === 'bloqueado').length,
  }

  function novo() { setEditId(null); setForm(EMPTY); setErro(''); setModal(true) }
  function editar(c: ContatoMkt) {
    setEditId(c.id)
    setForm({ nome: c.nome, telefone: c.telefone, email: c.email || '', origem: c.origem || 'manual', status: c.status, aniversario: c.aniversario || '', cliente_id: c.cliente_id || '', observacoes: c.observacoes || '' })
    setErro(''); setModal(true)
  }

  async function salvar() {
    if (!form.nome.trim()) { setErro('Informe o nome.'); return }
    const tel = soDig(form.telefone)
    if (tel.length < 10) { setErro('Telefone inválido (com DDD).'); return }
    setSaving(true); setErro('')
    const cli = clientes.find(c => c.id === form.cliente_id)
    const base = {
      cliente_id: form.cliente_id || null, cliente_nome: cli?.nome || null,
      nome: form.nome.trim(), telefone: tel, email: form.email.trim() || null,
      origem: form.origem, status: form.status, consentimento: form.status === 'ativo',
      aniversario: form.aniversario || null, observacoes: form.observacoes.trim() || null,
    }
    try {
      if (editId) await db.contatos.atualizar(editId, base)
      else await db.contatos.criar({ ...base, data_optin: new Date().toISOString(), data_optout: null, ultima_compra: null, ticket_medio: 0, total_pedidos: 0, categoria_favorita: null, tags: [] })
      setModal(false); load()
    } catch (e: any) {
      setErro(e?.message?.includes('duplicate') ? 'Esse telefone já está cadastrado.' : (e?.message || 'Erro ao salvar.'))
    }
    setSaving(false)
  }

  async function mudarStatus(c: ContatoMkt, novo: ContatoStatus) {
    const patch: Partial<ContatoMkt> = { status: novo, consentimento: novo === 'ativo' }
    if (novo !== 'ativo') patch.data_optout = new Date().toISOString()
    else { patch.data_optin = new Date().toISOString(); patch.data_optout = null }
    await db.contatos.atualizar(c.id, patch); load()
  }
  async function excluir(c: ContatoMkt) {
    if (!confirm(`Excluir "${c.nome}"? (Permanente)`)) return
    await db.contatos.deletar(c.id); load()
  }

  async function importar() {
    setImpBusy(true)
    const cli = clientes.find(c => c.id === impCliente)
    const linhas = impTxt.split('\n').map(l => l.trim()).filter(Boolean)
    const payload = linhas.map(l => {
      const p = l.split(/[;,\t]/).map(x => x.trim())
      return { nome: p[0] || 'Sem nome', tel: soDig(p[1] || p[0]) }
    }).filter(x => x.tel.length >= 10).map(n => ({
      cliente_id: impCliente || null, cliente_nome: cli?.nome || null,
      nome: n.nome, telefone: n.tel, email: null, origem: 'importacao' as ContatoOrigem,
      consentimento: true, data_optin: new Date().toISOString(), data_optout: null,
      status: 'ativo' as ContatoStatus, aniversario: null, ultima_compra: null,
      ticket_medio: 0, total_pedidos: 0, categoria_favorita: null, tags: [], observacoes: null,
    }))
    try {
      const { data } = await db.contatos.importar(payload)
      alert(`${(data as any[])?.length || 0} contato(s) importado(s).`)
      setImp(false); setImpTxt(''); load()
    } catch (e: any) { alert('Erro: ' + (e?.message || '')) }
    setImpBusy(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xl">📣</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Disparos — Central de Consentimento</h1>
            <p className="text-sm text-gray-500">Contatos com opt-in/opt-out (LGPD) · só envia para quem autorizou</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setImp(true)} className="text-sm border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50">⬆ Importar</button>
          <button onClick={novo} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-xl">+ Novo contato</button>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: 'Total', v: stats.total, c: 'text-teal-600' },
            { l: 'Ativos (autorizados)', v: stats.ativo, c: 'text-green-600' },
            { l: 'Cancelados', v: stats.cancelado, c: 'text-amber-600' },
            { l: 'Bloqueados', v: stats.bloqueado, c: 'text-red-600' },
          ].map(k => (
            <div key={k.l} className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{k.l}</p>
              <p className={`text-2xl font-bold ${k.c}`}>{loading ? '—' : k.v}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-wrap gap-2 items-center">
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar nome ou telefone..." className="flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
          <select value={fStatus} onChange={e => setFStatus(e.target.value as any)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
            <option value="todos">Todos status</option><option value="ativo">Ativos</option><option value="cancelado">Cancelados</option><option value="bloqueado">Bloqueados</option>
          </select>
          <select value={fCliente} onChange={e => setFCliente(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
            <option value="todos">Todos clientes</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {loading ? <p className="p-8 text-center text-gray-400">Carregando…</p>
            : filtrados.length === 0 ? <p className="p-8 text-center text-gray-400">Nenhum contato. Adicione ou importe.</p>
            : filtrados.map(c => {
              const si = STATUS[c.status]
              return (
                <div key={c.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{c.nome} {c.cliente_nome && <span className="text-xs text-gray-400">· {c.cliente_nome}</span>}</p>
                    <p className="text-xs text-gray-500 font-mono">{c.telefone} · {ORIGENS.find(o => o.id === c.origem)?.label || '—'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${si.cls}`}>{si.label}</span>
                  <div className="flex gap-1">
                    {c.status !== 'ativo' && <button onClick={() => mudarStatus(c, 'ativo')} title="Reativar" className="text-green-600 text-xs px-1.5 py-1 hover:bg-green-50 rounded">✅</button>}
                    {c.status === 'ativo' && <button onClick={() => mudarStatus(c, 'cancelado')} title="Cancelar (opt-out)" className="text-amber-600 text-xs px-1.5 py-1 hover:bg-amber-50 rounded">🚫</button>}
                    {c.status !== 'bloqueado' && <button onClick={() => mudarStatus(c, 'bloqueado')} title="Bloquear" className="text-red-500 text-xs px-1.5 py-1 hover:bg-red-50 rounded">⛔</button>}
                    <button onClick={() => editar(c)} className="text-gray-500 text-xs px-1.5 py-1 hover:bg-gray-100 rounded">✏️</button>
                    <button onClick={() => excluir(c)} className="text-red-400 text-xs px-1.5 py-1 hover:bg-red-50 rounded">🗑</button>
                  </div>
                </div>
              )
            })}
        </div>
        <p className="text-xs text-gray-400">🛡️ LGPD: campanhas só serão enviadas para contatos <b className="text-green-600">Ativos</b> (autorizados).</p>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
            <h3 className="font-bold text-gray-900 mb-3">{editId ? 'Editar contato' : 'Novo contato'}</h3>
            <div className="space-y-3">
              <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome *" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="Telefone c/ DDD *" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="E-mail" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={form.origem} onChange={e => setForm(f => ({ ...f, origem: e.target.value as ContatoOrigem }))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {ORIGENS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ContatoStatus }))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  <option value="ativo">Ativo (autorizado)</option><option value="cancelado">Cancelado</option><option value="bloqueado">Bloqueado</option>
                </select>
              </div>
              <select value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                <option value="">Cliente (opcional)</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <input type="date" value={form.aniversario} onChange={e => setForm(f => ({ ...f, aniversario: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={2} placeholder="Observações" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              {erro && <p className="text-red-500 text-xs">{erro}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Salvando…' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {imp && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
            <h3 className="font-bold text-gray-900 mb-2">Importar contatos</h3>
            <p className="text-xs text-gray-500 mb-2">1 por linha: <b>Nome, Telefone</b>. Repetidos são ignorados. Entram como <b>Ativo</b>.</p>
            <select value={impCliente} onChange={e => setImpCliente(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-2">
              <option value="">Cliente (opcional)</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <textarea value={impTxt} onChange={e => setImpTxt(e.target.value)} rows={7} placeholder={"João Silva, 81999998888\nMaria Souza, 81988887777"} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setImp(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm">Cancelar</button>
              <button onClick={importar} disabled={impBusy || !impTxt.trim()} className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium disabled:opacity-50">{impBusy ? 'Importando…' : 'Importar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
