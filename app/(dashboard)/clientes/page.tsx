'use client'
import { useState } from 'react'
import Link from 'next/link'
import { clientesIniciais, clienteVazio, type ClienteCompleto } from '@/lib/types/cliente'

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const num = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${num}`
}

const statusColor: Record<string, string> = {
  Ativo: 'badge-ok', Onboarding: 'badge-al', Pausado: 'badge-wr', Inativo: 'badge-er',
}

const SEGMENTOS = ['Tecnologia','Saúde','Construção','Food','Fitness','Imóveis','Educação','Varejo','Beleza','Jurídico','Outro']
const SERVICOS_LIST = ['Tráfego Pago','Redes Sociais','SEO','Google Meu Negócio','Criação de Conteúdo','Fotografia','Vídeo','iFood','Branding','Landing Pages','Email Marketing','CRM']

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteCompleto[]>(clientesIniciais)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Omit<ClienteCompleto,'id'>>(clienteVazio)
  const [editing, setEditing] = useState<number|null>(null)
  const [activeTab, setActiveTab] = useState('identificacao')

  const filtered = clientes.filter(c => {
    const q = search.toLowerCase()
    const matchQ = c.nome.toLowerCase().includes(q) || c.responsavel.toLowerCase().includes(q) || c.segmento.toLowerCase().includes(q)
    const matchF = filter === 'Todos' || c.status === filter
    return matchQ && matchF
  })

  function save() {
    if (!form.nome) return
    if (editing !== null) {
      setClientes(cs => cs.map(c => c.id === editing ? { ...form, id: editing } : c))
    } else {
      setClientes(cs => [...cs, { ...form, id: Date.now() }])
    }
    setModal(false); setForm(clienteVazio); setEditing(null); setActiveTab('identificacao')
  }

  function openNew() {
    setForm(clienteVazio); setEditing(null); setActiveTab('identificacao'); setModal(true)
  }

  function openEdit(c: ClienteCompleto) {
    const { id, ...rest } = c; setForm(rest); setEditing(id); setActiveTab('identificacao'); setModal(true)
  }

  function remove(id: number) {
    if (confirm('Remover este cliente?')) setClientes(cs => cs.filter(c => c.id !== id))
  }

  function toggleServico(s: string) {
    setForm(f => ({
      ...f,
      servicos: f.servicos.includes(s) ? f.servicos.filter(x => x !== s) : [...f.servicos, s],
    }))
  }

  function toggleObjetivo(o: string) {
    setForm(f => ({
      ...f,
      objetivos: f.objetivos.includes(o) ? f.objetivos.filter(x => x !== o) : [...f.objetivos, o],
    }))
  }

  const ativos = clientes.filter(c => c.status === 'Ativo')
  const mrr = ativos.reduce((s, c) => s + c.mensalidade, 0)
  const onboarding = clientes.filter(c => c.status === 'Onboarding').length
  const pausados = clientes.filter(c => c.status === 'Pausado').length

  const MODAL_TABS = [
    { id: 'identificacao', label: '📋 Identificação' },
    { id: 'objetivos', label: '🎯 Objetivos' },
    { id: 'branding', label: '🎨 Branding' },
    { id: 'acessos', label: '🔑 Acessos' },
    { id: 'operacional', label: '⚙️ Operacional' },
  ]

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Clientes</span>
          <span className="tb-sub">{clientes.length} cadastrados · Template Master Alcance</span>
        </div>
        <button className="btn btn-al" onClick={openNew}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Cliente
        </button>
      </div>

      <div className="content">
        {/* KPIs */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
          {[
            { label: 'Total Clientes', val: clientes.length, color: 'var(--bl)' },
            { label: 'Ativos', val: ativos.length, color: 'var(--ok)' },
            { label: 'Onboarding', val: onboarding, color: 'var(--al)' },
            { label: 'Pausados', val: pausados, color: 'var(--wr)' },
            { label: 'MRR', val: `R$ ${mrr.toLocaleString('pt-BR')}`, color: 'var(--al)' },
          ].map(k => (
            <div key={k.label} className="kpi">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val" style={{ fontSize: 22, color: k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="sec-hd">
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="inp" placeholder="Buscar por nome, contato ou setor..." style={{ width: 260 }} value={search} onChange={e => setSearch(e.target.value)} />
              <select className="inp" style={{ width: 140 }} value={filter} onChange={e => setFilter(e.target.value)}>
                {['Todos','Ativo','Onboarding','Pausado','Inativo'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gr3)' }}>{filtered.length} resultado(s)</div>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Segmento</th>
                <th>Serviços</th>
                <th>Mensalidade</th>
                <th>KPIs</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="av">{c.nome.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--wh)' }}>{c.nomeFantasia || c.nome}</div>
                        <div style={{ fontSize: 9.5, color: 'var(--gr3)' }}>{c.cidade} · desde {c.desde}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 11 }}>{c.responsavel}</div>
                    {(c.whatsapp || c.telefone) ? (
                      <a
                        href={waLink(c.whatsapp || c.telefone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 9.5, color: '#25D366', textDecoration: 'none' }}
                        title="Abrir no WhatsApp"
                      >
                        {c.whatsapp || c.telefone}
                      </a>
                    ) : (
                      <div style={{ fontSize: 9.5, color: 'var(--gr3)' }}>—</div>
                    )}
                  </td>
                  <td><span className="badge badge-gr">{c.segmento}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200 }}>
                      {c.servicos.slice(0,3).map(s => <span key={s} className="badge badge-al" style={{ fontSize: 9 }}>{s}</span>)}
                      {c.servicos.length > 3 && <span className="badge badge-gr" style={{ fontSize: 9 }}>+{c.servicos.length-3}</span>}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--al)', fontWeight: 700 }}>
                    R$ {c.mensalidade.toLocaleString('pt-BR')}
                  </td>
                  <td>
                    <div style={{ fontSize: 10, color: 'var(--gr3)', lineHeight: 1.8 }}>
                      {c.roas > 0 && <div>ROAS <span style={{ color: 'var(--ok)' }}>{c.roas}x</span></div>}
                      {c.leads > 0 && <div>Leads <span style={{ color: 'var(--wh)' }}>{c.leads}</span></div>}
                    </div>
                  </td>
                  <td><span className={`badge ${statusColor[c.status]}`}>{c.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Link href={`/clientes/${c.id}`} className="btn btn-ghost btn-sm">Perfil</Link>
                      {(c.whatsapp || c.telefone) && (
                        <a
                          href={waLink(c.whatsapp || c.telefone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                          style={{ background: '#25D36618', borderColor: '#25D36644', color: '#25D366', textDecoration: 'none' }}
                          title="WhatsApp"
                        >
                          WPP
                        </a>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal novo/editar */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 720, width: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editing ? `Editar — ${form.nome}` : 'Novo Cliente · Template Master'}</div>

            {/* Tabs do modal */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--bk4)', paddingBottom: 12 }}>
              {MODAL_TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  background: activeTab === t.id ? 'var(--al)' : 'var(--bk4)',
                  color: activeTab === t.id ? '#000' : 'var(--gr3)',
                }}>{t.label}</button>
              ))}
            </div>

            {/* Tab: Identificação */}
            {activeTab === 'identificacao' && (
              <div className="modal-grid">
                <div className="field"><label>Nome da empresa</label><input className="inp" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} /></div>
                <div className="field"><label>Nome fantasia</label><input className="inp" value={form.nomeFantasia} onChange={e => setForm({...form, nomeFantasia: e.target.value})} /></div>
                <div className="field"><label>Responsável principal</label><input className="inp" value={form.responsavel} onChange={e => setForm({...form, responsavel: e.target.value})} /></div>
                <div className="field"><label>WhatsApp</label><input className="inp" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} /></div>
                <div className="field"><label>E-mail principal</label><input className="inp" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="field"><label>E-mail financeiro</label><input className="inp" type="email" value={form.emailFinanceiro} onChange={e => setForm({...form, emailFinanceiro: e.target.value})} /></div>
                <div className="field"><label>Cidade/Estado</label><input className="inp" value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})} /></div>
                <div className="field"><label>CNPJ</label><input className="inp" value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} /></div>
                <div className="field"><label>Segmento</label>
                  <select className="inp" value={form.segmento} onChange={e => setForm({...form, segmento: e.target.value})}>
                    <option value="">Selecionar...</option>
                    {SEGMENTOS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field"><label>Instagram</label><input className="inp" value={form.instagram} placeholder="@cliente" onChange={e => setForm({...form, instagram: e.target.value})} /></div>
                <div className="field"><label>Status</label>
                  <select className="inp" value={form.status} onChange={e => setForm({...form, status: e.target.value as ClienteCompleto['status']})}>
                    {['Ativo','Onboarding','Pausado','Inativo'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field"><label>Mensalidade (R$)</label><input className="inp" type="number" value={form.mensalidade} onChange={e => setForm({...form, mensalidade: Number(e.target.value)})} /></div>
                <div className="field"><label>Cliente desde</label><input className="inp" type="month" value={form.desde} onChange={e => setForm({...form, desde: e.target.value})} /></div>
                <div className="field"><label>Concorrentes</label><input className="inp" value={form.concorrentes} onChange={e => setForm({...form, concorrentes: e.target.value})} /></div>
                <div className="field" style={{ gridColumn: '1/-1' }}>
                  <label>Serviços contratados</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {SERVICOS_LIST.map(s => (
                      <button key={s} type="button" onClick={() => toggleServico(s)} style={{
                        padding: '4px 10px', borderRadius: 20, border: '1px solid',
                        fontSize: 11, cursor: 'pointer',
                        borderColor: form.servicos.includes(s) ? 'var(--al)' : 'var(--bk4)',
                        background: form.servicos.includes(s) ? 'var(--al)' : 'transparent',
                        color: form.servicos.includes(s) ? '#000' : 'var(--gr3)',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Objetivos */}
            {activeTab === 'objetivos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="field">
                  <label>Objetivos principais</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {['Vendas','Branding','Tráfego','Delivery','Leads','Escala','Autoridade','Conversão','Expansão'].map(o => (
                      <button key={o} type="button" onClick={() => toggleObjetivo(o)} style={{
                        padding: '5px 12px', borderRadius: 20, border: '1px solid', fontSize: 11, cursor: 'pointer',
                        borderColor: form.objetivos.includes(o) ? 'var(--al)' : 'var(--bk4)',
                        background: form.objetivos.includes(o) ? 'var(--al)' : 'transparent',
                        color: form.objetivos.includes(o) ? '#000' : 'var(--gr3)',
                      }}>{o}</button>
                    ))}
                  </div>
                </div>
                <div className="modal-grid">
                  <div className="field" style={{ gridColumn: '1/-1' }}><label>Meta curto prazo</label><input className="inp" value={form.metaCurto} placeholder="Ex: 200 leads/mês em 60 dias" onChange={e => setForm({...form, metaCurto: e.target.value})} /></div>
                  <div className="field" style={{ gridColumn: '1/-1' }}><label>Meta médio prazo</label><input className="inp" value={form.metaMedio} placeholder="Ex: Abrir segunda unidade em 6 meses" onChange={e => setForm({...form, metaMedio: e.target.value})} /></div>
                  <div className="field" style={{ gridColumn: '1/-1' }}><label>Meta longo prazo</label><input className="inp" value={form.metaLongo} placeholder="Ex: Franquear a marca em 2 anos" onChange={e => setForm({...form, metaLongo: e.target.value})} /></div>
                  <div className="field"><label>Leads/mês</label><input className="inp" type="number" value={form.leads} onChange={e => setForm({...form, leads: Number(e.target.value)})} /></div>
                  <div className="field"><label>ROAS atual</label><input className="inp" type="number" step="0.1" value={form.roas} onChange={e => setForm({...form, roas: Number(e.target.value)})} /></div>
                  <div className="field"><label>CAC (R$)</label><input className="inp" type="number" value={form.cac} onChange={e => setForm({...form, cac: Number(e.target.value)})} /></div>
                  <div className="field"><label>Ticket médio (R$)</label><input className="inp" type="number" value={form.ticketMedio} onChange={e => setForm({...form, ticketMedio: Number(e.target.value)})} /></div>
                </div>
              </div>
            )}

            {/* Tab: Branding */}
            {activeTab === 'branding' && (
              <div className="modal-grid">
                <div className="field"><label>Estilo visual</label>
                  <select className="inp" value={form.estiloVisual} onChange={e => setForm({...form, estiloVisual: e.target.value})}>
                    <option value="">Selecionar...</option>
                    {['Moderno','Minimalista','Premium','Popular','Luxuoso','Geek','Jovem','Corporativo'].map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div className="field"><label>Tom de voz</label><input className="inp" value={form.tomDeVoz} placeholder="Ex: Profissional e acolhedor" onChange={e => setForm({...form, tomDeVoz: e.target.value})} /></div>
                <div className="field"><label>Paleta de cores</label><input className="inp" value={form.paletaCores} placeholder="Ex: #0066FF, #FFFFFF, #1A1A1A" onChange={e => setForm({...form, paletaCores: e.target.value})} /></div>
                <div className="field"><label>Tipografia</label><input className="inp" value={form.tipografia} placeholder="Ex: Poppins, Montserrat" onChange={e => setForm({...form, tipografia: e.target.value})} /></div>
                <div className="field"><label>Ref. Instagram</label><input className="inp" value={form.refInstagram} placeholder="@perfil de referência" onChange={e => setForm({...form, refInstagram: e.target.value})} /></div>
                <div className="field"><label>Ref. Pinterest</label><input className="inp" value={form.refPinterest} placeholder="Link do board" onChange={e => setForm({...form, refPinterest: e.target.value})} /></div>
              </div>
            )}

            {/* Tab: Acessos */}
            {activeTab === 'acessos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--al)', letterSpacing: 1 }}>GOOGLE</div>
                <div className="modal-grid">
                  <div className="field"><label>Google Ads — E-mail</label><input className="inp" value={form.googleAdsEmail} onChange={e => setForm({...form, googleAdsEmail: e.target.value})} /></div>
                  <div className="field"><label>Google Ads — ID da conta</label><input className="inp" value={form.googleAdsId} placeholder="000-000-0000" onChange={e => setForm({...form, googleAdsId: e.target.value})} /></div>
                  <div className="field"><label>Google Meu Negócio</label><input className="inp" value={form.googleMNLogin} onChange={e => setForm({...form, googleMNLogin: e.target.value})} /></div>
                  <div className="field"><label>Google Analytics</label><input className="inp" value={form.googleAnalytics} onChange={e => setForm({...form, googleAnalytics: e.target.value})} /></div>
                  <div className="field" style={{ gridColumn: '1/-1' }}><label>Google Drive — pasta principal</label><input className="inp" value={form.googleDrive} placeholder="Link da pasta" onChange={e => setForm({...form, googleDrive: e.target.value})} /></div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1877F2', letterSpacing: 1 }}>META</div>
                <div className="modal-grid">
                  <div className="field"><label>Business Manager</label><input className="inp" value={form.metaBM} onChange={e => setForm({...form, metaBM: e.target.value})} /></div>
                  <div className="field"><label>Página Facebook</label><input className="inp" value={form.metaPagina} onChange={e => setForm({...form, metaPagina: e.target.value})} /></div>
                  <div className="field"><label>Instagram</label><input className="inp" value={form.metaInstagram} placeholder="@conta" onChange={e => setForm({...form, metaInstagram: e.target.value})} /></div>
                  <div className="field"><label>Conta de anúncio</label><input className="inp" value={form.metaConta} placeholder="act_000000" onChange={e => setForm({...form, metaConta: e.target.value})} /></div>
                  <div className="field"><label>Pixel ID</label><input className="inp" value={form.metaPixel} onChange={e => setForm({...form, metaPixel: e.target.value})} /></div>
                  <div className="field"><label>Domínio verificado</label><input className="inp" value={form.metaDominio} onChange={e => setForm({...form, metaDominio: e.target.value})} /></div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gr2)', letterSpacing: 1 }}>SITE</div>
                <div className="modal-grid">
                  <div className="field"><label>Plataforma</label><input className="inp" value={form.sitePlataforma} placeholder="WordPress, Shopify..." onChange={e => setForm({...form, sitePlataforma: e.target.value})} /></div>
                  <div className="field"><label>Hospedagem</label><input className="inp" value={form.siteHospedagem} onChange={e => setForm({...form, siteHospedagem: e.target.value})} /></div>
                  <div className="field"><label>Domínio</label><input className="inp" value={form.siteDominio} onChange={e => setForm({...form, siteDominio: e.target.value})} /></div>
                  <div className="field"><label>Login</label><input className="inp" value={form.siteLogin} onChange={e => setForm({...form, siteLogin: e.target.value})} /></div>
                </div>
              </div>
            )}

            {/* Tab: Operacional */}
            {activeTab === 'operacional' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#E8002D', letterSpacing: 1 }}>DELIVERY</div>
                <div className="modal-grid">
                  <div className="field"><label>iFood</label><input className="inp" value={form.ifood} onChange={e => setForm({...form, ifood: e.target.value})} /></div>
                  <div className="field"><label>Rappi</label><input className="inp" value={form.rappi} onChange={e => setForm({...form, rappi: e.target.value})} /></div>
                  <div className="field"><label>Aiqfome</label><input className="inp" value={form.aiqfome} onChange={e => setForm({...form, aiqfome: e.target.value})} /></div>
                  <div className="field"><label>Site próprio delivery</label><input className="inp" value={form.siteDelivery} onChange={e => setForm({...form, siteDelivery: e.target.value})} /></div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#25D366', letterSpacing: 1 }}>CRM / ATENDIMENTO</div>
                <div className="modal-grid">
                  <div className="field"><label>WhatsApp Business</label><input className="inp" value={form.whatsappBusiness} onChange={e => setForm({...form, whatsappBusiness: e.target.value})} /></div>
                  <div className="field"><label>CRM</label><input className="inp" value={form.crm} placeholder="HubSpot, RD Station..." onChange={e => setForm({...form, crm: e.target.value})} /></div>
                  <div className="field"><label>Chatbot</label><input className="inp" value={form.chatbot} placeholder="ManyChat, Typebot..." onChange={e => setForm({...form, chatbot: e.target.value})} /></div>
                </div>
                <div className="field">
                  <label>Notas internas</label>
                  <textarea className="inp" rows={4} value={form.notas} placeholder="Informações importantes, alertas, preferências do cliente..." onChange={e => setForm({...form, notas: e.target.value})} />
                </div>
              </div>
            )}

            <div className="modal-foot" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {MODAL_TABS.map((t, i) => i > 0 && (
                  <button key={t.id} type="button" className="btn btn-ghost" onClick={() => setActiveTab(MODAL_TABS[i-1].id)} style={{ fontSize: 11 }}>← {MODAL_TABS[i-1].label.split(' ')[1]}</button>
                )).filter(Boolean)[MODAL_TABS.findIndex(t => t.id === activeTab) - 1]}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                {MODAL_TABS.findIndex(t => t.id === activeTab) < MODAL_TABS.length - 1 ? (
                  <button className="btn btn-al" onClick={() => {
                    const idx = MODAL_TABS.findIndex(t => t.id === activeTab)
                    setActiveTab(MODAL_TABS[idx + 1].id)
                  }}>Próximo →</button>
                ) : (
                  <button className="btn btn-al" onClick={save}>Salvar Cliente</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
