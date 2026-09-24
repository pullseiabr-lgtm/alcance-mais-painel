'use client'
import { useState } from 'react'
import { a7, useA7, fmtDataHora } from '@/lib/a7-client'
import { LABEL_STATUS } from '@/lib/a7-config'
import { Badge, Cabecalho, Estado, Modal, REDE_ICO } from '../ui'

export default function Cronograma() {
  const { dados, carregando, erro, recarregar } = useA7('posts')
  const [modo, setModo] = useState<'lista' | 'mes'>('lista')
  const [filtro, setFiltro] = useState('todos')
  const [mes, setMes] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [sel, setSel] = useState<any>(null)
  const [coment, setComent] = useState('')
  const [salvando, setSalvando] = useState(false)

  const lista = dados.filter(p => filtro === 'todos' || p.status === filtro)

  async function decidir(status: 'aprovado' | 'ajuste') {
    if (status === 'ajuste' && !coment.trim()) { alert('Explique o que deseja ajustar.'); return }
    setSalvando(true)
    try {
      await a7.editar('posts', sel.id, { status, comentario_cliente: coment })
      setSel(null); setComent(''); recarregar()
    } catch (e: any) { alert(e.message) }
    setSalvando(false)
  }

  const abrir = (p: any) => { setSel(p); setComent(p.comentario_cliente || '') }

  // grade do mês
  const ini = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const dias: Date[] = []
  for (let i = -ini.getDay(); i < 42 - ini.getDay(); i++) dias.push(new Date(mes.getFullYear(), mes.getMonth(), 1 + i))

  return (
    <div className="a7-page">
      <Cabecalho titulo="Cronograma de postagens" sub="Veja o que vai ao ar, aprove ou peça ajustes."
        acao={<div className="a7-tabs" style={{ margin: 0 }}>
          <span className={`a7-chip ${modo === 'lista' ? 'on' : ''}`} onClick={() => setModo('lista')}>Lista</span>
          <span className={`a7-chip ${modo === 'mes' ? 'on' : ''}`} onClick={() => setModo('mes')}>Calendário</span>
        </div>} />

      <div className="a7-tabs">
        {['todos', 'aguardando_aprovacao', 'aprovado', 'ajuste', 'agendado', 'publicado'].map(s => (
          <span key={s} className={`a7-chip ${filtro === s ? 'on' : ''}`} onClick={() => setFiltro(s)}>
            {s === 'todos' ? 'Todos' : LABEL_STATUS[s].txt}
          </span>
        ))}
      </div>

      <Estado carregando={carregando} erro={erro} vazio={!carregando && lista.length === 0 && modo === 'lista'} msgVazio="Nenhuma postagem por aqui ainda." />

      {modo === 'lista' && (
        <div className="a7-grid a7-g3">
          {lista.map(p => (
            <div key={p.id} className="a7-card" style={{ cursor: 'pointer' }} onClick={() => abrir(p)}>
              {p.midia_url && /\.(png|jpe?g|webp|gif)/i.test(p.midia_url)
                ? <img className="a7-thumb" src={p.midia_url} alt="" style={{ aspectRatio: '16/9', marginBottom: 10 }} />
                : null}
              <div className="a7-row" style={{ justifyContent: 'space-between' }}>
                <span>{REDE_ICO[p.rede] ?? '🌐'} <small style={{ color: 'var(--mut)' }}>{p.rede} · {p.formato}</small></span>
                <Badge s={p.status} />
              </div>
              <div style={{ fontWeight: 700, margin: '8px 0 2px' }}>{p.titulo}</div>
              <small style={{ color: 'var(--mut)' }}>🗓 {fmtDataHora(p.data_publicacao)}</small>
            </div>
          ))}
        </div>
      )}

      {modo === 'mes' && (
        <>
          <div className="a7-row" style={{ justifyContent: 'center', marginBottom: 10 }}>
            <button className="a7-btn sec" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>‹</button>
            <b style={{ minWidth: 160, textAlign: 'center', textTransform: 'capitalize' }}>{mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</b>
            <button className="a7-btn sec" onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>›</button>
          </div>
          <div className="a7-cal">
            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(d => <div key={d} className="h">{d}</div>)}
            {dias.map((d, i) => {
              const evs = lista.filter(p => p.data_publicacao && new Date(p.data_publicacao).toDateString() === d.toDateString())
              return (
                <div key={i} className={`d ${d.getMonth() !== mes.getMonth() ? 'out' : ''}`}>
                  <div className="num">{d.getDate()}</div>
                  {evs.map(p => (
                    <div key={p.id} className="ev" style={{ background: LABEL_STATUS[p.status]?.cor }} onClick={() => abrir(p)}>
                      {REDE_ICO[p.rede]} {p.titulo}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </>
      )}

      {sel && (
        <Modal titulo={sel.titulo} onClose={() => setSel(null)}>
          <div className="a7-row" style={{ marginBottom: 8 }}>
            <Badge s={sel.status} /><small style={{ color: 'var(--mut)' }}>{REDE_ICO[sel.rede]} {sel.rede} · {sel.formato} · {fmtDataHora(sel.data_publicacao)}</small>
          </div>
          {sel.midia_url && (/\.(png|jpe?g|webp|gif)/i.test(sel.midia_url)
            ? <img src={sel.midia_url} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 10 }} />
            : <a className="a7-btn sec" href={sel.midia_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginBottom: 10 }}>Abrir arte / vídeo ↗</a>)}
          <div style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', borderRadius: 8, padding: 12 }}>{sel.legenda || 'Sem legenda.'}</div>
          {['aguardando_aprovacao', 'ajuste', 'aprovado'].includes(sel.status) && (
            <>
              <label className="a7-lbl">Seu comentário {sel.status !== 'aguardando_aprovacao' ? '' : '(obrigatório se pedir ajuste)'}</label>
              <textarea className="a7-inp" rows={3} value={coment} onChange={e => setComent(e.target.value)} />
              <div className="a7-row" style={{ marginTop: 12 }}>
                <button className="a7-btn ok" disabled={salvando} onClick={() => decidir('aprovado')}>✓ Aprovar</button>
                <button className="a7-btn warn" disabled={salvando} onClick={() => decidir('ajuste')}>✎ Pedir ajuste</button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
