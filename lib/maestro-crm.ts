/**
 * Alcance+ — Ferramentas de consulta ao CRM para o Maestro (tool use).
 * Roda server-side com service role. Cada função retorna dados reais do Supabase.
 */
import { createClient } from '@supabase/supabase-js'
import type { Tool } from '@anthropic-ai/sdk/resources/messages'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const brl = (n: number) => `R$ ${(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

// ── Definições das tools (expostas ao Claude) ─────────────────────────────────
export const CRM_TOOLS: Tool[] = [
  {
    name: 'metricas_gerais',
    description: 'Retorna os KPIs gerais da agência: clientes ativos, MRR, ARR, total de campanhas ativas, receita e despesa do mês. Use para perguntas sobre a agência como um todo.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'buscar_cliente',
    description: 'Busca o perfil 360° de UM cliente pelo nome (busca parcial). Retorna dados do cliente + campanhas, projetos, financeiro e pendências agregadas. Use para "qual o status do cliente X".',
    input_schema: {
      type: 'object',
      properties: { nome: { type: 'string', description: 'Nome ou parte do nome do cliente' } },
      required: ['nome'],
    },
  },
  {
    name: 'listar_clientes',
    description: 'Lista clientes, opcionalmente filtrando por status (ativo, onboarding, pausado, inativo). Retorna nome, status e mensalidade.',
    input_schema: {
      type: 'object',
      properties: { status: { type: 'string', description: 'Filtro opcional: ativo, onboarding, pausado ou inativo' } },
    },
  },
  {
    name: 'campanhas_cliente',
    description: 'Lista as campanhas de um cliente com métricas (orçamento, gasto, conversões, CPL). Use para perguntas sobre desempenho de campanhas.',
    input_schema: {
      type: 'object',
      properties: { nome: { type: 'string', description: 'Nome do cliente' } },
      required: ['nome'],
    },
  },
  {
    name: 'financeiro_cliente',
    description: 'Retorna o resumo financeiro de um cliente: receitas, pendências e atrasos.',
    input_schema: {
      type: 'object',
      properties: { nome: { type: 'string', description: 'Nome do cliente' } },
      required: ['nome'],
    },
  },
]

// ── Ferramentas META ADS (Growth Performance AI) ──────────────────────────────
import { getCampaigns, getInsights, getAdAccounts } from './meta-ads'

const META_ACCOUNT = process.env.META_ADS_ACCOUNT_ID || ''

export const META_TOOLS: Tool[] = [
  {
    name: 'meta_conta',
    description: 'Retorna as contas de anúncio da Meta conectadas (nome, moeda, gasto total, status). Use para saber quais contas existem.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'meta_campanhas',
    description: 'Lista as campanhas da conta de anúncios Meta (nome, status, objetivo). Use para ver o que está rodando na Meta.',
    input_schema: {
      type: 'object',
      properties: { status: { type: 'string', description: 'Filtro opcional: ACTIVE, PAUSED ou ALL' } },
    },
  },
  {
    name: 'meta_metricas',
    description: 'Retorna métricas REAIS de performance da Meta Ads (gasto, impressões, cliques, CTR, CPC, conversões, ROAS) por período. Use para análise de performance e relatórios.',
    input_schema: {
      type: 'object',
      properties: { periodo: { type: 'string', description: 'today, yesterday, last_7d, last_30d ou last_90d' } },
    },
  },
]

export async function executarToolMeta(nome: string, input: Record<string, unknown>): Promise<string> {
  if (!META_ACCOUNT) return JSON.stringify({ erro: 'META_ADS_ACCOUNT_ID não configurado no .env.local' })
  try {
    switch (nome) {
      case 'meta_conta':
        return JSON.stringify(await getAdAccounts())
      case 'meta_campanhas':
        return JSON.stringify(await getCampaigns(META_ACCOUNT, String(input.status || 'ALL')))
      case 'meta_metricas':
        return JSON.stringify(await getInsights(META_ACCOUNT, String(input.periodo || 'last_30d'), 'campaign'))
      default:
        return JSON.stringify({ erro: `Ferramenta Meta desconhecida: ${nome}` })
    }
  } catch (e) {
    return JSON.stringify({ erro: e instanceof Error ? e.message : 'Erro na Meta API' })
  }
}

// ── Definições das tools de ESCRITA (Operador) ────────────────────────────────
export const CRM_WRITE_TOOLS: Tool[] = [
  {
    name: 'criar_lead',
    description: 'Cria um novo lead no pipeline (etapa inicial: prospecção). Use quando o usuário pedir para cadastrar/adicionar um lead ou prospect.',
    input_schema: {
      type: 'object',
      properties: {
        empresa: { type: 'string', description: 'Nome da empresa do lead' },
        contato: { type: 'string', description: 'Nome do contato/responsável' },
        valor: { type: 'number', description: 'Valor potencial estimado (R$). Opcional.' },
        origem: { type: 'string', description: 'Origem do lead (Instagram, indicação, etc). Opcional.' },
        observacoes: { type: 'string', description: 'Observações. Opcional.' },
      },
      required: ['empresa', 'contato'],
    },
  },
  {
    name: 'qualificar_lead',
    description: 'Qualifica um lead existente: move para a etapa qualificação e define a probabilidade de fechamento.',
    input_schema: {
      type: 'object',
      properties: {
        empresa: { type: 'string', description: 'Empresa do lead a qualificar' },
        probabilidade: { type: 'number', description: 'Probabilidade de fechamento (0-100)' },
        observacoes: { type: 'string', description: 'Notas da qualificação. Opcional.' },
      },
      required: ['empresa'],
    },
  },
  {
    name: 'mover_pipeline',
    description: 'Move um lead para outra etapa do pipeline. Etapas válidas: prospeccao, qualificacao, proposta, negociacao, fechado, perdido.',
    input_schema: {
      type: 'object',
      properties: {
        empresa: { type: 'string', description: 'Empresa do lead' },
        etapa: { type: 'string', description: 'Nova etapa: prospeccao, qualificacao, proposta, negociacao, fechado ou perdido' },
      },
      required: ['empresa', 'etapa'],
    },
  },
  {
    name: 'criar_cliente',
    description: 'Cria um novo cliente no CRM (status inicial: onboarding). Use ao converter um lead fechado em cliente ou ao cadastrar cliente novo.',
    input_schema: {
      type: 'object',
      properties: {
        nome: { type: 'string', description: 'Nome da empresa/cliente' },
        contato: { type: 'string', description: 'Nome do responsável' },
        email: { type: 'string', description: 'E-mail. Opcional.' },
        telefone: { type: 'string', description: 'Telefone/WhatsApp. Opcional.' },
        setor: { type: 'string', description: 'Segmento/setor. Opcional.' },
        mensalidade: { type: 'number', description: 'Valor mensal do contrato (R$). Opcional.' },
        servicos: { type: 'array', items: { type: 'string' }, description: 'Serviços contratados. Opcional.' },
      },
      required: ['nome', 'contato'],
    },
  },
]

const ETAPAS_VALIDAS = ['prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechado', 'perdido']

// ── Executor das tools de escrita ─────────────────────────────────────────────
export async function executarToolEscrita(nome: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (nome) {
      case 'criar_lead': {
        const { data, error } = await supabase.from('pipeline').insert({
          empresa: String(input.empresa), contato: String(input.contato),
          valor: Number(input.valor) || 0, etapa: 'prospeccao',
          origem: input.origem ? String(input.origem) : 'Maestro',
          probabilidade: 10, observacoes: input.observacoes ? String(input.observacoes) : '',
        }).select().single()
        if (error) throw error
        return JSON.stringify({ ok: true, mensagem: `Lead "${data.empresa}" criado na etapa Prospecção.`, id: data.id })
      }

      case 'qualificar_lead': {
        const termo = String(input.empresa)
        const { data: leads } = await supabase.from('pipeline').select('id, empresa').ilike('empresa', `%${termo}%`).limit(1)
        if (!leads?.length) return JSON.stringify({ erro: `Lead "${termo}" não encontrado.` })
        const update: Record<string, unknown> = { etapa: 'qualificacao' }
        if (input.probabilidade != null) update.probabilidade = Number(input.probabilidade)
        if (input.observacoes) update.observacoes = String(input.observacoes)
        const { error } = await supabase.from('pipeline').update(update).eq('id', leads[0].id)
        if (error) throw error
        return JSON.stringify({ ok: true, mensagem: `Lead "${leads[0].empresa}" qualificado (etapa Qualificação${input.probabilidade != null ? `, ${input.probabilidade}% de chance` : ''}).` })
      }

      case 'mover_pipeline': {
        const etapa = String(input.etapa).toLowerCase()
        if (!ETAPAS_VALIDAS.includes(etapa)) return JSON.stringify({ erro: `Etapa inválida. Use: ${ETAPAS_VALIDAS.join(', ')}` })
        const termo = String(input.empresa)
        const { data: leads } = await supabase.from('pipeline').select('id, empresa').ilike('empresa', `%${termo}%`).limit(1)
        if (!leads?.length) return JSON.stringify({ erro: `Lead "${termo}" não encontrado.` })
        const { error } = await supabase.from('pipeline').update({ etapa }).eq('id', leads[0].id)
        if (error) throw error
        return JSON.stringify({ ok: true, mensagem: `Lead "${leads[0].empresa}" movido para "${etapa}".` })
      }

      case 'criar_cliente': {
        const { data, error } = await supabase.from('clientes').insert({
          nome: String(input.nome), contato: String(input.contato),
          email: input.email ? String(input.email) : '', telefone: input.telefone ? String(input.telefone) : '',
          setor: input.setor ? String(input.setor) : '', status: 'onboarding',
          mensalidade: Number(input.mensalidade) || 0,
          desde: new Date().toISOString().slice(0, 10),
          servicos: Array.isArray(input.servicos) ? input.servicos : [],
        }).select().single()
        if (error) throw error
        return JSON.stringify({ ok: true, mensagem: `Cliente "${data.nome}" criado com status Onboarding.`, id: data.id })
      }

      default:
        return JSON.stringify({ erro: `Ferramenta de escrita desconhecida: ${nome}` })
    }
  } catch (e) {
    return JSON.stringify({ erro: e instanceof Error ? e.message : 'Erro na operação' })
  }
}

// ── Executor das tools ────────────────────────────────────────────────────────
export async function executarToolCRM(nome: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (nome) {
      case 'metricas_gerais': {
        const [{ data: clientes }, { data: campanhas }, { data: transacoes }] = await Promise.all([
          supabase.from('clientes').select('status, mensalidade'),
          supabase.from('campanhas').select('status'),
          supabase.from('transacoes').select('tipo, valor, status, data'),
        ])
        const ativos = (clientes || []).filter(c => c.status === 'ativo')
        const mrr = ativos.reduce((s, c) => s + (c.mensalidade || 0), 0)
        const campAtivas = (campanhas || []).filter(c => c.status === 'ativa').length
        const mesAtual = new Date().toISOString().slice(0, 7)
        const doMes = (transacoes || []).filter(t => (t.data || '').startsWith(mesAtual))
        const receita = doMes.filter(t => t.tipo === 'receita').reduce((s, t) => s + (t.valor || 0), 0)
        const despesa = doMes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + (t.valor || 0), 0)
        return JSON.stringify({
          clientes_total: (clientes || []).length,
          clientes_ativos: ativos.length,
          MRR: brl(mrr), ARR: brl(mrr * 12),
          campanhas_ativas: campAtivas,
          receita_mes: brl(receita), despesa_mes: brl(despesa), lucro_mes: brl(receita - despesa),
        })
      }

      case 'buscar_cliente': {
        const termo = String(input.nome || '')
        const { data: clientes } = await supabase.from('clientes').select('*').ilike('nome', `%${termo}%`).limit(1)
        const cliente = clientes?.[0]
        if (!cliente) return JSON.stringify({ erro: `Nenhum cliente encontrado com "${termo}"` })

        const [{ data: campanhas }, { data: projetos }, { data: transacoes }] = await Promise.all([
          supabase.from('campanhas').select('*').eq('cliente_nome', cliente.nome),
          supabase.from('projetos').select('*').eq('cliente_nome', cliente.nome),
          supabase.from('transacoes').select('*').eq('cliente_nome', cliente.nome),
        ])
        const campAtivas = (campanhas || []).filter(c => c.status === 'ativa')
        const conversoes = (campanhas || []).reduce((s, c) => s + (c.conversoes || 0), 0)
        const projAbertos = (projetos || []).filter(p => p.status !== 'concluido')
        const pendFin = (transacoes || []).filter(t => t.status === 'pendente' || t.status === 'atrasado')

        return JSON.stringify({
          cliente: cliente.nome, setor: cliente.setor, status: cliente.status,
          mensalidade: brl(cliente.mensalidade), cliente_desde: cliente.desde,
          servicos: cliente.servicos,
          campanhas_ativas: campAtivas.length, total_conversoes: conversoes,
          projetos_abertos: projAbertos.map(p => ({ titulo: p.titulo, status: p.status, prazo: p.prazo, progresso: `${p.progresso}%` })),
          pendencias_financeiras: pendFin.map(t => ({ descricao: t.descricao, valor: brl(t.valor), status: t.status })),
        })
      }

      case 'listar_clientes': {
        let q = supabase.from('clientes').select('nome, status, mensalidade, setor')
        if (input.status) q = q.eq('status', String(input.status))
        const { data } = await q.order('mensalidade', { ascending: false })
        return JSON.stringify({
          total: (data || []).length,
          clientes: (data || []).map(c => ({ nome: c.nome, status: c.status, setor: c.setor, mensalidade: brl(c.mensalidade) })),
        })
      }

      case 'campanhas_cliente': {
        const termo = String(input.nome || '')
        const { data } = await supabase.from('campanhas').select('*').ilike('cliente_nome', `%${termo}%`)
        if (!data?.length) return JSON.stringify({ erro: `Nenhuma campanha encontrada para "${termo}"` })
        return JSON.stringify({
          campanhas: data.map(c => ({
            nome: c.nome, canal: c.canal, status: c.status,
            orcamento: brl(c.orcamento), gasto: brl(c.gasto),
            conversoes: c.conversoes, cliques: c.cliques,
            CPL: c.conversoes > 0 ? brl(c.gasto / c.conversoes) : '—',
          })),
        })
      }

      case 'financeiro_cliente': {
        const termo = String(input.nome || '')
        const { data } = await supabase.from('transacoes').select('*').ilike('cliente_nome', `%${termo}%`)
        if (!data?.length) return JSON.stringify({ erro: `Nenhuma transação para "${termo}"` })
        const receitas = data.filter(t => t.tipo === 'receita')
        const pago = receitas.filter(t => t.status === 'pago').reduce((s, t) => s + (t.valor || 0), 0)
        const pendente = receitas.filter(t => t.status === 'pendente').reduce((s, t) => s + (t.valor || 0), 0)
        const atrasado = receitas.filter(t => t.status === 'atrasado').reduce((s, t) => s + (t.valor || 0), 0)
        return JSON.stringify({ recebido: brl(pago), a_receber: brl(pendente), em_atraso: brl(atrasado) })
      }

      default:
        return JSON.stringify({ erro: `Ferramenta desconhecida: ${nome}` })
    }
  } catch (e) {
    return JSON.stringify({ erro: e instanceof Error ? e.message : 'Erro na consulta' })
  }
}
