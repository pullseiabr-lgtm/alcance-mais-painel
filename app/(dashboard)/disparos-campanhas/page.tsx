'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { db, type Disparo, type DisparoTipo, type Cliente, type ContatoMkt } from '@/lib/db'

const TIPOS: { id: DisparoTipo; label: string; icon: string }[] = [
  { id: 'texto', label: 'Texto', icon: '📝' },
  { id: 'imagem', label: 'Card (imagem)', icon: '🖼️' },
  { id: 'video', label: 'Vídeo', icon: '🎥' },
  { id: 'documento', label: 'Cardápio (PDF)', icon: '📄' },
  { id: 'link', label: 'Link', icon: '🔗' },
]
const ATALHOS = [
  { label: '🍻 Happy Hour', msg: 'Hoje tem Happy Hour na Amore! 🍻\nChope a R$ 6,90 e Heineken 600ml por R$ 14,90.\nEsperamos você! 🔗 amorefood.com.br' },
  { label: '⚽ Arena Amore', msg: 'Hoje tem jogo na Arena Amore! 🇧🇷⚽\nReserve sua mesa agora. 🔗 amorefood.com.br' },
  { label: '🎟️ Cupom', msg: 'Você recebeu um cupom exclusivo de R$ 10 para usar hoje! 🎟️\nVálido só hoje. 🔗 amorefood.com.br' },
  { label: '📋 Cardápio', msg: 'Confira nosso cardápio completo e faça seu pedido! 😋\n🔗 amorefood.com.br/cardapio' },
]
const STATUS_CLS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600', enviando: 'bg-blue-100 text-blue-700',
  pausado: 'bg-amber-100 text-amber-700', concluido: 'bg-green-100 text-green-700',
}
const STATUS_LBL: Record<string, string> = {
  rascunho: 'Rascunho', enviando: '🟢 Enviando (na nuvem)', pausado: 'Pausado', concluido: 'Concluído',
}
const EMPTY = { nome: '', cliente_id: '', tipo: 'texto' as DisparoTipo, mensagem: '', media_url: '', file_name: '', lote: 12, intervalo_seg: 180 }

export default function CampanhasWppPage() {
  const [disparos, setDisparos] = useState<Disparo[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [erro, setErro] = useState('')
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const pollRef = useRef<any>(null)

  const load = useCallback(async () => {
    const { data } = await db.disparos.listar()
    setDisparos((data as Disparo[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load(); db.clientes.listar().then(r => setClientes((r.data as Cliente[]) || []))
    // auto-refresh a cada 8s (mostra o progresso que a VPS atualiza)
    pollRef.current = setInterval(load, 8000)
    return () => clearInterval(pollRef.current)
  }, [load])

  async function criar() {
    if (!form.nome.trim()) { setErro('Dê um nome à campanha.'); return }
    if (form.tipo === 'texto' || form.tipo === 'link') { if (!form.mensagem.trim()) { setErro('Escreva a mensagem.'); return } }
    else if (!form.media_url.trim()) { setErro('Informe a URL da mídia (imagem/vídeo/PDF).'); return }
    setSaving(true); setErro('')
    const cli = clientes.find(c => c.id === form.cliente_id)
    try {
      await db.disparos.criar({
        cliente_id: form.cliente_id || null, cliente_nome: cli?.nome || null,
        nome: form.nome.trim(), tipo: form.tipo, mensagem: form.mensagem,
        media_url: form.media_url.trim() || null, file_name: form.file_name.trim() || null,
        total: 0, enviados: 0, falhas: 0, status: 'rascunho',
        lote: Number(form.lote) || 12, intervalo_seg: Number(form.intervalo_seg) || 180,
      })
      setModal(false); setForm(EMPTY); load()
    } catch (e: any) { setErro(e?.message || 'Erro ao criar.') }
    setSaving(false)
  }

  async function excluir(d: Disparo) {
    if (!confirm(`Excluir a campanha "${d.nome}"?`)) return
    await db.disparos.deletar(d.id); load()
  }

  // Iniciar = enfileira (se preciso) + marca 'enviando'. A VPS (cron) envia sozinha.
  async function iniciar(d: Disparo) {
    setBusy(d.id)
    try {
      const { data: jaEnvios } = await db.disparoEnvios.porDisparo(d.id)
      let total = (jaEnvios as any[])?.length || 0
      if (total === 0) {
        const { data: ativos } = await db.contatos.ativos(d.cliente_id)
        const lista = (ativos as ContatoMkt[]) || []
        if (lista.length === 0) { alert('Nenhum contato ATIVO para este público. Cadastre/importe contatos primeiro.'); setBusy(null); return }
        const envios = lista.map(c => ({ disparo_id: d.id, contato_id: c.id, telefone: c.telefone, nome: c.nome, status: 'pendente' as const, erro: null, enviado_em: null }))
        for (let i = 0; i < envios.length; i += 500) await db.disparoEnvios.criarLote(envios.slice(i, i + 500))
        total = envios.length
      }
      await db.disparos.atualizar(d.id, { total, status: 'enviando', updated_at: new Date(Date.now() - 999999).toISOString() })
      load()
    } catch (e: any) { alert('Erro: ' + (e?.message || '')) }
    setBusy(null)
  }
  async function pausar(d: Disparo) { setBusy(d.id); await db.disparos.atualizar(d.id, { status: 'pausado' }); load(); setBusy(null) }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xl">🚀</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Campanhas WhatsApp</h1>
            <p className="text-sm text-gray-500">Disparo autônomo na nuvem (VPS) · lotes anti-ban · só Ativos (LGPD)</p>
          </div>
        </div>
        <button onClick={() => { setForm(EMPTY); setErro(''); setModal(true) }} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-xl">+ Nova campanha</button>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-xs text-green-700">
          ☁️ As campanhas rodam <b>sozinhas na VPS</b> (24h). Pode fechar o navegador depois de iniciar — o envio continua.
        </div>
        {loading ? <p className="text-center text-gray-400 py-8">Carregando…</p>
          : disparos.length === 0 ? <p className="text-center text-gray-400 py-8 bg-white rounded-2xl border border-gray-200">Nenhuma campanha. Crie a primeira.</p>
          : disparos.map(d => {
            const pct = d.total > 0 ? Math.round((d.enviados / d.total) * 100) : 0
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{TIPOS.find(t => t.id === d.tipo)?.icon} {d.nome}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CLS[d.status]}`}>{STATUS_LBL[d.status]}</span>
                      {d.cliente_nome && <span className="text-xs text-gray-400">· {d.cliente_nome}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xl">{d.mensagem || d.media_url}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {d.status !== 'enviando' && d.status !== 'concluido' && <button onClick={() => iniciar(d)} disabled={busy === d.id} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-40">▶ {d.status === 'pausado' ? 'Continuar' : 'Iniciar'}</button>}
                    {d.status === 'enviando' && <button onClick={() => pausar(d)} disabled={busy === d.id} className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg">⏸ Pausar</button>}
                    {d.status !== 'enviando' && <button onClick={() => excluir(d)} className="text-xs text-red-400 px-2 py-1.5 hover:bg-red-50 rounded-lg">🗑</button>}
                  </div>
                </div>
                {d.total > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{d.enviados} / {d.total} enviados{d.falhas > 0 ? ` · ${d.falhas} falhas` : ''}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                    {d.status === 'enviando' && <p className="text-[11px] text-gray-400 mt-1">⏳ Enviando lotes de {d.lote} a cada {Math.round((d.intervalo_seg || 180) / 60)} min (na VPS). Atualiza sozinho.</p>}
                  </div>
                )}
              </div>
            )
          })}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-3">Nova campanha</h3>
            <div className="space-y-3">
              <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome da campanha (ex: Happy Hour Sexta)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  <option value="">Público: todos os Ativos</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>Ativos de {c.nome}</option>)}
                </select>
                <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as DisparoTipo }))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm">
                  {TIPOS.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ATALHOS.map(a => <button key={a.label} onClick={() => setForm(f => ({ ...f, mensagem: a.msg }))} className="text-xs border border-gray-200 px-2 py-1 rounded-full hover:bg-teal-50 hover:border-teal-200">{a.label}</button>)}
              </div>
              {(form.tipo !== 'texto' && form.tipo !== 'link') && (
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.media_url} onChange={e => setForm(f => ({ ...f, media_url: e.target.value }))} placeholder="URL da mídia (https://...)" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                  {form.tipo === 'documento' && <input value={form.file_name} onChange={e => setForm(f => ({ ...f, file_name: e.target.value }))} placeholder="Nome do arquivo (cardapio.pdf)" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />}
                </div>
              )}
              <textarea value={form.mensagem} onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))} rows={4} placeholder={form.tipo === 'texto' || form.tipo === 'link' ? 'Mensagem...' : 'Legenda (opcional)...'} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-gray-500">Lote (msgs por vez)</label><input type="number" value={form.lote} onChange={e => setForm(f => ({ ...f, lote: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
                <div><label className="text-xs text-gray-500">Intervalo entre lotes (seg)</label><input type="number" value={form.intervalo_seg} onChange={e => setForm(f => ({ ...f, intervalo_seg: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></div>
              </div>
              <p className="text-[11px] text-gray-400">💡 Anti-ban: comece com lote 12 e intervalo 180s. Aumente devagar conforme o número "aquece".</p>
              {erro && <p className="text-red-500 text-xs">{erro}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm">Cancelar</button>
              <button onClick={criar} disabled={saving} className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Criando…' : 'Criar campanha'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
