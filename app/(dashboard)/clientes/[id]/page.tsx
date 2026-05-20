'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { clientesIniciais, type ClienteCompleto, type Demanda } from '@/lib/types/cliente'

const statusColor: Record<string, string> = {
  Ativo: 'badge-ok', Onboarding: 'badge-al', Pausado: 'badge-wr', Inativo: 'badge-er',
}
const prioColor: Record<string, string> = {
  '🔴 Urgente': '#EF4444', '🟠 Alta': '#F97316', '🟡 Média': '#EAB308', '🟢 Baixa': '#22C55E',
}
const demandaStatusColor: Record<string, string> = {
  'Aberta': 'badge-gr', 'Em execução': 'badge-al', 'Validação': 'badge-bl', 'Entregue': 'badge-ok',
}

function Field({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: 'var(--gr3)', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--gr1)', fontFamily: typeof value === 'string' && value.startsWith('http') ? 'var(--mono)' : undefined }}>{value}</div>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: color || 'var(--al)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${color || 'var(--al)'}22` }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>{children}</div>
    </div>
  )
}

export default function ClientePerfilPage() {
  const params = useParams()
  const router = useRouter()
  const [clientes, setClientes] = useState<ClienteCompleto[]>(clientesIniciais)
  const [tab, setTab] = useState('overview')
  const [novaDemanda, setNovaDemanda] = useState(false)
  const [demForm, setDemForm] = useState<Omit<Demanda,'id'>>({ titulo: '', prioridade: '🟡 Média', responsavel: '', prazo: '', status: 'Aberta' })

  const c = clientes.find(x => x.id === Number(params.id))
  if (!c) return (
    <div className="content" style={{ textAlign: 'center', paddingTop: 80 }}>
      <div style={{ fontSize: 14, color: 'var(--gr3)' }}>Cliente não encontrado.</div>
      <Link href="/clientes" className="btn btn-al" style={{ marginTop: 16, display: 'inline-flex' }}>← Voltar</Link>
    </div>
  )

  const clienteId = c?.id

  function addDemanda() {
    if (!demForm.titulo || !clienteId) return
    setClientes(cs => cs.map(x => x.id === clienteId ? {
      ...x, demandas: [...x.demandas, { ...demForm, id: Date.now() }]
    } : x))
    setDemForm({ titulo: '', prioridade: '🟡 Média', responsavel: '', prazo: '', status: 'Aberta' })
    setNovaDemanda(false)
  }

  function updateDemandaStatus(demId: number, status: Demanda['status']) {
    if (!clienteId) return
    setClientes(cs => cs.map(x => x.id === clienteId ? {
      ...x, demandas: x.demandas.map(d => d.id === demId ? { ...d, status } : d)
    } : x))
  }

  function removeDemanda(demId: number) {
    if (!clienteId) return
    setClientes(cs => cs.map(x => x.id === clienteId ? {
      ...x, demandas: x.demandas.filter(d => d.id !== demId)
    } : x))
  }

  const TABS = [
    { id: 'overview', label: '📊 Visão Geral' },
    { id: 'acessos', label: '🔑 Acessos' },
    { id: 'branding', label: '🎨 Branding' },
    { id: 'demandas', label: `📋 Demandas ${c.demandas.length > 0 ? `(${c.demandas.length})` : ''}` },
    { id: 'operacional', label: '⚙️ Operacional' },
    { id: 'estrutura', label: '📂 Estrutura' },
  ]

  return (
    <>
      {/* Header */}
      <div className="topbar" style={{ borderBottom: '1px solid var(--bk4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gr3)', fontSize: 18, padding: '0 4px' }}>←</button>
          <div className="av" style={{ width: 40, height: 40, fontSize: 16 }}>{c.nome.charAt(0)}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--wh)' }}>{c.nomeFantasia || c.nome}</span>
              <span className={`badge ${statusColor[c.status]}`}>{c.status}</span>
              {c.segmento && <span className="badge badge-gr">{c.segmento}</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--gr3)' }}>{c.responsavel} · {c.cidade} · desde {c.desde}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--al)', fontFamily: 'var(--mono)' }}>R$ {c.mensalidade.toLocaleString('pt-BR')}</div>
            <div style={{ fontSize: 10, color: 'var(--gr3)' }}>mensalidade</div>
          </div>
          <Link href="/clientes" className="btn btn-ghost btn-sm">Todos os clientes</Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, padding: '0 24px', borderBottom: '1px solid var(--bk4)', background: 'var(--bk2)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600,
            color: tab === t.id ? 'var(--al)' : 'var(--gr3)',
            borderBottom: tab === t.id ? '2px solid var(--al)' : '2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      <div className="content" style={{ maxWidth: 1100 }}>

        {/* ── Visão Geral ─────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* KPIs */}
            <div className="card" style={{ gridColumn: '1/-1' }}>
              <div className="sec-hd"><span style={{ fontWeight: 700 }}>KPIs do Cliente</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10 }}>
                {[
                  { label: 'ROAS', val: c.roas ? `${c.roas}x` : '—', color: '#22C55E' },
                  { label: 'Leads/mês', val: c.leads || '—', color: 'var(--al)' },
                  { label: 'CAC (R$)', val: c.cac ? `R$${c.cac}` : '—', color: 'var(--bl)' },
                  { label: 'Ticket Médio', val: c.ticketMedio ? `R$${c.ticketMedio}` : '—', color: 'var(--pk)' },
                  { label: 'Conversão', val: c.conversao ? `${c.conversao}%` : '—', color: '#8B5CF6' },
                  { label: 'Alcance', val: c.alcance ? c.alcance.toLocaleString('pt-BR') : '—', color: 'var(--gr2)' },
                  { label: 'Engajamento', val: c.engajamento ? `${c.engajamento}%` : '—', color: '#F59E0B' },
                ].map(k => (
                  <div key={k.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bk3)', borderRadius: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: k.color, fontFamily: 'var(--mono)' }}>{k.val}</div>
                    <div style={{ fontSize: 9, color: 'var(--gr3)', marginTop: 4 }}>{k.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Identificação */}
            <div className="card">
              <div className="sec-hd"><span style={{ fontWeight: 700 }}>Identificação</span></div>
              <Field label="Nome da empresa" value={c.nome} />
              <Field label="CNPJ" value={c.cnpj} />
              <Field label="Responsável" value={c.responsavel} />
              <Field label="WhatsApp" value={c.whatsapp} />
              <Field label="E-mail" value={c.email} />
              <Field label="E-mail financeiro" value={c.emailFinanceiro} />
              <Field label="Endereço" value={c.cidade} />
              <Field label="Concorrentes" value={c.concorrentes} />
              <Field label="Instagram" value={c.instagram} />
            </div>

            {/* Objetivos */}
            <div className="card">
              <div className="sec-hd"><span style={{ fontWeight: 700 }}>Objetivos & Metas</span></div>
              {c.objetivos.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: 'var(--gr3)', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 6 }}>Objetivos</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {c.objetivos.map(o => <span key={o} className="badge badge-al">{o}</span>)}
                  </div>
                </div>
              )}
              <Field label="Meta curto prazo" value={c.metaCurto} />
              <Field label="Meta médio prazo" value={c.metaMedio} />
              <Field label="Meta longo prazo" value={c.metaLongo} />

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 10, color: 'var(--gr3)', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 6 }}>Serviços contratados</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {c.servicos.map(s => <span key={s} className="badge badge-al">{s}</span>)}
                </div>
              </div>

              {c.notas && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--bk3)', borderRadius: 8, borderLeft: '3px solid var(--al)' }}>
                  <div style={{ fontSize: 10, color: 'var(--al)', fontWeight: 700, marginBottom: 4 }}>NOTAS INTERNAS</div>
                  <div style={{ fontSize: 11, color: 'var(--gr2)', lineHeight: 1.6 }}>{c.notas}</div>
                </div>
              )}
            </div>

            {/* Demandas abertas */}
            {c.demandas.filter(d => d.status !== 'Entregue').length > 0 && (
              <div className="card" style={{ gridColumn: '1/-1' }}>
                <div className="sec-hd">
                  <span style={{ fontWeight: 700 }}>Demandas em aberto</span>
                  <button className="btn btn-al btn-sm" onClick={() => setTab('demandas')}>Ver todas →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {c.demandas.filter(d => d.status !== 'Entregue').map(d => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bk3)', borderRadius: 8, borderLeft: `3px solid ${prioColor[d.prioridade]}` }}>
                      <span style={{ fontSize: 13 }}>{d.prioridade.split(' ')[0]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: 'var(--wh)', fontWeight: 600 }}>{d.titulo}</div>
                        <div style={{ fontSize: 10, color: 'var(--gr3)' }}>{d.responsavel} · prazo: {d.prazo}</div>
                      </div>
                      <span className={`badge ${demandaStatusColor[d.status]}`}>{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Acessos ─────────────────────────────────────────────── */}
        {tab === 'acessos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <Section title="Google" color="#4285F4">
                <Field label="Google Ads — E-mail" value={c.googleAdsEmail} />
                <Field label="Google Ads — ID da conta" value={c.googleAdsId} />
                <Field label="Google Meu Negócio" value={c.googleMNLogin} />
                <Field label="Google Analytics" value={c.googleAnalytics} />
                <div style={{ gridColumn: '1/-1' }}><Field label="Google Drive — pasta" value={c.googleDrive} /></div>
              </Section>
            </div>
            <div className="card">
              <Section title="Meta (Facebook / Instagram)" color="#1877F2">
                <Field label="Business Manager" value={c.metaBM} />
                <Field label="Página Facebook" value={c.metaPagina} />
                <Field label="Instagram" value={c.metaInstagram} />
                <Field label="Conta de anúncio" value={c.metaConta} />
                <Field label="Pixel ID" value={c.metaPixel} />
                <Field label="Domínio verificado" value={c.metaDominio} />
              </Section>
            </div>
            <div className="card">
              <Section title="Site" color="var(--gr3)">
                <Field label="Plataforma" value={c.sitePlataforma} />
                <Field label="Hospedagem" value={c.siteHospedagem} />
                <Field label="Domínio" value={c.siteDominio} />
                <Field label="Login" value={c.siteLogin} />
              </Section>
            </div>
            <div className="card">
              <Section title="Delivery" color="#E8002D">
                <Field label="iFood" value={c.ifood} />
                <Field label="Rappi" value={c.rappi} />
                <Field label="Aiqfome" value={c.aiqfome} />
                <Field label="Site delivery" value={c.siteDelivery} />
              </Section>
              <Section title="CRM / Atendimento" color="#25D366">
                <Field label="WhatsApp Business" value={c.whatsappBusiness} />
                <Field label="CRM" value={c.crm} />
                <Field label="Chatbot" value={c.chatbot} />
              </Section>
            </div>
          </div>
        )}

        {/* ── Branding ────────────────────────────────────────────── */}
        {tab === 'branding' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <div className="sec-hd"><span style={{ fontWeight: 700 }}>Identidade Visual</span></div>
              <Field label="Estilo visual" value={c.estiloVisual} />
              <Field label="Tom de voz" value={c.tomDeVoz} />
              <Field label="Tipografia" value={c.tipografia} />
              {c.paletaCores && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--gr3)', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 6 }}>Paleta de cores</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {c.paletaCores.split(',').map(cor => (
                      <div key={cor} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 4, background: cor.trim(), border: '1px solid var(--bk4)' }} />
                        <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--gr3)' }}>{cor.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="card">
              <div className="sec-hd"><span style={{ fontWeight: 700 }}>Referências Visuais</span></div>
              <Field label="Instagram referência" value={c.refInstagram} />
              <Field label="Pinterest" value={c.refPinterest} />
              <Field label="Behance" value={c.refBehance} />

              <div style={{ marginTop: 20, padding: 14, background: 'var(--bk3)', borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--al)', marginBottom: 12 }}>PASTA BRANDING — ARQUIVOS OBRIGATÓRIOS</div>
                {['Logo PNG','Logo Vetor','Logo branca','Logo preta','Manual da marca','Tipografia','Paleta de cores','Elementos gráficos','Fotos institucionais','Vídeos institucionais'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 11, color: 'var(--gr3)' }}>
                    <span style={{ color: 'var(--gr3)', fontSize: 10 }}>☐</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Demandas ────────────────────────────────────────────── */}
        {tab === 'demandas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="sec-hd">
                <span style={{ fontWeight: 700 }}>Demandas — Fluxo Operacional</span>
                <button className="btn btn-al btn-sm" onClick={() => setNovaDemanda(true)}>+ Nova demanda</button>
              </div>

              {/* Fluxo visual */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, padding: '10px 14px', background: 'var(--bk3)', borderRadius: 8, fontSize: 10, color: 'var(--gr3)' }}>
                {['SOLICITAÇÃO','ALCANCE CORE','SETOR','EXECUÇÃO','VALIDAÇÃO','ENTREGA'].map((step, i) => (
                  <>
                    <span key={step} style={{ padding: '3px 8px', background: 'var(--bk4)', borderRadius: 4, fontWeight: 700, color: 'var(--gr2)' }}>{step}</span>
                    {i < 5 && <span key={`a${i}`} style={{ color: 'var(--al)' }}>→</span>}
                  </>
                ))}
              </div>

              {/* Quadro kanban de demandas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {(['Aberta','Em execução','Validação','Entregue'] as Demanda['status'][]).map(col => (
                  <div key={col}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gr3)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                      {col} ({c.demandas.filter(d => d.status === col).length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {c.demandas.filter(d => d.status === col).map(d => (
                        <div key={d.id} style={{ padding: '10px 12px', background: 'var(--bk3)', borderRadius: 8, borderLeft: `3px solid ${prioColor[d.prioridade]}` }}>
                          <div style={{ fontSize: 11, color: 'var(--wh)', fontWeight: 600, marginBottom: 6 }}>{d.titulo}</div>
                          <div style={{ fontSize: 10, color: 'var(--gr3)', marginBottom: 8 }}>
                            <div>{d.prioridade}</div>
                            <div>Resp: {d.responsavel}</div>
                            {d.prazo && <div>Prazo: {d.prazo}</div>}
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {(['Aberta','Em execução','Validação','Entregue'] as Demanda['status'][]).filter(s => s !== col).map(s => (
                              <button key={s} onClick={() => updateDemandaStatus(d.id, s)} style={{ padding: '2px 6px', background: 'var(--bk4)', border: 'none', borderRadius: 4, fontSize: 9, color: 'var(--gr3)', cursor: 'pointer' }}>→ {s}</button>
                            ))}
                            <button onClick={() => removeDemanda(d.id)} style={{ padding: '2px 6px', background: 'none', border: 'none', color: 'var(--er)', cursor: 'pointer', fontSize: 9, marginLeft: 'auto' }}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Operacional ─────────────────────────────────────────── */}
        {tab === 'operacional' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <div className="sec-hd"><span style={{ fontWeight: 700 }}>Social Media</span></div>
              <div style={{ fontSize: 11, color: 'var(--gr3)', marginBottom: 16 }}>Planejamento mensal e padrão de conteúdo</div>
              {[
                ['Tom de voz', c.tomDeVoz],
                ['Persona', c.segmento],
                ['Instagram', c.metaInstagram || c.instagram],
              ].map(([l, v]) => v ? <Field key={l} label={l} value={v} /> : null)}
              <div style={{ marginTop: 14, padding: 12, background: 'var(--bk3)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--al)', marginBottom: 8 }}>CHECKLIST SOCIAL MEDIA</div>
                {['Calendário editorial mensal','Datas sazonais mapeadas','5 Reels planejados','Stories diários','Hashtags definidas','CTA em todos os posts'].map(item => (
                  <div key={item} style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--gr3)', marginBottom: 5 }}>
                    <span>☐</span>{item}
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="sec-hd"><span style={{ fontWeight: 700 }}>Tráfego Pago</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'ROAS', val: c.roas ? `${c.roas}x` : '—', color: '#22C55E' },
                  { label: 'CAC', val: c.cac ? `R$${c.cac}` : '—', color: 'var(--al)' },
                  { label: 'Leads', val: c.leads || '—', color: 'var(--bl)' },
                  { label: 'Conversão', val: c.conversao ? `${c.conversao}%` : '—', color: '#8B5CF6' },
                ].map(k => (
                  <div key={k.label} style={{ padding: 10, background: 'var(--bk3)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: k.color }}>{k.val}</div>
                    <div style={{ fontSize: 9, color: 'var(--gr3)' }}>{k.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 12, background: 'var(--bk3)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--al)', marginBottom: 8 }}>CHECKLIST TRÁFEGO</div>
                {['Campanhas ativas configuradas','Pixel instalado','Públicos personalizados criados','Remarketing ativo','Relatório semanal configurado','Escala planejada'].map(item => (
                  <div key={item} style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--gr3)', marginBottom: 5 }}>
                    <span>☐</span>{item}
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ gridColumn: '1/-1' }}>
              <div className="sec-hd"><span style={{ fontWeight: 700 }}>Checklist de Onboarding</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {[
                  { title: '🎨 Branding', items: ['Logo recebida','Cores definidas','Fontes definidas','Fotos recebidas'] },
                  { title: '🔑 Acessos', items: ['Google Ads','Meta Business','Site/Admin','Google Drive'] },
                  { title: '💼 Comercial', items: ['Objetivos alinhados','Público definido','Concorrentes mapeados','Oferta definida'] },
                  { title: '⚙️ Operacional', items: ['Pasta criada no Drive','Dashboard configurado','Automações ativas','Cliente integrado'] },
                ].map(grupo => (
                  <div key={grupo.title}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--al)', marginBottom: 8 }}>{grupo.title}</div>
                    {grupo.items.map(item => (
                      <div key={item} style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--gr3)', marginBottom: 6 }}>
                        <span>☐</span>{item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Estrutura de Pastas ──────────────────────────────────── */}
        {tab === 'estrutura' && (
          <div className="card">
            <div className="sec-hd"><span style={{ fontWeight: 700 }}>Estrutura de Pastas — {c.nomeFantasia || c.nome}</span></div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 2, color: 'var(--gr2)', background: 'var(--bk3)', borderRadius: 10, padding: 20 }}>
              <div style={{ color: 'var(--al)', fontWeight: 700 }}>CLIENTES/</div>
              <div style={{ paddingLeft: 16, color: 'var(--wh)' }}>└── {(c.nomeFantasia || c.nome).toUpperCase()}/</div>
              {[
                ['01_BRANDING', 'Logo, cores, fontes, fotos, vídeos institucionais'],
                ['02_ACESSOS', 'Google, Meta, Site, e-mails, credenciais'],
                ['03_CONTRATOS', 'Contrato assinado, proposta, termos'],
                ['04_FINANCEIRO', 'NFs, pagamentos, relatórios financeiros'],
                ['05_TRÁFEGO', 'Campanhas, criativos, públicos, relatórios'],
                ['06_SOCIAL_MEDIA', 'Calendário, posts aprovados, stories'],
                ['07_DESIGN', 'Artes, banners, cards, apresentações'],
                ['08_VÍDEOS', 'Reels, anúncios em vídeo, shorts'],
                ['09_RELATÓRIOS', 'Relatórios semanais, mensais, trimestrais'],
                ['10_PLANEJAMENTO', 'Briefings, estratégias, planejamentos'],
                ['11_CAMPANHAS', 'Campanhas específicas por data/evento'],
                ['12_MATERIAIS', 'Materiais recebidos do cliente'],
                ['13_BACKUP', 'Backup geral e versões anteriores'],
              ].map(([pasta, desc]) => (
                <div key={pasta} style={{ paddingLeft: 32 }}>
                  <span style={{ color: '#60A5FA' }}>├── {pasta}</span>
                  <span style={{ color: 'var(--gr3)', fontSize: 10, paddingLeft: 12 }}>· {desc}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 14, background: 'var(--bk3)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--al)', marginBottom: 10 }}>FERRAMENTAS RECOMENDADAS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[
                  { cat: 'Gestão', tools: ['Notion','ClickUp','Airtable'] },
                  { cat: 'Automação', tools: ['n8n','Make (Integromat)'] },
                  { cat: 'WhatsApp', tools: ['Evolution API','WPPConnect'] },
                  { cat: 'Armazenamento', tools: ['Google Drive','Dropbox'] },
                ].map(g => (
                  <div key={g.cat}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', marginBottom: 6 }}>{g.cat}</div>
                    {g.tools.map(t => <div key={t} style={{ fontSize: 11, color: 'var(--gr2)', marginBottom: 4 }}>• {t}</div>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal nova demanda */}
      {novaDemanda && (
        <div className="modal-overlay" onClick={() => setNovaDemanda(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Nova Demanda — {c.nomeFantasia || c.nome}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field"><label>Título da demanda</label><input className="inp" value={demForm.titulo} placeholder="Ex: Criar campanha de São João" onChange={e => setDemForm({...demForm, titulo: e.target.value})} /></div>
              <div className="modal-grid">
                <div className="field"><label>Prioridade</label>
                  <select className="inp" value={demForm.prioridade} onChange={e => setDemForm({...demForm, prioridade: e.target.value as Demanda['prioridade']})}>
                    {['🔴 Urgente','🟠 Alta','🟡 Média','🟢 Baixa'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="field"><label>Responsável</label>
                  <select className="inp" value={demForm.responsavel} onChange={e => setDemForm({...demForm, responsavel: e.target.value})}>
                    <option value="">Selecionar...</option>
                    {['FIGUEIREDO','Tráfego','Social Media','Designer','Video Editor','Comercial','Financeiro'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field"><label>Prazo</label><input className="inp" type="date" value={demForm.prazo} onChange={e => setDemForm({...demForm, prazo: e.target.value})} /></div>
                <div className="field"><label>Status inicial</label>
                  <select className="inp" value={demForm.status} onChange={e => setDemForm({...demForm, status: e.target.value as Demanda['status']})}>
                    {['Aberta','Em execução','Validação','Entregue'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setNovaDemanda(false)}>Cancelar</button>
              <button className="btn btn-al" onClick={addDemanda}>Criar demanda</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
