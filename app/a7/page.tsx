'use client'
import Link from 'next/link'
import { useA7, fmtDataHora, brl } from '@/lib/a7-client'
import { Badge, Cabecalho, REDE_ICO } from './ui'

export default function Inicio() {
  const posts = useA7('posts').dados
  const camps = useA7('campanhas').dados
  const chamados = useA7('chamados').dados
  const coms = useA7('comunicados').dados
  const planos = useA7('planos').dados

  const agora = Date.now()
  const aprovar = posts.filter(p => p.status === 'aguardando_aprovacao')
  const proximos = posts.filter(p => p.data_publicacao && new Date(p.data_publicacao).getTime() >= agora && p.status !== 'publicado').slice(0, 5)
  const ativas = camps.filter(c => c.status === 'ativa')
  const investido = camps.reduce((s, c) => s + Number(c.gasto || 0), 0)
  const leads = camps.reduce((s, c) => s + Number(c.conversoes || 0), 0)
  const abertos = chamados.filter(c => c.status !== 'resolvido')
  const aguardandoVoce = chamados.filter(c => c.status === 'aguardando_cliente')

  return (
    <div className="a7-page">
      <Cabecalho titulo="Visão geral" sub="Tudo o que a Alcance+ está fazendo pela sua marca, em um só lugar." />

      {aprovar.length > 0 && (
        <div className="a7-warn">
          ⏳ Você tem <b>{aprovar.length}</b> {aprovar.length === 1 ? 'post aguardando' : 'posts aguardando'} sua aprovação. <Link href="/a7/cronograma" style={{ textDecoration: 'underline', fontWeight: 700 }}>Revisar agora</Link>
        </div>
      )}
      {aguardandoVoce.length > 0 && (
        <div className="a7-warn">💬 {aguardandoVoce.length} chamado(s) aguardando sua resposta. <Link href="/a7/chamados" style={{ textDecoration: 'underline', fontWeight: 700 }}>Responder</Link></div>
      )}

      <div className="a7-grid a7-g4" style={{ marginBottom: 18 }}>
        <div className="a7-card a7-kpi"><div className="n">{proximos.length}</div><div className="l">Próximas publicações</div></div>
        <div className="a7-card a7-kpi"><div className="n">{ativas.length}</div><div className="l">Campanhas ativas</div></div>
        <div className="a7-card a7-kpi"><div className="n">{brl(investido)}</div><div className="l">Investido em tráfego</div></div>
        <div className="a7-card a7-kpi"><div className="n">{leads}</div><div className="l">Conversões / leads</div></div>
        <div className="a7-card a7-kpi"><div className="n">{abertos.length}</div><div className="l">Chamados em aberto</div></div>
      </div>

      <div className="a7-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>
        <div className="a7-card">
          <b>📅 Próximas publicações</b>
          {proximos.length === 0 && <div className="a7-empty">Nenhuma publicação agendada.</div>}
          {proximos.map(p => (
            <div key={p.id} className="a7-row" style={{ justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--bd)' }}>
              <div><div style={{ fontWeight: 600 }}>{REDE_ICO[p.rede] ?? '🌐'} {p.titulo}</div>
                <small style={{ color: 'var(--mut)' }}>{fmtDataHora(p.data_publicacao)} · {p.formato}</small></div>
              <Badge s={p.status} />
            </div>
          ))}
        </div>
        <div className="a7-card">
          <b>📣 Comunicados</b>
          {coms.length === 0 && <div className="a7-empty">Sem comunicados.</div>}
          {coms.slice(0, 4).map(c => (
            <div key={c.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ fontWeight: 600 }}>{c.titulo}</div>
              <small style={{ color: 'var(--mut)' }}>{c.corpo?.slice(0, 110)}{c.corpo?.length > 110 ? '…' : ''}</small>
            </div>
          ))}
        </div>
        <div className="a7-card">
          <b>🧭 Planejamento vigente</b>
          {planos.filter(p => p.status === 'vigente').length === 0 && <div className="a7-empty">Nenhum plano vigente.</div>}
          {planos.filter(p => p.status === 'vigente').slice(0, 4).map(p => (
            <Link key={p.id} href="/a7/estrategia" style={{ display: 'block', padding: '9px 0', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ fontWeight: 600 }}>{p.titulo}</div>
              <small style={{ color: 'var(--mut)' }}>{p.tipo} {p.periodo && `· ${p.periodo}`}</small>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
