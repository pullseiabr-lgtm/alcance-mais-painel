'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
  tag?: string
  tagColor?: string
}

type NavSection = {
  sec: string
  items: NavItem[]
}

const nav: NavSection[] = [
  {
    sec: 'Principal',
    items: [
      { href: '/', label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></> },
      { href: '/pipeline', label: 'Pipeline', icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>, tag: 'Kanban', tagColor: 'var(--al)' },
    ],
  },
  {
    sec: 'Clientes',
    items: [
      { href: '/clientes', label: 'Clientes', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
      { href: '/propostas', label: 'Propostas', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>, badge: 3 },
      { href: '/whatsapp', label: 'WhatsApp', icon: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></>, tag: 'Bot', tagColor: '#25D366' },
    ],
  },
  {
    sec: 'Marketing',
    items: [
      {
        href: '/planejamento',
        label: 'Planejamento',
        icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
        tag: 'Novo',
        tagColor: '#3B82F6',
      },
      {
        href: '/trafego',
        label: 'Tráfego PRO',
        icon: <><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></>,
        tag: 'IA',
        tagColor: '#F59E0B',
      },
      {
        href: '/social-planner',
        label: 'Social Planner',
        icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="14" r="1"/><circle cx="12" cy="14" r="1"/><circle cx="16" cy="14" r="1"/></>,
        tag: 'Novo',
        tagColor: '#EC4899',
      },
      { href: '/campanhas', label: 'Campanhas', icon: <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></> },
    ],
  },
  {
    sec: 'Operações',
    items: [
      { href: '/projetos', label: 'Projetos', icon: <><rect x="2" y="3" width="6" height="4"/><rect x="9" y="3" width="6" height="4"/><rect x="16" y="3" width="6" height="4"/><rect x="2" y="10" width="6" height="11"/><rect x="9" y="10" width="6" height="7"/><rect x="16" y="10" width="6" height="4"/></> },
      {
        href: '/tarefas',
        label: 'Tarefas',
        icon: <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
        tag: 'Novo',
        tagColor: '#3B82F6',
      },
      { href: '/calendario', label: 'Calendário', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
    ],
  },
  {
    sec: 'Gestão',
    items: [
      { href: '/financeiro', label: 'Financeiro', icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
      { href: '/equipe', label: 'Equipe', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
      { href: '/relatorios', label: 'Relatórios', icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
    ],
  },
  {
    sec: 'Admin',
    items: [
      {
        href: '/usuarios',
        label: 'Usuários',
        icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></>,
        tag: 'Acessos',
        tagColor: '#00C4B4',
      },
    ],
  },
  {
    sec: 'IA',
    items: [
      {
        href: '/figueiredo',
        label: 'FIGUEIREDO',
        icon: <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M12 14v2M10 16h4"/></>,
        tag: 'Core',
        tagColor: '#C9A227',
      },
      {
        href: '/agente',
        label: 'Agente IA',
        icon: <><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></>,
        tag: 'Novo',
        tagColor: 'var(--al)',
      },
      {
        href: '/editor',
        label: 'Editor de Vídeos',
        icon: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>,
        tag: 'Novo',
        tagColor: '#FF9500',
      },
      {
        href: '/video-ia',
        label: 'Gerador de Vídeo',
        icon: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/><circle cx="5" cy="9" r="1"/></>,
        tag: 'Grátis',
        tagColor: '#22C55E',
      },
      {
        href: '/marcas',
        label: 'Brand Kit',
        icon: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
        tag: 'Logos',
        tagColor: '#EC4899',
      },
      {
        href: '/studio-cards',
        label: 'Studio de Cards',
        icon: <><rect x="3" y="3" width="18" height="18" rx="3" ry="3"/><path d="M3 9h18M9 21V9"/></>,
        tag: 'Novo',
        tagColor: '#8B5CF6',
      },
      {
        href: '/criador-arte',
        label: 'Criador de Arte',
        icon: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>,
        tag: 'Magnific',
        tagColor: '#00C4B4',
      },
      {
        href: '/manus-imagens',
        label: 'Manus Imagens',
        icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
        tag: 'Banana',
        tagColor: '#FFD700',
      },
      {
        href: '/vision-ai',
        label: 'Vision AI',
        icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><path d="M12 5v2M12 17v2M5 12H3M21 12h-2"/></>,
        tag: 'Food',
        tagColor: '#FF6B35',
      },
      {
        href: '/ifood',
        label: 'Expert iFood',
        icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></>,
        tag: 'Novo',
        tagColor: '#E8002D',
      },
      {
        href: '/dev',
        label: 'Developer IA',
        icon: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
        tag: 'Novo',
        tagColor: '#00D4AA',
      },
    ],
  },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="logo">
          <div className="logo-box">
            <span className="logo-n">A</span>
          </div>
          <div>
            <div className="logo-txt">Alcance<span className="logo-plus">+</span></div>
            <div className="logo-sub">Agência de Marketing</div>
          </div>
        </div>
        <div className="live-badge">
          <span className="live-dot" />
          Sistema Ativo
        </div>
      </div>

      <nav className="sb-nav">
        {nav.map(sec => (
          <div key={sec.sec}>
            <div className="sb-sec">{sec.sec}</div>
            {sec.items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`ni${path === item.href ? ' act' : ''}`}
              >
                <svg viewBox="0 0 24 24">{item.icon}</svg>
                {item.label}
                {item.badge ? <span className="ni-badge">{item.badge}</span> : null}
                {item.tag ? (
                  <span className="ni-tag" style={{ background: `${item.tagColor}22`, color: item.tagColor }}>
                    {item.tag}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sb-foot">
        <div className="sb-user">
          <div className="sb-av">AG</div>
          <div>
            <div className="sb-nm">Alcance+</div>
            <div className="sb-rl">Admin da Agência</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
