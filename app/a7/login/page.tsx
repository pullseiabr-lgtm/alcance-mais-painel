'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function A7Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e: React.FormEvent) {
    e.preventDefault(); setErro(''); setCarregando(true)
    const r = await fetch('/api/a7/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha }) })
    const j = await r.json().catch(() => ({}))
    setCarregando(false)
    if (!r.ok) { setErro(j.error || 'Não foi possível entrar'); return }
    router.replace('/a7')
  }

  return (
    <div className="a7-login">
      <form className="box" onSubmit={entrar}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: '#00A89A' }}>A7</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>Portal do Cliente · Alcance+</div>
        </div>
        {erro && <div className="a7-err">{erro}</div>}
        <label className="a7-lbl">E-mail</label>
        <input className="a7-inp" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        <label className="a7-lbl">Senha</label>
        <input className="a7-inp" type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
        <button className="a7-btn" style={{ width: '100%', marginTop: 18, padding: 11 }} disabled={carregando}>
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 14 }}>
          Esqueceu a senha? Fale com a sua equipe na Alcance+.
        </p>
      </form>
    </div>
  )
}
