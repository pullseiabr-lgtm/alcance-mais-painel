'use client'
import { useRef, useState } from 'react'
import { a7, useA7, fmtData } from '@/lib/a7-client'
import { Cabecalho, Estado } from '../ui'

const ICO: Record<string, string> = { imagem: '🖼️', video: '🎬', documento: '📄', outro: '📎' }

export default function Biblioteca() {
  const { dados, carregando, erro, recarregar } = useA7('biblioteca')
  const [pasta, setPasta] = useState('todas')
  const [tipo, setTipo] = useState('todos')
  const [enviando, setEnviando] = useState(false)
  const [novaPasta, setNovaPasta] = useState('')
  const inp = useRef<HTMLInputElement>(null)

  const pastas = Array.from(new Set(dados.map(d => d.pasta || 'Geral')))
  const lista = dados.filter(d => (pasta === 'todas' || d.pasta === pasta) && (tipo === 'todos' || d.tipo === tipo))

  async function enviar(files: FileList | null) {
    if (!files?.length) return
    setEnviando(true)
    try {
      for (const f of Array.from(files)) await a7.enviarArquivo(f, novaPasta || (pasta !== 'todas' ? pasta : 'Enviados por mim'))
      recarregar()
    } catch (e: any) { alert(e.message) }
    setEnviando(false)
    if (inp.current) inp.current.value = ''
  }

  async function remover(id: string) {
    if (!confirm('Remover este arquivo?')) return
    try { await a7.apagar('biblioteca', id); recarregar() } catch (e: any) { alert(e.message) }
  }

  return (
    <div className="a7-page">
      <Cabecalho titulo="Biblioteca de conteúdo" sub="Artes, fotos, vídeos e documentos da sua marca."
        acao={<>
          <input ref={inp} type="file" multiple hidden onChange={e => enviar(e.target.files)} />
          <button className="a7-btn" disabled={enviando} onClick={() => inp.current?.click()}>{enviando ? 'Enviando…' : '⬆ Enviar arquivos'}</button>
        </>} />

      <div className="a7-tabs">
        <span className={`a7-chip ${pasta === 'todas' ? 'on' : ''}`} onClick={() => setPasta('todas')}>Todas as pastas</span>
        {pastas.map(p => <span key={p} className={`a7-chip ${pasta === p ? 'on' : ''}`} onClick={() => setPasta(p)}>📁 {p}</span>)}
      </div>
      <div className="a7-row" style={{ marginBottom: 16 }}>
        {['todos', 'imagem', 'video', 'documento'].map(t => (
          <span key={t} className={`a7-chip ${tipo === t ? 'on' : ''}`} onClick={() => setTipo(t)}>{t === 'todos' ? 'Todos os tipos' : ICO[t] + ' ' + t}</span>
        ))}
        <input className="a7-inp" style={{ maxWidth: 220, marginLeft: 'auto' }} placeholder="Pasta p/ novo envio" value={novaPasta} onChange={e => setNovaPasta(e.target.value)} />
      </div>

      <Estado carregando={carregando} erro={erro} vazio={!carregando && lista.length === 0} msgVazio="Nenhum arquivo ainda. Envie o primeiro!" />
      <div className="a7-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))' }}>
        {lista.map(d => (
          <div key={d.id} className="a7-card" style={{ padding: 10 }}>
            <a href={d.url} target="_blank" rel="noreferrer">
              {d.tipo === 'imagem' ? <img className="a7-thumb" src={d.url} alt={d.nome} loading="lazy" /> : <div className="a7-thumb">{ICO[d.tipo] ?? '📎'}</div>}
            </a>
            <div style={{ fontWeight: 600, marginTop: 8, fontSize: 12, wordBreak: 'break-word' }}>{d.nome}</div>
            <small style={{ color: 'var(--mut)' }}>{d.pasta} · {fmtData(d.created_at)}</small>
            <div className="a7-row" style={{ marginTop: 6 }}>
              <a className="a7-btn sec" style={{ padding: '3px 8px', fontSize: 11 }} href={d.url} download target="_blank" rel="noreferrer">Baixar</a>
              {d.origem === 'cliente' && <button className="a7-btn sec" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => remover(d.id)}>Remover</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
