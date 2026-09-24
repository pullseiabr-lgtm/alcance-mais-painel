'use client'
import './a7.css'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { a7, setClientePreview } from '@/lib/a7-client'

const NAV = [
  { href: '/a7', label: 'Início', ic: '🏠' },
  { href: '/a7/cronograma', label: 'Cronograma de posts', ic: '📅' },
  { href: '/a7/plano-acao', label: 'Plano de ação', ic: '✅' },
  { href: '/a7/biblioteca', label: 'Biblioteca', ic: '🖼️' },
  { href: '/a7/estrategia', label: 'Estratégia e planejamento', ic: '🧭' },
  { href: '/a7/campanhas', label: 'Campanhas e tráfego', ic: '📈' },
  { href: '/a7/analytics', label: 'Analytics', ic: '📊' },
  { href: '/a7/senhas', label: 'Senhas e acessos', ic: '🔐' },
  { href: '/a7/chamados', label: 'Chamados', ic: '💬' },
  { href: '/a7/comunicados', label: 'Comunicados', ic: '📣' },
]

export default function A7Layout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [aberto, setAberto] = useState(false)
  const [pendentes, setPendentes] = useState(0)
  const login = path === '/a7/login'

  useEffect(() => {
    if (login) return
    const c = new URLSearchParams(window.location.search).get('cliente')
    if (c) setClientePreview(c)
    a7.me().then(m => {
      if (!m.cliente) { router.replace('/a7/login'); return }
      setMe(m)
      a7.listar('posts').then(p => setPendentes(p.filter((x: any) => x.status === 'aguardando_aprovacao').length)).catch(() => {})
    }).catch(() => router.replace('/a7/login'))
  }, [login, router])

  if (login) return <div className="a7">{children}</div>
  if (!me) return <div className="a7"><div className="a7-empty" style={{ paddingTop: 120 }}>Carregando…</div></div>

  async function sair() {
    setClientePreview('')
    await fetch('/api/a7/logout', { method: 'POST' })
    router.replace(me.tipo === 'staff' ? '/painel' : '/a7/login')
  }

  return (
    <div className="a7">
      <div className="a7-shell">
        <aside className={`a7-side ${aberto ? 'open' : ''}`}>
          <div className="a7-brand">A7<small>Portal do Cliente · Alcance+</small></div>
          <nav className="a7-nav" onClick={() => setAberto(false)}>
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className={path === n.href ? 'on' : ''}>
                <span>{n.ic}</span>{n.label}
                {n.href === '/a7/cronograma' && pendentes > 0 && <span className="dot">{pendentes}</span>}
              </Link>
            ))}
          </nav>
          <div className="foot">{me.tipo === 'staff' ? '👁 Visão da equipe' : me.nome}</div>
        </aside>
        <div className="a7-main">
          <div className="a7-top">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button className="a7-burger" onClick={() => setAberto(o => !o)}>☰</button>
              <b>{me.cliente.nome}</b>
            </div>
            <button className="a7-btn-sair" onClick={sair}>{me.tipo === 'staff' ? 'Voltar ao painel' : 'Sair'}</button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
