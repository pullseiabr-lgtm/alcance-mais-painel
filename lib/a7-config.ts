// Configuração compartilhada do A7 (servidor + tela de gestão)

export type Campo = {
  k: string
  label: string
  tipo?: 'text' | 'textarea' | 'select' | 'date' | 'datetime' | 'number' | 'url' | 'password'
  opcoes?: string[]
  obrigatorio?: boolean
}

export type RecursoCfg = {
  tabela: string
  titulo: string
  ordem: { col: string; asc: boolean }
  campos: Campo[]
  // o que o CLIENTE pode fazer
  cliente: { criar?: boolean; editar?: string[]; apagar?: boolean }
}

export const REDES = ['instagram', 'facebook', 'tiktok', 'linkedin', 'youtube', 'whatsapp', 'outro']
export const FORMATOS = ['feed', 'reels', 'stories', 'carrossel', 'video', 'artigo']
export const STATUS_POST = ['rascunho', 'aguardando_aprovacao', 'aprovado', 'ajuste', 'agendado', 'publicado']

export const RECURSOS: Record<string, RecursoCfg> = {
  posts: {
    tabela: 'a7_posts', titulo: 'Cronograma de postagens',
    ordem: { col: 'data_publicacao', asc: true },
    cliente: { editar: ['status', 'comentario_cliente'] },
    campos: [
      { k: 'titulo', label: 'Título', obrigatorio: true },
      { k: 'legenda', label: 'Legenda', tipo: 'textarea' },
      { k: 'rede', label: 'Rede', tipo: 'select', opcoes: REDES },
      { k: 'formato', label: 'Formato', tipo: 'select', opcoes: FORMATOS },
      { k: 'data_publicacao', label: 'Publicação', tipo: 'datetime' },
      { k: 'midia_url', label: 'Link da arte/vídeo', tipo: 'url' },
      { k: 'status', label: 'Status', tipo: 'select', opcoes: STATUS_POST },
    ],
  },
  acoes: {
    tabela: 'a7_acoes', titulo: 'Plano de ação',
    ordem: { col: 'prazo', asc: true },
    cliente: { editar: ['status', 'comentario_cliente'] },
    campos: [
      { k: 'o_que', label: 'O que será feito', obrigatorio: true },
      { k: 'por_que', label: 'Por quê', tipo: 'textarea' },
      { k: 'como', label: 'Como', tipo: 'textarea' },
      { k: 'quem', label: 'Quem fará' },
      { k: 'prazo', label: 'Prazo', tipo: 'date' },
      { k: 'custo', label: 'Custo (R$)', tipo: 'number' },
      { k: 'prioridade', label: 'Prioridade', tipo: 'select', opcoes: ['baixa', 'media', 'alta'] },
      { k: 'status', label: 'Status', tipo: 'select', opcoes: ['execucao', 'validacao', 'aprovado'] },
    ],
  },
  biblioteca: {
    tabela: 'a7_biblioteca', titulo: 'Biblioteca',
    ordem: { col: 'created_at', asc: false },
    cliente: { criar: true, apagar: true },
    campos: [
      { k: 'pasta', label: 'Pasta' },
      { k: 'nome', label: 'Nome', obrigatorio: true },
      { k: 'url', label: 'URL', tipo: 'url' },
    ],
  },
  planos: {
    tabela: 'a7_planos', titulo: 'Estratégia e planejamento',
    ordem: { col: 'created_at', asc: false },
    cliente: {},
    campos: [
      { k: 'titulo', label: 'Título', obrigatorio: true },
      { k: 'tipo', label: 'Tipo', tipo: 'select', opcoes: ['estrategia', 'planejamento', 'briefing', 'relatorio'] },
      { k: 'periodo', label: 'Período (ex.: Out/2026)' },
      { k: 'status', label: 'Status', tipo: 'select', opcoes: ['rascunho', 'vigente', 'concluido'] },
      { k: 'conteudo', label: 'Conteúdo', tipo: 'textarea' },
    ],
  },
  campanhas: {
    tabela: 'a7_campanhas', titulo: 'Campanhas e tráfego pago',
    ordem: { col: 'created_at', asc: false },
    cliente: {},
    campos: [
      { k: 'nome', label: 'Nome', obrigatorio: true },
      { k: 'canal', label: 'Canal', tipo: 'select', opcoes: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads', 'WhatsApp', 'Outro'] },
      { k: 'objetivo', label: 'Objetivo' },
      { k: 'status', label: 'Status', tipo: 'select', opcoes: ['planejada', 'ativa', 'pausada', 'encerrada'] },
      { k: 'orcamento', label: 'Orçamento (R$)', tipo: 'number' },
      { k: 'gasto', label: 'Investido (R$)', tipo: 'number' },
      { k: 'inicio', label: 'Início', tipo: 'date' },
      { k: 'fim', label: 'Fim', tipo: 'date' },
      { k: 'impressoes', label: 'Impressões', tipo: 'number' },
      { k: 'cliques', label: 'Cliques', tipo: 'number' },
      { k: 'conversoes', label: 'Conversões / leads', tipo: 'number' },
      { k: 'resultado', label: 'Leitura do resultado', tipo: 'textarea' },
    ],
  },
  senhas: {
    tabela: 'a7_senhas', titulo: 'Senhas e acessos',
    ordem: { col: 'servico', asc: true },
    cliente: { criar: true, editar: ['servico', 'url', 'usuario', 'senha', 'obs'], apagar: true },
    campos: [
      { k: 'servico', label: 'Serviço (ex.: Instagram)', obrigatorio: true },
      { k: 'url', label: 'Link de acesso', tipo: 'url' },
      { k: 'usuario', label: 'Usuário / e-mail' },
      { k: 'senha', label: 'Senha', tipo: 'password' },
      { k: 'obs', label: 'Observações', tipo: 'textarea' },
    ],
  },
  chamados: {
    tabela: 'a7_chamados', titulo: 'Chamados',
    ordem: { col: 'created_at', asc: false },
    cliente: { criar: true },
    campos: [
      { k: 'titulo', label: 'Assunto', obrigatorio: true },
      { k: 'categoria', label: 'Categoria', tipo: 'select', opcoes: ['duvida', 'alteracao', 'novo_pedido', 'problema', 'financeiro'] },
      { k: 'prioridade', label: 'Prioridade', tipo: 'select', opcoes: ['baixa', 'media', 'alta'] },
      { k: 'descricao', label: 'Descrição', tipo: 'textarea' },
      { k: 'status', label: 'Status', tipo: 'select', opcoes: ['novo', 'andamento', 'aguardando_cliente', 'resolvido'] },
    ],
  },
  comunicados: {
    tabela: 'a7_comunicados', titulo: 'Comunicados',
    ordem: { col: 'created_at', asc: false },
    cliente: {},
    campos: [
      { k: 'titulo', label: 'Título', obrigatorio: true },
      { k: 'corpo', label: 'Mensagem', tipo: 'textarea' },
    ],
  },
  acessos: {
    tabela: 'a7_acessos', titulo: 'Logins do cliente',
    ordem: { col: 'created_at', asc: false },
    cliente: {},
    campos: [
      { k: 'nome', label: 'Nome', obrigatorio: true },
      { k: 'email', label: 'E-mail', obrigatorio: true },
      { k: 'senha', label: 'Senha', tipo: 'password', obrigatorio: true },
    ],
  },
}

export const LABEL_STATUS: Record<string, { txt: string; cor: string }> = {
  rascunho: { txt: 'Rascunho', cor: '#94a3b8' },
  aguardando_aprovacao: { txt: 'Aguardando sua aprovação', cor: '#f59e0b' },
  aprovado: { txt: 'Aprovado', cor: '#22c55e' },
  ajuste: { txt: 'Ajuste solicitado', cor: '#ef4444' },
  agendado: { txt: 'Agendado', cor: '#3b82f6' },
  publicado: { txt: 'Publicado', cor: '#00a89a' },
  novo: { txt: 'Novo', cor: '#3b82f6' },
  andamento: { txt: 'Em andamento', cor: '#f59e0b' },
  aguardando_cliente: { txt: 'Aguardando você', cor: '#ef4444' },
  resolvido: { txt: 'Resolvido', cor: '#22c55e' },
  planejada: { txt: 'Planejada', cor: '#94a3b8' },
  ativa: { txt: 'Ativa', cor: '#22c55e' },
  pausada: { txt: 'Pausada', cor: '#f59e0b' },
  encerrada: { txt: 'Encerrada', cor: '#64748b' },
  execucao: { txt: 'Em execução', cor: '#3b82f6' },
  validacao: { txt: 'Aguardando sua validação', cor: '#f59e0b' },
  vigente: { txt: 'Vigente', cor: '#22c55e' },
  concluido: { txt: 'Concluído', cor: '#64748b' },
}
