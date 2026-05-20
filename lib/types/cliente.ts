export type Demanda = {
  id: number
  titulo: string
  prioridade: '🔴 Urgente' | '🟠 Alta' | '🟡 Média' | '🟢 Baixa'
  responsavel: string
  prazo: string
  status: 'Aberta' | 'Em execução' | 'Validação' | 'Entregue'
}

export type ClienteCompleto = {
  id: number

  // 1. Identificação
  nome: string
  nomeFantasia: string
  responsavel: string
  telefone: string
  whatsapp: string
  email: string
  emailFinanceiro: string
  endereco: string
  cidade: string
  cnpj: string
  segmento: string
  concorrentes: string
  instagram: string
  status: 'Ativo' | 'Onboarding' | 'Pausado' | 'Inativo'
  mensalidade: number
  desde: string
  servicos: string[]

  // 2. Objetivos
  objetivos: string[]
  metaCurto: string
  metaMedio: string
  metaLongo: string

  // 3. Branding
  estiloVisual: string
  refInstagram: string
  refPinterest: string
  refBehance: string
  paletaCores: string
  tipografia: string
  tomDeVoz: string

  // 4. Acessos
  googleAdsEmail: string
  googleAdsId: string
  googleMNLogin: string
  googleAnalytics: string
  googleDrive: string
  metaBM: string
  metaPagina: string
  metaInstagram: string
  metaConta: string
  metaPixel: string
  metaDominio: string
  sitePlataforma: string
  siteHospedagem: string
  siteDominio: string
  siteLogin: string
  siteSenha: string

  // 5. Delivery
  ifood: string
  rappi: string
  aiqfome: string
  siteDelivery: string

  // 6. CRM/Atendimento
  whatsappBusiness: string
  crm: string
  chatbot: string

  // 7. KPIs
  leads: number
  roas: number
  cac: number
  ticketMedio: number
  conversao: number
  alcance: number
  engajamento: number

  // 8. Demandas
  demandas: Demanda[]

  // 9. Notas
  notas: string
}

export const clienteVazio: Omit<ClienteCompleto, 'id'> = {
  nome: '', nomeFantasia: '', responsavel: '', telefone: '', whatsapp: '',
  email: '', emailFinanceiro: '', endereco: '', cidade: '', cnpj: '',
  segmento: '', concorrentes: '', instagram: '', status: 'Onboarding',
  mensalidade: 0, desde: '', servicos: [],
  objetivos: [], metaCurto: '', metaMedio: '', metaLongo: '',
  estiloVisual: '', refInstagram: '', refPinterest: '', refBehance: '',
  paletaCores: '', tipografia: '', tomDeVoz: '',
  googleAdsEmail: '', googleAdsId: '', googleMNLogin: '', googleAnalytics: '',
  googleDrive: '', metaBM: '', metaPagina: '', metaInstagram: '',
  metaConta: '', metaPixel: '', metaDominio: '',
  sitePlataforma: '', siteHospedagem: '', siteDominio: '', siteLogin: '', siteSenha: '',
  ifood: '', rappi: '', aiqfome: '', siteDelivery: '',
  whatsappBusiness: '', crm: '', chatbot: '',
  leads: 0, roas: 0, cac: 0, ticketMedio: 0, conversao: 0, alcance: 0, engajamento: 0,
  demandas: [], notas: '',
}

export const clientesIniciais: ClienteCompleto[] = [
  {
    id: 1, nome: 'TechNova Solutions', nomeFantasia: 'TechNova', responsavel: 'Roberto Alves',
    telefone: '(11) 9 8765-4321', whatsapp: '(11) 9 8765-4321', email: 'roberto@technova.com.br',
    emailFinanceiro: 'financeiro@technova.com.br', endereco: 'Av. Paulista, 1000', cidade: 'São Paulo/SP',
    cnpj: '12.345.678/0001-90', segmento: 'Tecnologia', concorrentes: 'Totvs, Sankhya',
    instagram: '@technova', status: 'Ativo', mensalidade: 12000, desde: '2024-03',
    servicos: ['Tráfego Pago', 'SEO', 'Redes Sociais'],
    objetivos: ['Leads', 'Autoridade', 'Escala'], metaCurto: '200 leads/mês', metaMedio: 'Lançar app', metaLongo: 'Expansão nacional',
    estiloVisual: 'Moderno', refInstagram: '', refPinterest: '', refBehance: '', paletaCores: '#0066FF, #FFFFFF, #1A1A1A', tipografia: 'Inter, Poppins', tomDeVoz: 'Técnico, confiante',
    googleAdsEmail: 'ads@technova.com.br', googleAdsId: '123-456-7890', googleMNLogin: '', googleAnalytics: 'UA-123456', googleDrive: '',
    metaBM: 'BM TechNova', metaPagina: 'TechNova Solutions', metaInstagram: '@technova', metaConta: 'act_123456', metaPixel: '1234567890', metaDominio: 'technova.com.br',
    sitePlataforma: 'WordPress', siteHospedagem: 'Hostinger', siteDominio: 'technova.com.br', siteLogin: 'admin', siteSenha: '',
    ifood: '', rappi: '', aiqfome: '', siteDelivery: '',
    whatsappBusiness: '(11) 9 8765-4321', crm: 'HubSpot', chatbot: '',
    leads: 187, roas: 4.2, cac: 89, ticketMedio: 2400, conversao: 3.8, alcance: 45000, engajamento: 4.1,
    demandas: [
      { id: 1, titulo: 'Criar campanha de remarketing', prioridade: '🟠 Alta', responsavel: 'Tráfego', prazo: '2026-05-20', status: 'Em execução' },
      { id: 2, titulo: 'Relatório mensal abril', prioridade: '🟡 Média', responsavel: 'FIGUEIREDO', prazo: '2026-05-18', status: 'Aberta' },
    ],
    notas: 'Cliente exigente, gosta de relatórios detalhados. Reunião quinzenal às terças.',
  },
  {
    id: 2, nome: 'Sabor & Arte Restaurante', nomeFantasia: 'Sabor & Arte', responsavel: 'Chef Paulo',
    telefone: '(11) 9 4321-0987', whatsapp: '(11) 9 4321-0987', email: 'paulo@saborarte.com.br',
    emailFinanceiro: 'paulo@saborarte.com.br', endereco: 'Rua das Flores, 200', cidade: 'São Paulo/SP',
    cnpj: '98.765.432/0001-10', segmento: 'Food', concorrentes: 'Restaurante Bela Vista, Pizza Hut local',
    instagram: '@saborarte', status: 'Ativo', mensalidade: 3800, desde: '2025-01',
    servicos: ['Redes Sociais', 'Fotografia', 'iFood'],
    objetivos: ['Delivery', 'Branding', 'Conversão'], metaCurto: 'Aumentar pedidos iFood 30%', metaMedio: 'Abrir segunda unidade', metaLongo: 'Franquia',
    estiloVisual: 'Premium', refInstagram: '@nomad.food', refPinterest: '', refBehance: '', paletaCores: '#8B0000, #F5F0E8, #2C2C2C', tipografia: 'Playfair Display, Lato', tomDeVoz: 'Sofisticado, acolhedor',
    googleAdsEmail: '', googleAdsId: '', googleMNLogin: 'saborarte@gmail.com', googleAnalytics: '', googleDrive: '',
    metaBM: 'BM Sabor Arte', metaPagina: 'Sabor & Arte', metaInstagram: '@saborarte', metaConta: 'act_789012', metaPixel: '9876543210', metaDominio: '',
    sitePlataforma: '', siteHospedagem: '', siteDominio: '', siteLogin: '', siteSenha: '',
    ifood: 'Sabor & Arte Restaurante', rappi: '', aiqfome: '', siteDelivery: '',
    whatsappBusiness: '(11) 9 4321-0987', crm: '', chatbot: '',
    leads: 43, roas: 6.8, cac: 22, ticketMedio: 85, conversao: 7.2, alcance: 28000, engajamento: 6.5,
    demandas: [
      { id: 1, titulo: '10 Reels para o mês de maio', prioridade: '🟠 Alta', responsavel: 'Video Editor', prazo: '2026-05-22', status: 'Aberta' },
    ],
    notas: 'Foco em food photography. Sempre aprovar antes de postar.',
  },
  {
    id: 3, nome: 'Clínica OdontoVida', nomeFantasia: 'OdontoVida', responsavel: 'Dra. Sandra',
    telefone: '(11) 9 1098-7654', whatsapp: '(11) 9 1098-7654', email: 'sandra@odontovida.com.br',
    emailFinanceiro: 'financeiro@odontovida.com.br', endereco: 'Av. Brasil, 500', cidade: 'Campinas/SP',
    cnpj: '11.222.333/0001-44', segmento: 'Saúde', concorrentes: 'OdontoPrev, clínicas locais',
    instagram: '@odontovida', status: 'Ativo', mensalidade: 5600, desde: '2025-03',
    servicos: ['Tráfego Pago', 'Redes Sociais', 'Google Meu Negócio'],
    objetivos: ['Leads', 'Autoridade', 'Conversão'], metaCurto: '80 novos pacientes/mês', metaMedio: 'Abrir filial', metaLongo: 'Rede de clínicas',
    estiloVisual: 'Minimalista', refInstagram: '', refPinterest: '', refBehance: '', paletaCores: '#0099CC, #FFFFFF, #F5F5F5', tipografia: 'Montserrat, Open Sans', tomDeVoz: 'Profissional, empático',
    googleAdsEmail: 'ads@odontovida.com.br', googleAdsId: '987-654-3210', googleMNLogin: 'odontovida@gmail.com', googleAnalytics: '', googleDrive: '',
    metaBM: 'BM OdontoVida', metaPagina: 'OdontoVida', metaInstagram: '@odontovida', metaConta: 'act_345678', metaPixel: '1122334455', metaDominio: 'odontovida.com.br',
    sitePlataforma: 'WordPress', siteHospedagem: 'Locaweb', siteDominio: 'odontovida.com.br', siteLogin: '', siteSenha: '',
    ifood: '', rappi: '', aiqfome: '', siteDelivery: '',
    whatsappBusiness: '(11) 9 1098-7654', crm: 'RD Station', chatbot: 'ManyChat',
    leads: 94, roas: 3.9, cac: 145, ticketMedio: 380, conversao: 5.1, alcance: 19000, engajamento: 3.8,
    demandas: [],
    notas: 'LGPD: não usar fotos de pacientes sem autorização assinada.',
  },
]
