'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BK = '#0a0b10', CARD = '#14161e', TXT = '#f0f3f7', MUT = '#9aa6b2', TEAL = '#00C4B4'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function login(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErro('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'E-mail ou senha inválidos.'); setLoading(false) }
      else { router.push('/painel'); router.refresh() }
    } catch { setErro('Erro de conexão.'); setLoading(false) }
  }

  const Logo = ({ s = 40 }: { s?: number }) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, fontWeight: 900, fontSize: s, letterSpacing: '-.02em', fontStyle: 'italic' }}>
      <span style={{ color: '#fff' }}>ALCANCE</span>
      <span style={{ background: 'linear-gradient(135deg,#F59E0B,#EC4899,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: s * 1.15 }}>+7</span>
    </div>
  )

  const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 9, border: '1px solid #ffffff22', background: '#0a0b10', color: '#fff', fontSize: 14 }
  const btnP: React.CSSProperties = { background: TEAL, color: '#04201d', border: 'none', borderRadius: 999, padding: '13px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: `0 8px 28px ${TEAL}44` }

  return (
    <div style={{ background: BK, color: TXT, fontFamily: 'system-ui,"Plus Jakarta Sans",sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' }}>
      {/* brilhos de fundo */}
      <div style={{ position: 'absolute', top: -80, left: -60, width: 360, height: 360, borderRadius: '50%', background: '#7C3AED33', filter: 'blur(90px)' }} />
      <div style={{ position: 'absolute', bottom: -60, right: -40, width: 320, height: 320, borderRadius: '50%', background: '#00C4B426', filter: 'blur(90px)' }} />

      <div style={{ position: 'relative', background: CARD, border: '1px solid #ffffff1a', borderRadius: 18, padding: 34, width: 400, maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><Logo s={40} /></div>
          <div style={{ fontSize: 13, color: MUT, marginTop: 6 }}>Acesso ao sistema de gestão</div>
        </div>

        <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: MUT, display: 'block', marginBottom: 5 }}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required autoFocus style={input} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: MUT, display: 'block', marginBottom: 5 }}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required style={input} />
          </div>
          {erro && <div style={{ fontSize: 12, color: '#fca5a5', padding: '8px 12px', background: 'rgba(239,68,68,.12)', borderRadius: 8 }}>{erro}</div>}
          <button type="submit" disabled={loading} style={{ ...btnP, width: '100%', marginTop: 4, opacity: loading ? .7 : 1 }}>{loading ? 'Entrando…' : 'Entrar'}</button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/" style={{ color: MUT, fontSize: 12, textDecoration: 'none' }}>← Voltar ao site</Link>
        </div>
      </div>
    </div>
  )
}
