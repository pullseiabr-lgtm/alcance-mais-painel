'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const BK = '#0a0b10', CARD = '#14161e', TXT = '#f0f3f7', MUT = '#9aa6b2', TEAL = '#00C4B4'
const YELLOW = '#FFC400', PINK = '#EC4899', PURPLE = '#7C3AED', BLUE = '#3B82F6'
// imagens em /public — salve hero.png / criatividade.png / performance.png / logo.png
const IMG = { hero: '/hero.png', criatividade: '/criatividade.png', performance: '/performance.png', logo: '/logo.png' }
const WHATS = '5581992573535'
const zap = (t: string) => `https://wa.me/${WHATS}?text=${encodeURIComponent(t)}`
// paleta criativa (Canva/Red Bull energy)
const GRAD = ['linear-gradient(135deg,#00C4B4,#0891b2)', 'linear-gradient(135deg,#7C3AED,#a855f7)', 'linear-gradient(135deg,#EC4899,#f43f5e)', 'linear-gradient(135deg,#F59E0B,#f97316)', 'linear-gradient(135deg,#3B82F6,#6366f1)', 'linear-gradient(135deg,#10B981,#059669)']

const CRIATIVO = ['Identidade visual', 'Produção de conteúdo', 'Reels e vídeos', 'Design para redes', 'Catálogo digital', 'Sites & Landing Pages', 'Fotografia e filmagem', 'Branding', 'Motion Design', 'Cobertura de eventos']
const PERFORMANCE = ['CRM com automação', 'Gestão comercial', 'Funil de vendas', 'Disparo em massa no WhatsApp', 'Gestão de relacionamento', 'Relatórios e indicadores', 'Inteligência comercial', 'Captação de leads', 'Recuperação de clientes', 'Automação de processos']
const SOLUCOES = [
  { ic: '📱', t: 'Marketing Digital', d: 'Instagram, Facebook, TikTok, LinkedIn e YouTube.' },
  { ic: '🚀', t: 'Tráfego Pago', d: 'Google Ads, Meta Ads e campanhas que geram vendas.' },
  { ic: '🤖', t: 'CRM e Automação', d: 'WhatsApp, disparos em massa e gestão do relacionamento.' },
  { ic: '💼', t: 'Venda Mais', d: 'Sistema de gestão comercial e vendas.' },
  { ic: '🍔', t: 'Venda Mais Delivery', d: 'CRM especializado para restaurantes e delivery.' },
  { ic: '🎬', t: 'Produção de Conteúdo', d: 'Fotos, vídeos, reels, podcasts e cobertura de eventos.' },
  { ic: '🌐', t: 'Sites e Landing Pages', d: 'Sites, catálogos digitais e páginas de alta conversão.' },
  { ic: '🎤', t: 'Gestão de Carreira', d: 'Cantores, bandas, DJs, atletas e influenciadores.' },
]
const PACKS = [
  ['📸', 'Packs Instagram', 'Restaurantes · Delivery · Clínicas · Academias · Eventos · Imobiliárias'],
  ['💼', 'Packs LinkedIn', 'Vendas · Marketing · RH · Empresários'],
  ['📲', 'Packs Stories', 'Artes prontas para stories que convertem'],
  ['🎯', 'Artes para Campanhas', 'Criativos de alta performance'],
  ['⭐', 'Capas de Destaques', 'Destaques profissionais para o perfil'],
  ['📊', 'Apresentações', 'Pitch decks e apresentações premium'],
  ['📖', 'Catálogos Digitais', 'Catálogos interativos de produtos'],
  ['🍽️', 'Cardápios Digitais', 'Cardápios modernos para o seu negócio'],
]
const NUMEROS = [{ n: 500, s: '+', l: 'Projetos criados' }, { n: 100, s: '+', l: 'Empresas atendidas' }, { n: 1, s: 'M+', l: 'Pessoas impactadas' }, { n: 50, s: '+', l: 'Marcas em crescimento' }]
const BLOG = ['Marketing', 'Vendas', 'IA', 'WhatsApp', 'Tráfego Pago', 'CRM', 'Redes Sociais', 'Produção de Conteúdo']
const ARTISTAS = ['Cantores', 'Bandas', 'DJs', 'Influenciadores', 'Atletas']

function Counter({ n, s }: { n: number; s: string }) {
  const [v, setV] = useState(0); const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { const t0 = performance.now(); const tick = (t: number) => { const p = Math.min((t - t0) / 1200, 1); setV(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick) }; requestAnimationFrame(tick); io.disconnect() } }, { threshold: .4 })
    io.observe(el); return () => io.disconnect()
  }, [n])
  return <div ref={ref} style={{ fontSize: 'clamp(34px,5vw,52px)', fontWeight: 900, letterSpacing: '-.03em', background: 'linear-gradient(135deg,#fff,#00C4B4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>+{v}{s}</div>
}

export default function HomePage() {
  const [email, setEmail] = useState(''); const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false); const [erro, setErro] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [cNome, setCNome] = useState(''); const [cContato, setCContato] = useState(''); const [cMsg, setCMsg] = useState('')
  const router = useRouter()
  useEffect(() => { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).style.cssText += ';opacity:1;transform:none' }), { threshold: .1 }); document.querySelectorAll('[data-rv]').forEach(el => io.observe(el)); return () => io.disconnect() }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setErro('')
    try { const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha }) }); const data = await res.json(); if (!res.ok) { setErro(data.error ?? 'E-mail ou senha inválidos.'); setLoading(false) } else { router.push('/painel'); router.refresh() } } catch { setErro('Erro de conexão.'); setLoading(false) }
  }
  function enviarContato(e: React.FormEvent) { e.preventDefault(); window.open(zap(`Olá! Quero um DIAGNÓSTICO da Alcance+.\n\n*Nome:* ${cNome}\n*Contato:* ${cContato}\n*Negócio/objetivo:* ${cMsg}`), '_blank') }

  const rv: React.CSSProperties = { opacity: 0, transform: 'translateY(26px)', transition: 'opacity .6s ease, transform .6s ease' }
  const sec: React.CSSProperties = { maxWidth: 1180, margin: '0 auto', padding: '0 22px' }
  const btnP: React.CSSProperties = { background: TEAL, color: '#04201d', border: 'none', borderRadius: 999, padding: '14px 28px', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: `0 8px 28px ${TEAL}44` }
  const btnW: React.CSSProperties = { background: '#25D366', color: '#fff', border: 'none', borderRadius: 999, padding: '14px 26px', fontWeight: 800, fontSize: 15, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }
  const h2: React.CSSProperties = { fontSize: 'clamp(26px,4.2vw,42px)', fontWeight: 900, letterSpacing: '-.03em', margin: 0 }
  const Logo = ({ s = 22 }: { s?: number }) => (<div style={{ display: 'flex', alignItems: 'baseline', gap: 2, fontWeight: 900, fontSize: s, letterSpacing: '-.02em', fontStyle: 'italic' }}><span style={{ color: '#fff' }}>ALCANCE</span><span style={{ background: 'linear-gradient(135deg,#F59E0B,#EC4899,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: s * 1.15 }}>+7</span></div>)
  const PILARES = [['🚀', 'ESTRATÉGIA', 'QUE VENDE'], ['🤖', 'TECNOLOGIA', 'QUE CONECTA'], ['🎨', 'CRIATIVIDADE', 'QUE ENGAJA'], ['🎯', 'GESTÃO', 'QUE RESULTA']]

  return (
    <div style={{ background: BK, color: TXT, fontFamily: 'system-ui,"Plus Jakarta Sans",sans-serif', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        .sol{transition:.25s} .sol:hover{transform:translateY(-6px);box-shadow:0 16px 44px rgba(0,0,0,.5)}
        .chip{transition:.2s} .chip:hover{transform:translateY(-3px)}
        .btnp:hover{filter:brightness(1.08)} .lnk:hover{opacity:.8}
        @keyframes blob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.2)}}
        @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .mqrow{display:flex;gap:40px;white-space:nowrap;animation:mq 24s linear infinite;width:max-content}
        @keyframes grad{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @media(max-width:920px){.navlinks{display:none!important}.selo{display:none!important}.herophoto{opacity:.32!important}}
      `}</style>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 60, background: 'rgba(10,11,16,.82)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #ffffff10' }}>
        <div style={{ ...sec, maxWidth: 1280, padding: '13px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <Logo s={22} />
          <nav className="navlinks" style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            {[['Soluções', '#solucoes'], ['Packs de Cards', '#loja'], ['Sobre Nós', '#artists'], ['Cases', '#numeros'], ['Blog', '#blog'], ['Contato', '#contato']].map(([t, h]) => (
              <a key={t} href={h} className="lnk" style={{ color: TXT, fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>{t}</a>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href={zap('Olá! Quero falar com a Alcance+7.')} target="_blank" rel="noreferrer" className="lnk" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1.5px solid ${YELLOW}`, color: YELLOW, fontSize: 12.5, fontWeight: 800, textDecoration: 'none', padding: '8px 16px', borderRadius: 999 }}>📲 FALAR NO WHATSAPP</a>
            <button onClick={() => setShowLogin(true)} className="btnp" style={{ ...btnP, padding: '9px 18px', fontSize: 13 }}>Acessar Sistema</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid #ffffff0a' }}>
        {/* foto da equipe ao fundo (direita) */}
        <div className="herophoto" style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(90deg,${BK} 8%, rgba(10,11,16,.55) 42%, rgba(10,11,16,.15) 72%), url(${IMG.hero})`, backgroundSize: 'cover', backgroundPosition: 'center right', opacity: .9 }} />
        {/* splatters */}
        <div style={{ position: 'absolute', top: -60, left: -40, width: 360, height: 360, borderRadius: '50%', background: `${PURPLE}33`, filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 120, width: 300, height: 300, borderRadius: '50%', background: `${PINK}26`, filter: 'blur(90px)' }} />
        <div style={{ position: 'absolute', top: 80, left: 200, width: 240, height: 240, borderRadius: '50%', background: `${YELLOW}1f`, filter: 'blur(80px)' }} />
        <div style={{ ...sec, maxWidth: 1280, position: 'relative', padding: '70px 22px 60px' }}>
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ fontSize: 'clamp(46px,9vw,104px)', fontWeight: 900, fontStyle: 'italic', lineHeight: .9, margin: 0, letterSpacing: '-.04em', textShadow: '0 6px 30px rgba(0,0,0,.6)' }}>
              ALCANCE<span style={{ background: 'linear-gradient(135deg,#F59E0B,#EC4899,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>+7</span>
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 14, fontWeight: 800, fontSize: 'clamp(11px,1.6vw,15px)', letterSpacing: '.04em' }}>
              <span>CRIAMOS</span><span style={{ color: YELLOW }}>•</span><span>ESTRATÉGIAS</span><span style={{ color: PINK }}>•</span><span>CONECTAMOS</span><span style={{ color: TEAL }}>•</span><span>RESULTADOS</span>
            </div>
            <h2 style={{ fontSize: 'clamp(20px,3.2vw,30px)', fontWeight: 900, lineHeight: 1.12, margin: '26px 0 0', letterSpacing: '-.02em' }}>
              MARKETING, TECNOLOGIA E <span style={{ color: YELLOW }}>CRIATIVIDADE</span><br />PARA FAZER SUA EMPRESA <span style={{ color: PINK }}>VENDER MAIS.</span>
            </h2>
            <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: '#cdd5de', maxWidth: 520, margin: '16px 0 0', lineHeight: 1.5 }}>Soluções completas em marketing digital, gestão, automação e criação para impulsionar o seu negócio.</p>

            {/* 4 PILARES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 0, margin: '30px 0 0', maxWidth: 560 }}>
              {PILARES.map(([ic, a, b], i) => (
                <div key={a} style={{ textAlign: 'center', padding: '0 10px', borderLeft: i ? '1px solid #ffffff1f' : 'none' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{ic}</div>
                  <div style={{ fontWeight: 900, fontSize: 13.5 }}>{a}</div>
                  <div style={{ color: MUT, fontSize: 11.5, fontWeight: 600 }}>{b}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 34, flexWrap: 'wrap' }}>
              <a href="#contato" className="btnp" style={{ ...btnP, background: YELLOW, color: '#1a1300', boxShadow: `0 8px 28px ${YELLOW}44` }}>SOLICITAR DIAGNÓSTICO →</a>
              <a href="#solucoes" className="btnp" style={{ ...btnP, background: 'transparent', color: '#fff', border: '1.5px solid #ffffff33', boxShadow: 'none' }}>CONHECER SOLUÇÕES →</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 30, flexWrap: 'wrap', color: MUT, fontSize: 12.5, fontWeight: 700 }}>
              <span>ATENDEMOS EMPRESAS DE <span style={{ color: '#fff' }}>TODOS OS TAMANHOS</span></span>
              <span style={{ display: 'flex', gap: 14, opacity: .85 }}>📸 Instagram · 💼 LinkedIn · 🔍 Google Ads · Ⓜ Meta · 📲 WhatsApp</span>
            </div>
          </div>

          {/* selo +7 ANOS */}
          <div className="selo" style={{ position: 'absolute', right: 40, bottom: 50, width: 132, height: 132, borderRadius: '50%', background: 'radial-gradient(circle,#14161e,#0a0b10)', border: `2px solid ${YELLOW}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: `0 0 40px ${PURPLE}66` }}>
            <div style={{ fontSize: 30, fontWeight: 900, fontStyle: 'italic', background: 'linear-gradient(135deg,#F59E0B,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>+7</div>
            <div style={{ fontSize: 12, fontWeight: 900 }}>ANOS</div>
            <div style={{ fontSize: 8.5, color: MUT, fontWeight: 700, marginTop: 2 }}>IMPULSIONANDO<br />NEGÓCIOS</div>
          </div>
        </div>
      </section>

      {/* CRIATIVIDADE */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(100deg,${BK} 4%, rgba(10,11,16,.6) 45%, rgba(10,11,16,.2) 80%), url(${IMG.criatividade})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 15% 30%, #EC489922, transparent 45%), radial-gradient(circle at 5% 90%, #F59E0B1f, transparent 40%)' }} />
        <div style={{ ...sec, maxWidth: 1280, position: 'relative', padding: '80px 22px' }}>
          <div data-rv style={{ ...rv, maxWidth: 560 }}>
            <h2 style={{ fontSize: 'clamp(34px,6vw,68px)', fontWeight: 900, fontStyle: 'italic', lineHeight: .92, margin: 0, letterSpacing: '-.03em' }}>CRIATIVIDADE</h2>
            <h3 style={{ fontSize: 'clamp(16px,2.4vw,24px)', fontWeight: 800, margin: '8px 0 0' }}>QUE TRANSFORMA IDEIAS<br /><span style={{ color: YELLOW }}>EM RESULTADOS</span></h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 26px', margin: '26px 0', maxWidth: 420 }}>
              {[['✏️', 'Design', PURPLE], ['▶️', 'Vídeo', PINK], ['💬', 'Conteúdo', BLUE], ['</>', 'Tecnologia', TEAL], ['🎯', 'Estratégia', YELLOW], ['📊', 'Resultados', '#10B981']].map(([ic, t, c]) => (
                <div key={t as string} style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 700, fontSize: 14.5 }}><span style={{ color: c as string, fontSize: 16 }}>{ic}</span>{t}</div>
              ))}
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, color: '#e6ebf0' }}>Aqui a <span style={{ color: YELLOW }}>criatividade</span> ganha forma, e as <span style={{ color: PINK }}>marcas</span> ganham <span style={{ color: PINK }}>vida!</span></p>
          </div>
        </div>
      </section>

      {/* GESTÃO E PERFORMANCE */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(100deg,${BK} 4%, rgba(10,11,16,.62) 45%, rgba(10,11,16,.2) 82%), url(${IMG.performance})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 12% 20%, #00C4B41f, transparent 45%), radial-gradient(circle at 8% 90%, #EC489922, transparent 40%)' }} />
        <div style={{ ...sec, maxWidth: 1280, position: 'relative', padding: '80px 22px' }}>
          <div data-rv style={{ ...rv, maxWidth: 540 }}>
            <h2 style={{ fontSize: 'clamp(30px,5vw,56px)', fontWeight: 900, fontStyle: 'italic', lineHeight: .95, margin: 0, letterSpacing: '-.03em' }}>GESTÃO E<br /><span style={{ color: YELLOW }}>PERFORMANCE</span></h2>
            <h3 style={{ fontSize: 'clamp(15px,2vw,20px)', fontWeight: 800, margin: '12px 0 0' }}>Resultados reais. <span style={{ color: PINK }}>Crescimento contínuo.</span></h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, margin: '26px 0 0' }}>
              {[['🎯', 'Estratégia', TEAL], ['👥', 'Gestão', BLUE], ['🤖', 'Tecnologia', PINK], ['📊', 'Análise', PURPLE], ['💡', 'Criatividade', YELLOW], ['🚀', 'Foco em Resultados', '#10B981']].map(([ic, t, c]) => (
                <div key={t as string} style={{ display: 'flex', alignItems: 'center', gap: 11, fontWeight: 800, fontSize: 15 }}><span style={{ color: c as string, fontSize: 17 }}>{ic}</span>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOLUÇÕES */}
      <section id="solucoes" style={{ ...sec, padding: '20px 22px 50px' }}>
        <h2 data-rv style={{ ...rv, ...h2, textAlign: 'center', marginBottom: 8 }}>Soluções</h2>
        <p data-rv style={{ ...rv, textAlign: 'center', color: MUT, marginBottom: 30 }}>Tudo o que sua empresa precisa, integrado.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
          {SOLUCOES.map((s, i) => (
            <div key={s.t} data-rv className="sol" style={{ ...rv, transitionDelay: `${i * 40}ms`, background: CARD, border: '1px solid #ffffff12', borderRadius: 16, padding: 20 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: GRAD[i % GRAD.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12 }}>{s.ic}</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 5 }}>{s.t}</div>
              <div style={{ color: MUT, fontSize: 13, lineHeight: 1.45 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LOJA CRIATIVA */}
      <section id="loja" style={{ position: 'relative', padding: '60px 22px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 30%, #7C3AED1f, transparent 45%), radial-gradient(circle at 15% 70%, #00C4B41f, transparent 45%)' }} />
        <div style={{ ...sec, position: 'relative' }}>
          <div data-rv style={{ ...rv, textAlign: 'center', marginBottom: 30 }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, marginBottom: 12 }}>🛍️ LOJA CRIATIVA</div>
            <h2 style={h2}>Templates prontos para <span style={{ color: '#EC4899' }}>acelerar suas vendas</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
            {PACKS.map((p, i) => (
              <div key={p[1]} data-rv className="sol" style={{ ...rv, transitionDelay: `${i * 30}ms`, background: CARD, border: '1px solid #ffffff12', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{p[0]}</div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{p[1]}</div>
                <div style={{ color: MUT, fontSize: 12.5, lineHeight: 1.4 }}>{p[2]}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <a href={zap('Olá! Quero ver os templates da Loja Criativa da Alcance+.')} target="_blank" rel="noreferrer" className="btnp" style={{ ...btnP, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', color: '#fff', boxShadow: '0 8px 28px rgba(124,58,237,.4)' }}>Comprar Templates →</a>
          </div>
        </div>
      </section>

      {/* ARTISTS */}
      <section id="artists" style={{ ...sec, padding: '40px 22px' }}>
        <div data-rv style={{ ...rv, background: `linear-gradient(135deg,${TEAL}14,#7C3AED14,${CARD})`, border: `1px solid ${TEAL}30`, borderRadius: 22, padding: '38px 28px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: `${TEAL}22`, color: TEAL, padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, marginBottom: 14 }}>🎤 ALCANCE MAIS 7 ARTISTS</div>
          <h2 style={{ ...h2, marginBottom: 12 }}>Gestão de carreira para artistas</h2>
          <p style={{ color: MUT, fontSize: 16, marginBottom: 22 }}>Do talento ao sucesso — transformamos artistas em marcas fortes.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>{ARTISTAS.map(a => <span key={a} style={{ background: '#ffffff0d', border: '1px solid #ffffff1a', borderRadius: 30, padding: '9px 18px', fontWeight: 600, fontSize: 14 }}>✓ {a}</span>)}</div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section id="numeros" style={{ ...sec, padding: '50px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
          {NUMEROS.map(x => (
            <div key={x.l} data-rv style={{ ...rv, textAlign: 'center', background: CARD, border: '1px solid #ffffff10', borderRadius: 18, padding: '26px 14px' }}>
              <Counter n={x.n} s={x.s} /><div style={{ color: MUT, fontSize: 13.5, marginTop: 4 }}>{x.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG marquee */}
      <section id="blog" style={{ padding: '14px 0 26px', borderTop: '1px solid #ffffff0a', borderBottom: '1px solid #ffffff0a', overflow: 'hidden' }}>
        <div style={{ ...sec, marginBottom: 14 }}><span style={{ color: MUT, fontSize: 13, fontWeight: 700, letterSpacing: '.1em' }}>📚 NO BLOG</span></div>
        <div className="mqrow">{[...Array(2)].flatMap(() => BLOG).map((b, i) => <span key={i} style={{ fontWeight: 800, fontSize: 18, color: MUT, opacity: .8 }}>{b} <span style={{ color: TEAL }}>•</span></span>)}</div>
      </section>

      {/* CONTATO / DIAGNÓSTICO */}
      <section id="contato" style={{ ...sec, padding: '56px 22px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 28, alignItems: 'center' }}>
          <div data-rv style={rv}>
            <h2 style={h2}>Solicite seu <span style={{ color: TEAL }}>diagnóstico</span> gratuito ☕</h2>
            <p style={{ color: MUT, fontSize: 16, margin: '14px 0 20px', lineHeight: 1.5 }}>Conte seu objetivo — nosso time analisa e monta a estratégia ideal pra sua empresa vender mais.</p>
            <a href={zap('Olá! Quero meu diagnóstico gratuito da Alcance+.')} target="_blank" rel="noreferrer" className="btnp" style={btnW}>📲 Chamar no WhatsApp</a>
          </div>
          <form onSubmit={enviarContato} data-rv style={{ ...rv, background: CARD, border: '1px solid #ffffff12', borderRadius: 20, padding: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={cNome} onChange={e => setCNome(e.target.value)} placeholder="Seu nome" required style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #ffffff22', background: '#0a0b10', color: '#fff', fontSize: 14 }} />
            <input value={cContato} onChange={e => setCContato(e.target.value)} placeholder="Seu WhatsApp ou e-mail" required style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #ffffff22', background: '#0a0b10', color: '#fff', fontSize: 14 }} />
            <textarea value={cMsg} onChange={e => setCMsg(e.target.value)} placeholder="Sobre seu negócio / objetivo" rows={3} required style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #ffffff22', background: '#0a0b10', color: '#fff', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }} />
            <button type="submit" className="btnp" style={btnP}>Solicitar diagnóstico →</button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #ffffff10', padding: '34px 22px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Logo s={40} /></div>
        <div style={{ color: MUT, fontSize: 13, fontWeight: 600 }}>Marketing • Tecnologia • CRM • Performance • Criatividade</div>
        <div style={{ fontSize: 18, fontWeight: 800, margin: '14px 0 6px', background: 'linear-gradient(90deg,#00C4B4,#7C3AED,#EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>"Transformamos ideias em resultados."</div>
        <div style={{ color: MUT, fontSize: 11.5, marginTop: 10 }}>© {new Date().getFullYear()} Alcance Mais 7 · Projetos: Rádio · Paiva Connect</div>
      </footer>

      {/* WHATSAPP FLUTUANTE */}
      <a href={zap('Olá! Vim pelo site da Alcance+ e quero saber mais.')} target="_blank" rel="noreferrer" aria-label="WhatsApp" style={{ position: 'fixed', bottom: 22, right: 22, width: 58, height: 58, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 22px rgba(37,211,102,.5)', zIndex: 90 }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.043zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>

      {/* MODAL LOGIN */}
      {showLogin && (
        <div onClick={() => setShowLogin(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: CARD, border: '1px solid #ffffff1a', borderRadius: 18, padding: 30, width: 380, maxWidth: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}><div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Logo s={48} /></div><div style={{ fontSize: 13, color: MUT, marginTop: 8 }}>Acesso ao sistema de gestão</div></div>
            <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ fontSize: 12, color: MUT, display: 'block', marginBottom: 5 }}>E-mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required autoFocus style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 9, border: '1px solid #ffffff22', background: '#0a0b10', color: '#fff', fontSize: 14 }} /></div>
              <div><label style={{ fontSize: 12, color: MUT, display: 'block', marginBottom: 5 }}>Senha</label><input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 9, border: '1px solid #ffffff22', background: '#0a0b10', color: '#fff', fontSize: 14 }} /></div>
              {erro && <div style={{ fontSize: 12, color: '#fca5a5', padding: '8px 12px', background: 'rgba(239,68,68,.12)', borderRadius: 8 }}>{erro}</div>}
              <button type="submit" disabled={loading} className="btnp" style={{ ...btnP, width: '100%', marginTop: 4, opacity: loading ? .7 : 1 }}>{loading ? 'Entrando…' : 'Entrar'}</button>
            </form>
            <button onClick={() => setShowLogin(false)} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: MUT, fontSize: 12, cursor: 'pointer' }}>Voltar ao site</button>
          </div>
        </div>
      )}
    </div>
  )
}
