'use client'
import { useState } from 'react'
import { a7, useA7 } from '@/lib/a7-client'
import { Cabecalho, Estado, Modal } from '../ui'

const VAZIO = { servico: '', url: '', usuario: '', senha: '', obs: '' }

export default function Senhas() {
  const { dados, carregando, erro, recarregar } = useA7('senhas')
  const [ver, setVer] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState<any>(null)
  const [salvando, setSalvando] = useState(false)

  const copiar = (t: string) => navigator.clipboard?.writeText(t).catch(() => {})

  async function salvar() {
    if (!form.servico.trim()) { alert('Informe o serviço.'); return }
    setSalvando(true)
    try {
      form.id ? await a7.editar('senhas', form.id, form) : await a7.criar('senhas', form)
      setForm(null); recarregar()
    } catch (e: any) { alert(e.message) }
    setSalvando(false)
  }
  async function apagar(id: string) {
    if (!confirm('Excluir este acesso?')) return
    try { await a7.apagar('senhas', id); recarregar() } catch (e: any) { alert(e.message) }
  }

  return (
    <div className="a7-page">
      <Cabecalho titulo="Senhas e acessos" sub="Logins das suas redes e ferramentas, guardados com criptografia."
        acao={<button className="a7-btn" onClick={() => setForm({ ...VAZIO })}>＋ Novo acesso</button>} />
      <div className="a7-warn">🔒 Somente você e a equipe da Alcance+ veem estes dados. Nunca compartilhe estas senhas por WhatsApp ou e-mail.</div>
      <Estado carregando={carregando} erro={erro} vazio={!carregando && dados.length === 0} msgVazio="Nenhum acesso cadastrado." />
      <div className="a7-grid a7-g3">
        {dados.map(s => (
          <div key={s.id} className="a7-card">
            <div className="a7-row" style={{ justifyContent: 'space-between' }}>
              <b>{s.servico}</b>
              {s.url && <a href={s.url} target="_blank" rel="noreferrer" style={{ color: 'var(--t)', fontSize: 12 }}>abrir ↗</a>}
            </div>
            <div style={{ marginTop: 10, fontSize: 13 }}>
              <div className="a7-row" style={{ justifyContent: 'space-between' }}><span style={{ color: 'var(--mut)' }}>Usuário</span>
                <span>{s.usuario || '—'} {s.usuario && <a style={{ cursor: 'pointer' }} onClick={() => copiar(s.usuario)}>📋</a>}</span></div>
              <div className="a7-row" style={{ justifyContent: 'space-between', marginTop: 6 }}><span style={{ color: 'var(--mut)' }}>Senha</span>
                <span style={{ fontFamily: 'monospace' }}>{ver[s.id] ? s.senha || '—' : '••••••••'}{' '}
                  <a style={{ cursor: 'pointer' }} onClick={() => setVer(v => ({ ...v, [s.id]: !v[s.id] }))}>{ver[s.id] ? '🙈' : '👁'}</a>{' '}
                  {s.senha && <a style={{ cursor: 'pointer' }} onClick={() => copiar(s.senha)}>📋</a>}</span></div>
              {s.obs && <p style={{ background: '#f8fafc', borderRadius: 8, padding: 8, marginBottom: 0 }}>{s.obs}</p>}
            </div>
            <div className="a7-row" style={{ marginTop: 10 }}>
              <button className="a7-btn sec" style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => setForm({ ...s })}>Editar</button>
              <button className="a7-btn sec" style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => apagar(s.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
      {form && (
        <Modal titulo={form.id ? 'Editar acesso' : 'Novo acesso'} onClose={() => setForm(null)}>
          {(['servico', 'url', 'usuario', 'senha'] as const).map(k => (
            <div key={k}>
              <label className="a7-lbl">{{ servico: 'Serviço (ex.: Instagram)', url: 'Link de acesso', usuario: 'Usuário / e-mail', senha: 'Senha' }[k]}</label>
              <input className="a7-inp" type={k === 'senha' ? 'text' : 'text'} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          <label className="a7-lbl">Observações</label>
          <textarea className="a7-inp" rows={2} value={form.obs || ''} onChange={e => setForm({ ...form, obs: e.target.value })} />
          <button className="a7-btn" style={{ marginTop: 14 }} disabled={salvando} onClick={salvar}>{salvando ? 'Salvando…' : 'Salvar'}</button>
        </Modal>
      )}
    </div>
  )
}
