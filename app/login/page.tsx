'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error ?? 'E-mail ou senha inválidos.')
        setLoading(false)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div className="logo-box" style={{ width: 52, height: 52 }}>
              <span style={{ fontWeight: 900, fontSize: 26, color: '#fff' }}>A</span>
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--wh)' }}>
            Alcance<span style={{ color: 'var(--al)' }}>+</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--gr3)', marginTop: 4 }}>Sistema de Gestão da Agência</div>
        </div>

        <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>E-mail</label>
            <input
              className="inp"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label>Senha</label>
            <input
              className="inp"
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {erro && (
            <div style={{
              fontSize: 11, color: 'var(--er)', padding: '8px 12px',
              background: 'rgba(239,68,68,.1)', borderRadius: 'var(--r)',
              border: '1px solid rgba(239,68,68,.2)',
            }}>
              {erro}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-al"
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13, marginTop: 4 }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: 'var(--gr3)' }}>
          Alcance+ Agência de Marketing — Sistema interno
        </div>
      </div>
    </div>
  )
}
