/**
 * Alcance+ — lib/db.ts
 * Queries Supabase centralizadas para todos os módulos da Fase 1.
 * Usar no client-side com createClient() do @supabase/ssr.
 */
import { createClient } from '@/lib/supabase/client'

// ── Tipos base ───────────────────────────────────────────────────

export interface Cliente {
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

export interface Projeto {
  id: string
  titulo: string
  cliente_id: string | null
  cliente_nome: string
  responsavel: string
  status: 'planejamento' | 'em_andamento' | 'revisao' | 'concluido' | 'pausado'
  prioridade: 'alta' | 'media' | 'baixa'
  prazo: string | null
  progresso: number
  descricao: string
  created_at: string
}

export interface Campanha {
  id: string
  nome: string
  cliente_id: string | null
  cliente_nome: string
  canal: string
  status: 'planejada' | 'ativa' | 'pausada' | 'encerrada'
  orcamento: number
  gasto: number
  inicio: string | null
  fim: string | null
  impressoes: number
  cliques: number
  conversoes: number
  objetivo: string
  created_at: string
}

export interface Transacao {
  id: string
  descricao: string
  tipo: 'receita' | 'despesa'
  categoria: string
  valor: number
  data: string
  cliente_id: string | null
  cliente_nome: string
  status: 'pago' | 'pendente' | 'atrasado'
  created_at: string
}

export interface MembroEquipe {
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

export interface Lead {
  id: string
  empresa: string
  contato: string
  valor: number
  etapa: 'prospeccao' | 'qualificacao' | 'proposta' | 'negociacao' | 'fechado' | 'perdido'
  origem: string
  probabilidade: number
  proximo_contato: string | null
  observacoes: string
  created_at: string
}

export interface Proposta {
  id: string
  titulo: string
  cliente_id: string | null
  cliente_nome: string
  valor: number
  status: 'rascunho' | 'aguardando' | 'em_analise' | 'aprovada' | 'recusada'
  criado: string
  validade: string | null
  servicos: string[]
  desconto: number
  observacoes: string
  created_at: string
}

export interface PostCalendario {
  id: string
  titulo: string
  cliente_id: string | null
  cliente_nome: string
  canal: string
  data: string
  hora: string
  status: 'em_criacao' | 'revisao' | 'aprovado' | 'agendado' | 'publicado'
  formato: string
  legenda: string
  created_at: string
}

export interface Tarefa {
  id: string
  titulo: string
  descricao: string
  responsavel: string
  responsavel_id: string | null
  projeto_id: string | null
  cliente_id: string | null
  cliente_nome: string
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa'
  status: 'a_fazer' | 'em_andamento' | 'revisao' | 'concluido'
  prazo: string | null
  tags: string[]
  checklist: { id: string; texto: string; feito: boolean }[]
  created_at: string
  updated_at: string
}

export interface Contrato {
  id: string
  cliente_id: string | null
  cliente_nome: string
  tipo: 'mensalidade' | 'projeto' | 'avulso' | 'retainer'
  valor_mensal: number
  dia_cobranca: number
  inicio: string
  vencimento: string | null
  reajuste_anual: number
  status: 'ativo' | 'pausado' | 'encerrado' | 'inadimplente'
  servicos: string[]
  observacoes: string
  arquivo_url: string
  created_at: string
}

// ── KPIs Dashboard ───────────────────────────────────────────────

export interface DashboardKPIs {
  totalClientes: number
  clientesAtivos: number
  mrr: number
  projetosAtivos: number
  projetosConcluidos: number
  campanhasAtivas: number
  leadsTotal: number
  leadsFechados: number
  receitaMes: number
  despesaMes: number
  lucroMes: number
  margemMes: number
  ticketMedio: number
  propostasAbertas: number
  valorPipelineTotal: number
}

export type ContatoStatus = 'ativo' | 'cancelado' | 'bloqueado'
export type ContatoOrigem = 'qr_code' | 'wifi' | 'delivery' | 'site' | 'instagram' | 'presencial' | 'manual' | 'importacao'
export interface ContatoMkt {
  id: string
  cliente_id: string | null
  cliente_nome: string | null
  nome: string
  telefone: string
  email: string | null
  origem: ContatoOrigem | null
  consentimento: boolean
  data_optin: string | null
  data_optout: string | null
  status: ContatoStatus
  aniversario: string | null
  ultima_compra: string | null
  ticket_medio: number
  total_pedidos: number
  categoria_favorita: string | null
  tags: string[]
  observacoes: string | null
  created_at: string
  updated_at: string
}

export type DisparoTipo = 'texto' | 'imagem' | 'video' | 'documento' | 'link'
export type DisparoStatus = 'rascunho' | 'enviando' | 'pausado' | 'concluido'
export interface Disparo {
  id: string
  cliente_id: string | null
  cliente_nome: string | null
  nome: string
  tipo: DisparoTipo
  mensagem: string
  media_url: string | null
  file_name: string | null
  total: number
  enviados: number
  falhas: number
  status: DisparoStatus
  lote: number
  intervalo_seg: number
  created_at: string
  updated_at: string
}
export type EnvioStatus = 'pendente' | 'enviado' | 'falha' | 'cancelado'
export interface DisparoEnvio {
  id: string
  disparo_id: string
  contato_id: string | null
  telefone: string
  nome: string | null
  status: EnvioStatus
  erro: string | null
  enviado_em: string | null
  created_at: string
}

export interface BrandKit {
  id: string
  cliente_id: string | null
  nome: string
  logo_url: string
  cor_primaria: string
  cor_secundaria: string
  cor_acento: string
  fontes: string[]
  tagline: string
  segmento: string
  site: string
  created_at: string
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const sb = createClient()
  const now = new Date()
  const anoMes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [
    { data: clientes },
    { data: projetos },
    { data: campanhas },
    { data: transacoes },
    { data: pipeline },
    { data: propostas },
  ] = await Promise.all([
    sb.from('clientes').select('id,status,mensalidade'),
    sb.from('projetos').select('id,status'),
    sb.from('campanhas').select('id,status'),
    sb.from('transacoes').select('tipo,valor,data,status').gte('data', `${anoMes}-01`),
    sb.from('pipeline').select('valor,etapa'),
    sb.from('propostas').select('id,valor,status'),
  ])

  const clientesAtivos = (clientes ?? []).filter(c => c.status === 'ativo')
  const mrr = clientesAtivos.reduce((s, c) => s + (c.mensalidade || 0), 0)
  const receitaMes = (transacoes ?? []).filter(t => t.tipo === 'receita' && t.status === 'pago').reduce((s, t) => s + t.valor, 0)
  const despesaMes = (transacoes ?? []).filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0)
  const lucroMes = receitaMes - despesaMes
  const margemMes = receitaMes > 0 ? (lucroMes / receitaMes) * 100 : 0
  const ticketMedio = clientesAtivos.length > 0 ? mrr / clientesAtivos.length : 0
  const valorPipelineTotal = (pipeline ?? []).filter(l => !['fechado','perdido'].includes(l.etapa)).reduce((s, l) => s + l.valor, 0)

  return {
    totalClientes:       (clientes ?? []).length,
    clientesAtivos:      clientesAtivos.length,
    mrr,
    projetosAtivos:      (projetos ?? []).filter(p => p.status === 'em_andamento').length,
    projetosConcluidos:  (projetos ?? []).filter(p => p.status === 'concluido').length,
    campanhasAtivas:     (campanhas ?? []).filter(c => c.status === 'ativa').length,
    leadsTotal:          (pipeline ?? []).length,
    leadsFechados:       (pipeline ?? []).filter(l => l.etapa === 'fechado').length,
    receitaMes,
    despesaMes,
    lucroMes,
    margemMes,
    ticketMedio,
    propostasAbertas:    (propostas ?? []).filter(p => ['aguardando','em_analise'].includes(p.status)).length,
    valorPipelineTotal,
  }
}

// ── Clientes ─────────────────────────────────────────────────────

export const db = {
  clientes: {
    listar:   () => createClient().from('clientes').select('*').order('created_at', { ascending: false }),
    criar:    (data: Omit<Cliente, 'id' | 'created_at'>) => createClient().from('clientes').insert(data).select().single(),
    atualizar:(id: string, data: Partial<Cliente>) => createClient().from('clientes').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('clientes').delete().eq('id', id),
  },
  projetos: {
    listar:   () => createClient().from('projetos').select('*').order('created_at', { ascending: false }),
    criar:    (data: Omit<Projeto, 'id' | 'created_at'>) => createClient().from('projetos').insert(data).select().single(),
    atualizar:(id: string, data: Partial<Projeto>) => createClient().from('projetos').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('projetos').delete().eq('id', id),
  },
  campanhas: {
    listar:   () => createClient().from('campanhas').select('*').order('created_at', { ascending: false }),
    criar:    (data: Omit<Campanha, 'id' | 'created_at'>) => createClient().from('campanhas').insert(data).select().single(),
    atualizar:(id: string, data: Partial<Campanha>) => createClient().from('campanhas').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('campanhas').delete().eq('id', id),
  },
  transacoes: {
    listar:   () => createClient().from('transacoes').select('*').order('data', { ascending: false }),
    criar:    (data: Omit<Transacao, 'id' | 'created_at'>) => createClient().from('transacoes').insert(data).select().single(),
    atualizar:(id: string, data: Partial<Transacao>) => createClient().from('transacoes').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('transacoes').delete().eq('id', id),
  },
  equipe: {
    listar:   () => createClient().from('equipe').select('*').order('nome'),
    criar:    (data: Omit<MembroEquipe, 'id' | 'created_at'>) => createClient().from('equipe').insert(data).select().single(),
    atualizar:(id: string, data: Partial<MembroEquipe>) => createClient().from('equipe').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('equipe').delete().eq('id', id),
  },
  pipeline: {
    listar:   () => createClient().from('pipeline').select('*').order('created_at', { ascending: false }),
    criar:    (data: Omit<Lead, 'id' | 'created_at'>) => createClient().from('pipeline').insert(data).select().single(),
    atualizar:(id: string, data: Partial<Lead>) => createClient().from('pipeline').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('pipeline').delete().eq('id', id),
  },
  propostas: {
    listar:   () => createClient().from('propostas').select('*').order('created_at', { ascending: false }),
    criar:    (data: Omit<Proposta, 'id' | 'created_at'>) => createClient().from('propostas').insert(data).select().single(),
    atualizar:(id: string, data: Partial<Proposta>) => createClient().from('propostas').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('propostas').delete().eq('id', id),
  },
  calendario: {
    listar:   () => createClient().from('calendario').select('*').order('data'),
    criar:    (data: Omit<PostCalendario, 'id' | 'created_at'>) => createClient().from('calendario').insert(data).select().single(),
    atualizar:(id: string, data: Partial<PostCalendario>) => createClient().from('calendario').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('calendario').delete().eq('id', id),
  },
  tarefas: {
    listar:   () => createClient().from('tarefas').select('*').order('created_at', { ascending: false }),
    criar:    (data: Omit<Tarefa, 'id' | 'created_at' | 'updated_at'>) => createClient().from('tarefas').insert(data).select().single(),
    atualizar:(id: string, data: Partial<Tarefa>) => createClient().from('tarefas').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('tarefas').delete().eq('id', id),
  },
  contratos: {
    listar:   () => createClient().from('contratos').select('*').order('created_at', { ascending: false }),
    criar:    (data: Omit<Contrato, 'id' | 'created_at'>) => createClient().from('contratos').insert(data).select().single(),
    atualizar:(id: string, data: Partial<Contrato>) => createClient().from('contratos').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('contratos').delete().eq('id', id),
  },
  brandKits: {
    listar:   () => createClient().from('brand_kits').select('*').order('created_at', { ascending: false }),
    criar:    (data: Omit<BrandKit, 'id' | 'created_at'>) => createClient().from('brand_kits').insert(data).select().single(),
    atualizar:(id: string, data: Partial<BrandKit>) => createClient().from('brand_kits').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('brand_kits').delete().eq('id', id),
  },
  briefings: {
    listar:   () => createClient().from('briefings').select('*').order('created_at', { ascending: false }),
    criar:    (data: any) => createClient().from('briefings').insert(data).select().single(),
    atualizar:(id: string, data: any) => createClient().from('briefings').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('briefings').delete().eq('id', id),
  },
  aprovacoes: {
    listar:   () => createClient().from('aprovacoes_pecas').select('*').order('created_at', { ascending: false }),
    criar:    (data: any) => createClient().from('aprovacoes_pecas').insert(data).select().single(),
    atualizar:(id: string, data: any) => createClient().from('aprovacoes_pecas').update(data).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('aprovacoes_pecas').delete().eq('id', id),
  },
  contatos: {
    listar:   () => createClient().from('mkt_contatos').select('*').order('created_at', { ascending: false }),
    criar:    (data: Omit<ContatoMkt,'id'|'created_at'|'updated_at'>) => createClient().from('mkt_contatos').insert(data).select().single(),
    atualizar:(id: string, data: Partial<ContatoMkt>) => createClient().from('mkt_contatos').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('mkt_contatos').delete().eq('id', id),
    importar: (data: Omit<ContatoMkt,'id'|'created_at'|'updated_at'>[]) => createClient().from('mkt_contatos').upsert(data, { onConflict: 'telefone', ignoreDuplicates: true }).select(),
    ativos:   (clienteId?: string | null) => {
      let q = createClient().from('mkt_contatos').select('*').eq('status', 'ativo')
      if (clienteId) q = q.eq('cliente_id', clienteId)
      return q
    },
  },
  disparos: {
    listar:   () => createClient().from('disparos').select('*').order('created_at', { ascending: false }),
    criar:    (data: Omit<Disparo,'id'|'created_at'|'updated_at'>) => createClient().from('disparos').insert(data).select().single(),
    atualizar:(id: string, data: Partial<Disparo>) => createClient().from('disparos').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
    deletar:  (id: string) => createClient().from('disparos').delete().eq('id', id),
    obter:    (id: string) => createClient().from('disparos').select('*').eq('id', id).single(),
  },
  disparoEnvios: {
    criarLote: (data: Omit<DisparoEnvio,'id'|'created_at'>[]) => createClient().from('disparo_envios').insert(data).select(),
    porDisparo:(disparoId: string) => createClient().from('disparo_envios').select('*').eq('disparo_id', disparoId),
  },
}
