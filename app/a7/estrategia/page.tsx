'use client'
import { useState } from 'react'
import { useA7, fmtData } from '@/lib/a7-client'
import { Badge, Cabecalho, Estado, Modal } from '../ui'

const TIPOS: Record<string, string> = { estrategia: '🎯 Estratégia', planejamento: '🗓 Planejamento', briefing: '📝 Briefing', relatorio: '📊 Relatório' }

export default function Estrategia() {
  const { dados, carregando, erro } = useA7('planos')
  const [tipo, setTipo] = useState('todos')
  const [sel, setSel] = useState<any>(null)
  const lista = dados.filter(p => tipo === 'todos' || p.tipo === tipo)

  return (
    <div className="a7-page">
      <Cabecalho titulo="Estratégia e planejamento" sub="O caminho definido para a sua marca: estratégia, planejamentos, briefings e relatórios." />
      <div className="a7-tabs">
        <span className={`a7-chip ${tipo === 'todos' ? 'on' : ''}`} onClick={() => setTipo('todos')}>Todos</span>
        {Object.entries(TIPOS).map(([k, v]) => <span key={k} className={`a7-chip ${tipo === k ? 'on' : ''}`} onClick={() => setTipo(k)}>{v}</span>)}
      </div>
      <Estado carregando={carregando} erro={erro} vazio={!carregando && lista.length === 0} msgVazio="Nenhum documento publicado ainda." />
      <div className="a7-grid a7-g3">
        {lista.map(p => (
          <div key={p.id} className="a7-card" style={{ cursor: 'pointer' }} onClick={() => setSel(p)}>
            <div className="a7-row" style={{ justifyContent: 'space-between' }}>
              <small style={{ color: 'var(--mut)' }}>{TIPOS[p.tipo] ?? p.tipo}</small><Badge s={p.status} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, margin: '8px 0 4px' }}>{p.titulo}</div>
            <small style={{ color: 'var(--mut)' }}>{p.periodo || 'Sem período'} · atualizado em {fmtData(p.updated_at || p.created_at)}</small>
            <p style={{ color: 'var(--mut)', margin: '8px 0 0', fontSize: 13 }}>{(p.conteudo || '').slice(0, 120)}{(p.conteudo || '').length > 120 ? '…' : ''}</p>
          </div>
        ))}
      </div>
      {sel && (
        <Modal titulo={sel.titulo} onClose={() => setSel(null)}>
          <div className="a7-row" style={{ marginBottom: 10 }}><Badge s={sel.status} /><small style={{ color: 'var(--mut)' }}>{TIPOS[sel.tipo]} {sel.periodo && `· ${sel.periodo}`}</small></div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{sel.conteudo || 'Sem conteúdo.'}</div>
        </Modal>
      )}
    </div>
  )
}
