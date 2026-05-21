export type Role = 'admin' | 'gestor' | 'criativo' | 'cliente' | 'viewer'

export const PAGINAS = [
  { id: 'dashboard',     label: 'Dashboard',         path: '/',               secao: 'Principal' },
  { id: 'pipeline',      label: 'Pipeline',           path: '/pipeline',       secao: 'Principal' },
  { id: 'clientes',      label: 'Clientes',           path: '/clientes',       secao: 'Clientes' },
  { id: 'propostas',     label: 'Propostas',          path: '/propostas',      secao: 'Clientes' },
  { id: 'projetos',      label: 'Projetos',           path: '/projetos',       secao: 'Operações' },
  { id: 'campanhas',     label: 'Campanhas',          path: '/campanhas',      secao: 'Operações' },
  { id: 'calendario',    label: 'Calendário',         path: '/calendario',     secao: 'Operações' },
  { id: 'financeiro',    label: 'Financeiro',         path: '/financeiro',     secao: 'Gestão' },
  { id: 'equipe',        label: 'Equipe',             path: '/equipe',         secao: 'Gestão' },
  { id: 'relatorios',    label: 'Relatórios',         path: '/relatorios',     secao: 'Gestão' },
  { id: 'figueiredo',    label: 'FIGUEIREDO IA',      path: '/figueiredo',     secao: 'IA' },
  { id: 'agente',        label: 'Agente IA',          path: '/agente',         secao: 'IA' },
  { id: 'editor',        label: 'Editor de Vídeos',   path: '/editor',         secao: 'IA' },
  { id: 'criador-arte',  label: 'Criador de Arte',    path: '/criador-arte',   secao: 'IA' },
  { id: 'manus-imagens', label: 'Manus Imagens',      path: '/manus-imagens',  secao: 'IA' },
  { id: 'ifood',         label: 'Expert iFood',       path: '/ifood',          secao: 'IA' },
  { id: 'dev',           label: 'Developer IA',       path: '/dev',            secao: 'IA' },
  { id: 'usuarios',      label: 'Usuários',           path: '/usuarios',       secao: 'Admin' },
] as const

export type PageId = typeof PAGINAS[number]['id']

export const PERMISSOES_PADRAO: Record<Role, PageId[]> = {
  admin: PAGINAS.map(p => p.id) as PageId[],
  gestor: [
    'dashboard','pipeline','clientes','propostas','projetos',
    'campanhas','calendario','financeiro','equipe','relatorios','agente',
  ],
  criativo: [
    'dashboard','campanhas','calendario','criador-arte',
    'manus-imagens','editor','figueiredo','agente','ifood',
  ],
  cliente: ['dashboard','campanhas','relatorios'],
  viewer:  ['dashboard'],
}

export const ROLE_LABELS: Record<Role, string> = {
  admin:    'Administrador',
  gestor:   'Gestor',
  criativo: 'Criativo',
  cliente:  'Cliente',
  viewer:   'Visualizador',
}

export const ROLE_COLORS: Record<Role, string> = {
  admin:    '#00C4B4',
  gestor:   '#6366f1',
  criativo: '#FFD700',
  cliente:  '#FF8C00',
  viewer:   '#6b7280',
}

export function temPermissao(permissoes: string[], path: string): boolean {
  const pagina = PAGINAS.find(p => p.path === path || (path !== '/' && path.startsWith(p.path + '/')))
  if (!pagina) return true // páginas não mapeadas liberadas
  return permissoes.includes(pagina.id)
}
