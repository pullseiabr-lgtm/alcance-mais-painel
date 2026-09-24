'use client'
import { useState } from 'react'
import { a7, useA7, fmtDataHora } from '@/lib/a7-client'
import { Badge, Cabecalho, Estado, Modal } from '../ui'

const CATS: Record<string, string> = { duvida: 'Dúvida', alteracao: 'Alteração', novo_pedido: 'Novo pedido', problema: 'Problema', financeiro: 'Financeiro' }

export default function Chamados() {
  const { dados, carregando, erro, recarregar } = useA7('chamados')
  const [novo, setNovo] = useState<any>(null)
  const [sel, setSel] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function abrirChamado() {
    if (!novo.titulo?.trim()) { alert('Informe o assunto.'); return }
    setBusy(true)
    try { await a7.criar('chamados', novo); setNovo(null); recarregar() } catch (e: any) { alert(e.message) }
    setBusy(false)
  }
  async function responder() {
    if (!msg.trim()) return
    setBusy(true)
    try {
      const upd = await a7.editar('chamados', sel.id, { mensagem: msg })
      setSel(upd); setMsg(''); recarregar()
    } catch (e: any) { alert(e.message) }
    setBusy(false)
  }

  return (
    <div className="a7-page">
      <Cabecalho titulo="Chamados" sub="Peça alterações, tire dúvidas ou solicite novos materiais à equipe."
        acao={<button className="a7-btn" onClick={() => setNovo({ titulo: '', categoria: 'duvida', prioridade: 'media', descricao: '' })}>＋ Novo chamado</button>} />
      <Estado carregando={carregando} erro={erro} vazio={!carregando && dados.length === 0} msgVazio="Você ainda não abriu nenhum chamado." />
      <div className="a7-grid">
        {dados.map(c => (
          <div key={c.id} className="a7-card a7-row" style={{ justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setSel(c)}>
            <div>
              <div style={{ fontWeight: 700 }}>{c.titulo}</div>
              <small style={{ color: 'var(--mut)' }}>{CATS[c.categoria] ?? c.categoria} · prioridade {c.prioridade} · {fmtDataHora(c.created_at)} · {(c.mensagens || []).length} msg</small>
            </div>
            <Badge s={c.status} />
          </div>
        ))}
      </div>

      {novo && (
        <Modal titulo="Novo chamado" onClose={() => setNovo(null)}>
          <label className="a7-lbl">Assunto</label>
          <input className="a7-inp" value={novo.titulo} onChange={e => setNovo({ ...novo, titulo: e.target.value })} />
          <div className="a7-row" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}><label className="a7-lbl">Categoria</label>
              <select className="a7-inp" value={novo.categoria} onChange={e => setNovo({ ...novo, categoria: e.target.value })}>
                {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div style={{ flex: 1 }}><label className="a7-lbl">Prioridade</label>
              <select className="a7-inp" value={novo.prioridade} onChange={e => setNovo({ ...novo, prioridade: e.target.value })}>
                <option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option></select></div>
          </div>
          <label className="a7-lbl">Descrição</label>
          <textarea className="a7-inp" rows={4} value={novo.descricao} onChange={e => setNovo({ ...novo, descricao: e.target.value })} />
          <button className="a7-btn" style={{ marginTop: 14 }} disabled={busy} onClick={abrirChamado}>Abrir chamado</button>
        </Modal>
      )}

      {sel && (
        <Modal titulo={sel.titulo} onClose={() => setSel(null)}>
          <div className="a7-row" style={{ marginBottom: 10 }}><Badge s={sel.status} /><small style={{ color: 'var(--mut)' }}>{CATS[sel.categoria]}</small></div>
          <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 10 }}>
            {(sel.mensagens || []).map((m: any, i: number) => (
              <div key={i} className={`a7-msg ${m.de === 'cliente' ? 'cli' : 'eq'}`}>
                <small>{m.autor} · {fmtDataHora(m.em)}</small>{m.texto}
              </div>
            ))}
          </div>
          <textarea className="a7-inp" rows={3} placeholder="Escreva sua resposta…" value={msg} onChange={e => setMsg(e.target.value)} />
          <button className="a7-btn" style={{ marginTop: 10 }} disabled={busy} onClick={responder}>Enviar</button>
        </Modal>
      )}
    </div>
  )
}
