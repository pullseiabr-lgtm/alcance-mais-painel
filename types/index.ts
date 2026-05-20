export type Cliente = {
  id: string
  nome: string
  contato: string
  email: string
  telefone: string
  setor: string
  status: 'ativo' | 'onboarding' | 'pausado' | 'inativo'
  mensalidade: number
  desde: string
  servicos: string[]
  created_at: string
}

export type Projeto = {
  id: string
  titulo: string
  cliente_id: string
  cliente_nome?: string
  responsavel: string
  status: 'planejamento' | 'em_andamento' | 'revisao' | 'concluido' | 'pausado'
  prioridade: 'alta' | 'media' | 'baixa'
  prazo: string
  progresso: number
  descricao: string
  created_at: string
}

export type Campanha = {
  id: string
  nome: string
  cliente_id: string
  cliente_nome?: string
  canal: string
  status: 'planejada' | 'ativa' | 'pausada' | 'encerrada'
  orcamento: number
  gasto: number
  inicio: string
  fim: string
  impressoes: number
  cliques: number
  conversoes: number
  objetivo: string
  created_at: string
}

export type Transacao = {
  id: string
  descricao: string
  tipo: 'receita' | 'despesa'
  categoria: string
  valor: number
  data: string
  cliente_id?: string
  cliente_nome?: string
  status: 'pago' | 'pendente' | 'atrasado'
  created_at: string
}

export type MembroEquipe = {
  id: string
  nome: string
  cargo: string
  email: string
  especializacao: string[]
  status: 'ativo' | 'ferias' | 'afastado'
  carga_horaria: number
  nivel: 'senior' | 'pleno' | 'junior'
  created_at: string
}

export type Lead = {
  id: string
  empresa: string
  contato: string
  valor: number
  etapa: 'prospeccao' | 'qualificacao' | 'proposta' | 'negociacao' | 'fechado' | 'perdido'
  origem: string
  probabilidade: number
  proximo_contato: string
  observacoes: string
  created_at: string
}

export type Proposta = {
  id: string
  titulo: string
  cliente_id?: string
  cliente_nome: string
  valor: number
  status: 'rascunho' | 'aguardando' | 'em_analise' | 'aprovada' | 'recusada'
  criado: string
  validade: string
  servicos: string[]
  desconto: number
  observacoes: string
  created_at: string
}

export type PostCalendario = {
  id: string
  titulo: string
  cliente_id: string
  cliente_nome?: string
  canal: string
  data: string
  hora: string
  status: 'em_criacao' | 'revisao' | 'aprovado' | 'agendado' | 'publicado'
  formato: string
  legenda: string
  created_at: string
}
