'use client'
import { useState } from 'react'
import { a7, useA7, brl, fmtData } from '@/lib/a7-client'
import { Badge, Cabecalho, Estado, Modal } from '../ui'

const ABAS: [string, string][] = [['execucao', 'Em execução'], ['validacao', 'Em validação'], ['aprovado', 'Aprovados']]

export default function PlanoAcao() {
  const { dados, carregando, erro, recarregar } = useA7('acoes')
  const [aba, setAba] = useState('execucao')
  const [sel, setSel] = useState<any>(null)
  const [coment, setComent] = useState('')
  const [busy, setBusy] = useState(false)

  const hoje = new Date(new Date().toDateString()).getTime()
  const atrasada = (a: any) => a.status !== 'aprovado' && a.prazo && new Date(a.prazo + 'T00:00:00').getTime() < hoje
  const lista = dados.filter(a => a.status === aba)
  const cont = (s: string) => dados.filter(a => a.status === s).length

  async function decidir(status: 'aprovado' | 'execucao') {
    if (status === 'execucao' && !coment.trim()) { alert('Explique o que precisa ser refeito.'); return }
    setBusy(true)
    try { await a7.editar('acoes', sel.id, { status, comentario_cliente: coment }); setSel(null); setComent(''); recarregar() }
    catch (e: any) { alert(e.message) }
    setBusy(false)
  }

  return (
    <div className="a7-page">
      <Cabecalho titulo="Plano de ação" sub="O que está sendo feito, por quem e até quando. Valide as entregas concluídas." />
      <div className="a7-tabs">
        {ABAS.map(([k, v]) => <span key={k} className={`a7-chip ${aba === k ? 'on' : ''}`} onClick={() => setAba(k)}>{v} ({cont(k)})</span>)}
      </div>
      <Estado carregando={carregando} erro={erro} vazio={!carregando && lista.length === 0} msgVazio="Nenhuma ação nesta etapa." />
      <div className="a7-grid a7-g3">
        {lista.map(a => (
          <div key={a.id} className="a7-card" style={{ cursor: 'pointer', borderLeft: `4px solid ${atrasada(a) ? '#ef4444' : 'var(--t)'}` }}
            onClick={() => { setSel(a); setComent(a.comentario_cliente || '') }}>
            <div className="a7-row" style={{ justifyContent: 'space-between' }}>
              <Badge s={a.status} />{atrasada(a) && <span className="a7-badge" style={{ background: '#ef4444' }}>Atrasada</span>}
            </div>
            <div style={{ fontWeight: 700, margin: '8px 0 4px' }}>{a.o_que}</div>
            <small style={{ color: 'var(--mut)' }}>👤 {a.quem || '—'} · 🗓 {a.prazo ? fmtData(a.prazo + 'T00:00:00') : 'sem prazo'} · prioridade {a.prioridade}</small>
          </div>
        ))}
      </div>

      {sel && (
        <Modal titulo={sel.o_que} onClose={() => setSel(null)}>
          <div className="a7-row" style={{ marginBottom: 8 }}><Badge s={sel.status} />{atrasada(sel) && <span className="a7-badge" style={{ background: '#ef4444' }}>Atrasada</span>}</div>
          {([['Por quê', sel.por_que], ['Como', sel.como], ['Quem fará', sel.quem], ['Prazo', sel.prazo ? fmtData(sel.prazo + 'T00:00:00') : ''], ['Custo', Number(sel.custo) ? brl(sel.custo) : '']] as [string, string][])
            .filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}><small style={{ color: 'var(--mut)', fontWeight: 700 }}>{k.toUpperCase()}</small><div style={{ whiteSpace: 'pre-wrap' }}>{v}</div></div>
            ))}
          {sel.status === 'validacao' && (
            <>
              <label className="a7-lbl">Comentário (obrigatório se devolver)</label>
              <textarea className="a7-inp" rows={3} value={coment} onChange={e => setComent(e.target.value)} />
              <div className="a7-row" style={{ marginTop: 12 }}>
                <button className="a7-btn ok" disabled={busy} onClick={() => decidir('aprovado')}>✓ Validar entrega</button>
                <button className="a7-btn warn" disabled={busy} onClick={() => decidir('execucao')}>↩ Devolver</button>
              </div>
            </>
          )}
          {sel.comentario_cliente && sel.status !== 'validacao' && <p style={{ background: '#f8fafc', borderRadius: 8, padding: 10 }}>💬 {sel.comentario_cliente}</p>}
        </Modal>
      )}
    </div>
  )
}
