'use client'
// Gestão do A7 (equipe Alcance+): publica conteúdo para o portal do cliente
import '../../a7/a7.css'
import { useEffect, useRef, useState } from 'react'
import { a7, useA7, fmtDataHora } from '@/lib/a7-client'
import { RECURSOS, type Campo } from '@/lib/a7-config'
import { Badge, Modal } from '../../a7/ui'

const ABAS = ['posts', 'acoes', 'biblioteca', 'planos', 'campanhas', 'senhas', 'chamados', 'comunicados', 'acessos'] as const
const ICO: Record<string, string> = { posts: '📅', acoes: '✅', biblioteca: '🖼️', planos: '🧭', campanhas: '📈', senhas: '🔐', chamados: '💬', comunicados: '📣', acessos: '👤' }

function CampoInput({ c, v, set }: { c: Campo; v: any; set: (x: any) => void }) {
  const base = { className: 'a7-inp', value: v ?? '' }
  if (c.tipo === 'textarea') return <textarea {...base} rows={4} onChange={e => set(e.target.value)} />
  if (c.tipo === 'select') return <select {...base} onChange={e => set(e.target.value)}><option value="">—</option>{c.opcoes!.map(o => <option key={o}>{o}</option>)}</select>
  if (c.tipo === 'datetime') return <input {...base} type="datetime-local" value={v ? String(v).slice(0, 16) : ''} onChange={e => set(e.target.value ? new Date(e.target.value).toISOString() : '')} />
  const t = c.tipo === 'number' ? 'number' : c.tipo === 'date' ? 'date' : 'text'
  return <input {...base} type={t} onChange={e => set(e.target.value)} />
}

export default function A7Gestao() {
  const [clientes, setClientes] = useState<any[]>([])
  const [cli, setCli] = useState('')
  const [aba, setAba] = useState<(typeof ABAS)[number]>('posts')
  const [form, setForm] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [pasta, setPasta] = useState('Geral')
  const [chamado, setChamado] = useState<any>(null)
  const [resp, setResp] = useState('')
  const inp = useRef<HTMLInputElement>(null)

  useEffect(() => { a7.listar('clientes', '').then(setClientes).catch(() => {}) }, [])
  const cfg = RECURSOS[aba]
  const { dados, carregando, erro, recarregar } = useA7(aba, cli)

  async function salvar() {
    setBusy(true)
    try {
      if (form.id) await a7.editar(aba, form.id, form, cli)
      else await a7.criar(aba, form, cli)
      setForm(null); recarregar()
    } catch (e: any) { alert(e.message) }
    setBusy(false)
  }
  async function apagar(id: string) {
    if (!confirm('Excluir?')) return
    try { await a7.apagar(aba, id, cli); recarregar() } catch (e: any) { alert(e.message) }
  }
  async function enviar(files: FileList | null) {
    if (!files?.length || !cli) return
    setBusy(true)
    try { for (const f of Array.from(files)) await a7.enviarArquivo(f, pasta, cli); recarregar() } catch (e: any) { alert(e.message) }
    setBusy(false)
    if (inp.current) inp.current.value = ''
  }
  async function responder() {
    if (!resp.trim()) return
    try {
      const u = await a7.editar('chamados', chamado.id, { mensagem: resp }, cli)
      setChamado(u); setResp(''); recarregar()
    } catch (e: any) { alert(e.message) }
  }
  async function mudarStatus(id: string, status: string) {
    try { await a7.editar('chamados', id, { status }, cli); recarregar() } catch (e: any) { alert(e.message) }
  }

  const resumo = (r: any) => {
    switch (aba) {
      case 'posts': return `${r.titulo} · ${r.rede}/${r.formato} · ${fmtDataHora(r.data_publicacao)}`
      case 'acoes': return `${r.o_que} · ${r.quem || 'sem responsável'} · prazo ${r.prazo || '—'}`
      case 'biblioteca': return `${r.nome} · 📁 ${r.pasta} · ${r.origem}`
      case 'planos': return `${r.titulo} · ${r.tipo} ${r.periodo ? '· ' + r.periodo : ''}`
      case 'campanhas': return `${r.nome} · ${r.canal} · R$ ${r.gasto}/${r.orcamento}`
      case 'senhas': return `${r.servico} · ${r.usuario}`
      case 'chamados': return `${r.titulo} · ${r.categoria} · ${(r.mensagens || []).length} msg`
      case 'comunicados': return `${r.titulo}${r.cliente_id ? '' : ' (todos os clientes)'}`
      default: return `${r.nome} · ${r.email} ${r.ultimo_login ? '· último acesso ' + fmtDataHora(r.ultimo_login) : '· nunca acessou'}`
    }
  }

  const geral = aba === 'comunicados'
  return (
    <div className="a7" style={{ minHeight: '100%', overflowY: 'auto', height: '100%' }}>
      <div className="a7-page">
        <div className="a7-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <div><h1 className="a7-h1">A7 · Gestão do portal do cliente</h1>
            <p className="a7-sub" style={{ margin: 0 }}>Tudo o que você publicar aqui aparece para o cliente em /a7.</p></div>
          {cli && <a className="a7-btn" href={`/a7?cliente=${cli}`} target="_blank" rel="noreferrer">👁 Ver como o cliente</a>}
        </div>

        <select className="a7-inp" style={{ maxWidth: 360, marginBottom: 14 }} value={cli} onChange={e => setCli(e.target.value)}>
          <option value="">Selecione o cliente…</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>

        <div className="a7-tabs">
          {ABAS.map(a => <span key={a} className={`a7-chip ${aba === a ? 'on' : ''}`} onClick={() => setAba(a)}>{ICO[a]} {RECURSOS[a].titulo}</span>)}
        </div>

        {!cli && !geral ? <div className="a7-empty">Selecione um cliente para gerenciar.</div> : (
          <>
            <div className="a7-row" style={{ marginBottom: 12 }}>
              {aba === 'biblioteca' ? (
                <>
                  <input className="a7-inp" style={{ maxWidth: 200 }} value={pasta} onChange={e => setPasta(e.target.value)} placeholder="Pasta" />
                  <input ref={inp} type="file" multiple hidden onChange={e => enviar(e.target.files)} />
                  <button className="a7-btn" disabled={busy} onClick={() => inp.current?.click()}>{busy ? 'Enviando…' : '⬆ Enviar arquivos'}</button>
                </>
              ) : aba !== 'chamados' && (
                <button className="a7-btn" onClick={() => setForm({ ...(aba === 'comunicados' && !cli ? { cliente_id: '' } : {}) })}>＋ Novo</button>
              )}
              {aba === 'comunicados' && !cli && <small style={{ color: 'var(--mut)' }}>Sem cliente selecionado: o comunicado vai para todos.</small>}
            </div>

            {erro && <div className="a7-err">{erro}</div>}
            {carregando && <div className="a7-empty">Carregando…</div>}
            {!carregando && dados.length === 0 && !erro && <div className="a7-empty">Nada cadastrado.</div>}
            <div className="a7-grid">
              {dados.map(r => (
                <div key={r.id} className="a7-card a7-row" style={{ justifyContent: 'space-between' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{resumo(r)}</div>
                    {(aba === 'posts' || aba === 'acoes') && r.comentario_cliente && <small style={{ color: '#b91c1c' }}>💬 Cliente: {r.comentario_cliente}</small>}
                  </div>
                  <div className="a7-row">
                    {(aba === 'posts' || aba === 'acoes' || aba === 'chamados' || aba === 'campanhas' || aba === 'planos') && r.status && <Badge s={r.status} />}
                    {aba === 'chamados' && <button className="a7-btn" style={{ padding: '4px 10px' }} onClick={() => setChamado(r)}>Abrir</button>}
                    {aba === 'chamados' && r.status !== 'resolvido' && <button className="a7-btn ok" style={{ padding: '4px 10px' }} onClick={() => mudarStatus(r.id, 'resolvido')}>Resolver</button>}
                    {aba !== 'chamados' && aba !== 'biblioteca' && <button className="a7-btn sec" style={{ padding: '4px 10px' }} onClick={() => setForm({ ...r })}>Editar</button>}
                    <button className="a7-btn sec" style={{ padding: '4px 10px' }} onClick={() => apagar(r.id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {form && (
          <Modal titulo={`${form.id ? 'Editar' : 'Novo'} · ${cfg.titulo}`} onClose={() => setForm(null)}>
            {cfg.campos.filter(c => !(aba === 'biblioteca')).map(c => (
              <div key={c.k}>
                <label className="a7-lbl">{c.label}{c.obrigatorio && ' *'}</label>
                <CampoInput c={c} v={form[c.k]} set={x => setForm({ ...form, [c.k]: x })} />
              </div>
            ))}
            {aba === 'acessos' && form.id && <small style={{ color: 'var(--mut)' }}>Deixe a senha em branco para mantê-la.</small>}
            <button className="a7-btn" style={{ marginTop: 14 }} disabled={busy} onClick={salvar}>{busy ? 'Salvando…' : 'Salvar'}</button>
          </Modal>
        )}

        {chamado && (
          <Modal titulo={chamado.titulo} onClose={() => setChamado(null)}>
            <div className="a7-row" style={{ marginBottom: 8 }}>
              <Badge s={chamado.status} />
              <select className="a7-inp" style={{ maxWidth: 200 }} value={chamado.status}
                onChange={async e => { await mudarStatus(chamado.id, e.target.value); setChamado({ ...chamado, status: e.target.value }) }}>
                {['novo', 'andamento', 'aguardando_cliente', 'resolvido'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 10 }}>
              {(chamado.mensagens || []).map((m: any, i: number) => (
                <div key={i} className={`a7-msg ${m.de === 'cliente' ? 'cli' : 'eq'}`}><small>{m.autor} · {fmtDataHora(m.em)}</small>{m.texto}</div>
              ))}
            </div>
            <textarea className="a7-inp" rows={3} placeholder="Responder ao cliente…" value={resp} onChange={e => setResp(e.target.value)} />
            <button className="a7-btn" style={{ marginTop: 10 }} onClick={responder}>Enviar resposta</button>
          </Modal>
        )}
      </div>
    </div>
  )
}
