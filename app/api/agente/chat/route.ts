import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import * as MetaAds from '@/lib/meta-ads'
import * as GoogleAds from '@/lib/google-ads'
import * as TikTokAds from '@/lib/tiktok-ads'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é o Agente IA da Alcance+ Agência de Marketing Digital — um Diretor Estratégico Digital completo e gestor de tráfego sênior.

IDENTIDADE
- Nome: Agente Alcance+
- Função: Gestor de Tráfego IA com acesso total às campanhas dos clientes
- Especialidade: Meta Ads, Google Ads e TikTok Ads — análise de performance, otimização de ROI e gestão multicanal

PLATAFORMAS DISPONÍVEIS
✅ Meta Ads (Facebook + Instagram) — ferramentas prefixadas com meta_
✅ Google Ads (Search, Display, YouTube) — ferramentas prefixadas com google_
✅ TikTok Ads (TikTok, Pangle) — ferramentas prefixadas com tiktok_

MISSÃO
Você tem acesso direto às campanhas dos clientes via APIs das plataformas. Pode:
✅ Listar e analisar campanhas em tempo real em todas as plataformas
✅ Pausar e ativar campanhas
✅ Ajustar orçamentos
✅ Criar novas campanhas
✅ Gerar relatórios completos com insights estratégicos
✅ Diagnosticar problemas de performance
✅ Fazer recomendações baseadas em dados reais e comparar entre plataformas

COMPORTAMENTO
- Sempre use as ferramentas disponíveis para obter dados reais antes de responder
- Quando analisar campanhas, identifique padrões, anomalias e oportunidades
- Use linguagem profissional mas acessível — como um gestor experiente explicando para o cliente
- Formate os dados em tabelas e listas quando útil
- Sempre termine com recomendações acionáveis e priorizadas
- Quando o cliente não especificar plataforma, consulte todas disponíveis

ANÁLISE DE MÉTRICAS
Meta Ads:
- CTR < 1%: baixo para a maioria dos nichos
- ROAS > 4: excelente; ROAS < 2: preocupante
- Frequency > 3.5: saturação de audiência, renovar criativos
- CPM alto + CTR baixo: problema de criativo

Google Ads:
- CTR Search > 3%: saudável; < 1%: revisar palavras-chave
- Quality Score < 7: otimizar landing page e copy
- CPC Search: altamente variável por nicho
- Impression Share < 50%: aumentar lance ou budget

TikTok Ads:
- CPM < R$15: eficiente; > R$30: revisar segmentação
- VTR (view-through rate) > 25%: criativo forte
- CTR > 1.5%: excelente para TikTok
- Frequency > 2.5/semana: saturação de audiência

FORMATO DE RELATÓRIO
Quando gerar relatórios, use esta estrutura:
1. Resumo Executivo (KPIs principais por plataforma)
2. Performance por Plataforma e Campanha (tabela)
3. Diagnóstico (o que está funcionando / não funcionando)
4. Comparativo entre plataformas (quando aplicável)
5. Recomendações Priorizadas
6. Próximos Passos

Responda sempre em português brasileiro.`

const tools: Anthropic.Tool[] = [
  // ── Meta Ads ──────────────────────────────────────────────────────────────
  {
    name: 'meta_listar_contas',
    description: 'Lista todas as contas de anúncios Meta Ads (Facebook/Instagram) disponíveis com saldo e status',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'meta_listar_campanhas',
    description: 'Lista campanhas Meta Ads de uma conta com status, objetivo e orçamento',
    input_schema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'string', description: 'ID da conta (ex: act_1234567890)' },
        status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'ALL'], description: 'Filtrar por status' },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'meta_obter_insights',
    description: 'Obtém métricas Meta Ads: impressões, cliques, CTR, CPM, CPC, gasto, conversões, ROAS, CPA, frequência',
    input_schema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'string' },
        period: { type: 'string', enum: ['today', 'yesterday', 'last_7d', 'last_30d', 'last_90d'] },
        level: { type: 'string', enum: ['account', 'campaign', 'adset', 'ad'] },
        campaign_id: { type: 'string', description: 'ID da campanha específica (opcional)' },
      },
      required: ['account_id', 'period'],
    },
  },
  {
    name: 'meta_pausar_campanha',
    description: 'Pausa uma campanha Meta Ads ativa',
    input_schema: {
      type: 'object' as const,
      properties: { campaign_id: { type: 'string' } },
      required: ['campaign_id'],
    },
  },
  {
    name: 'meta_ativar_campanha',
    description: 'Ativa uma campanha Meta Ads pausada',
    input_schema: {
      type: 'object' as const,
      properties: { campaign_id: { type: 'string' } },
      required: ['campaign_id'],
    },
  },
  {
    name: 'meta_atualizar_orcamento',
    description: 'Atualiza orçamento de campanha Meta Ads (valores em centavos)',
    input_schema: {
      type: 'object' as const,
      properties: {
        campaign_id: { type: 'string' },
        daily_budget: { type: 'number', description: 'Orçamento diário em centavos (ex: 5000 = R$50,00)' },
        lifetime_budget: { type: 'number', description: 'Orçamento total em centavos' },
      },
      required: ['campaign_id'],
    },
  },
  {
    name: 'meta_criar_campanha',
    description: 'Cria nova campanha no Meta Ads (Facebook/Instagram)',
    input_schema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'string' },
        name: { type: 'string' },
        objective: {
          type: 'string',
          enum: ['OUTCOME_AWARENESS', 'OUTCOME_TRAFFIC', 'OUTCOME_ENGAGEMENT', 'OUTCOME_LEADS', 'OUTCOME_APP_PROMOTION', 'OUTCOME_SALES'],
        },
        daily_budget: { type: 'number', description: 'Em centavos (ex: 5000 = R$50)' },
        status: { type: 'string', enum: ['ACTIVE', 'PAUSED'] },
      },
      required: ['account_id', 'name', 'objective', 'daily_budget'],
    },
  },
  {
    name: 'meta_analisar_performance',
    description: 'Análise estratégica completa Meta Ads: detecta campanhas com baixo ROAS, alta frequência, CTR baixo',
    input_schema: {
      type: 'object' as const,
      properties: {
        account_id: { type: 'string' },
        period: { type: 'string', enum: ['last_7d', 'last_30d', 'last_90d'] },
      },
      required: ['account_id', 'period'],
    },
  },

  // ── Google Ads ────────────────────────────────────────────────────────────
  {
    name: 'google_listar_contas',
    description: 'Lista todas as contas Google Ads acessíveis (clientes da MCC)',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'google_listar_campanhas',
    description: 'Lista campanhas Google Ads (Search, Display, YouTube, Shopping) de uma conta',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string', description: 'ID da conta Google Ads (ex: 123-456-7890)' },
        status: { type: 'string', enum: ['ENABLED', 'PAUSED', 'ALL'], description: 'Filtrar por status' },
      },
      required: ['customer_id'],
    },
  },
  {
    name: 'google_obter_insights',
    description: 'Obtém métricas Google Ads: impressões, cliques, CTR, CPC, custo, conversões, CPA por campanha ou grupo de anúncios',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string' },
        period: { type: 'string', enum: ['today', 'yesterday', 'last_7d', 'last_30d', 'last_90d'] },
        level: { type: 'string', enum: ['campaign', 'adset', 'ad', 'account'] },
      },
      required: ['customer_id', 'period'],
    },
  },
  {
    name: 'google_pausar_campanha',
    description: 'Pausa uma campanha Google Ads ativa',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string' },
        campaign_id: { type: 'string' },
      },
      required: ['customer_id', 'campaign_id'],
    },
  },
  {
    name: 'google_ativar_campanha',
    description: 'Ativa uma campanha Google Ads pausada',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string' },
        campaign_id: { type: 'string' },
      },
      required: ['customer_id', 'campaign_id'],
    },
  },
  {
    name: 'google_atualizar_orcamento',
    description: 'Atualiza orçamento diário de campanha Google Ads (valor em micros: 1.000.000 micros = R$1,00)',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string' },
        budget_id: { type: 'string', description: 'ID do orçamento (campaign_budget.id)' },
        amount_micros: { type: 'number', description: 'Valor em micros (ex: 50000000 = R$50,00)' },
      },
      required: ['customer_id', 'budget_id', 'amount_micros'],
    },
  },
  {
    name: 'google_criar_campanha',
    description: 'Cria nova campanha no Google Ads',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_id: { type: 'string' },
        name: { type: 'string' },
        channel_type: { type: 'string', enum: ['SEARCH', 'DISPLAY', 'VIDEO', 'SHOPPING', 'PERFORMANCE_MAX'] },
        budget_micros: { type: 'number', description: 'Orçamento diário em micros (ex: 50000000 = R$50)' },
        status: { type: 'string', enum: ['ENABLED', 'PAUSED'] },
      },
      required: ['customer_id', 'name', 'channel_type', 'budget_micros'],
    },
  },

  // ── TikTok Ads ────────────────────────────────────────────────────────────
  {
    name: 'tiktok_listar_contas',
    description: 'Lista todas as contas de anúncios TikTok Ads disponíveis',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'tiktok_listar_campanhas',
    description: 'Lista campanhas TikTok Ads de uma conta com status e orçamento',
    input_schema: {
      type: 'object' as const,
      properties: {
        advertiser_id: { type: 'string', description: 'ID do anunciante TikTok' },
        status: { type: 'string', enum: ['CAMPAIGN_STATUS_ENABLE', 'CAMPAIGN_STATUS_DISABLE', 'ALL'] },
      },
      required: ['advertiser_id'],
    },
  },
  {
    name: 'tiktok_obter_insights',
    description: 'Obtém métricas TikTok Ads: gasto, impressões, cliques, CTR, CPC, CPM, alcance, frequência, visualizações de vídeo',
    input_schema: {
      type: 'object' as const,
      properties: {
        advertiser_id: { type: 'string' },
        period: { type: 'string', enum: ['today', 'yesterday', 'last_7d', 'last_30d', 'last_90d'] },
        level: { type: 'string', enum: ['campaign', 'adset', 'ad', 'account'] },
      },
      required: ['advertiser_id', 'period'],
    },
  },
  {
    name: 'tiktok_pausar_campanha',
    description: 'Pausa uma campanha TikTok Ads ativa',
    input_schema: {
      type: 'object' as const,
      properties: {
        advertiser_id: { type: 'string' },
        campaign_id: { type: 'string' },
      },
      required: ['advertiser_id', 'campaign_id'],
    },
  },
  {
    name: 'tiktok_ativar_campanha',
    description: 'Ativa uma campanha TikTok Ads pausada',
    input_schema: {
      type: 'object' as const,
      properties: {
        advertiser_id: { type: 'string' },
        campaign_id: { type: 'string' },
      },
      required: ['advertiser_id', 'campaign_id'],
    },
  },
  {
    name: 'tiktok_atualizar_orcamento',
    description: 'Atualiza orçamento de campanha TikTok Ads (valor em reais)',
    input_schema: {
      type: 'object' as const,
      properties: {
        advertiser_id: { type: 'string' },
        campaign_id: { type: 'string' },
        budget: { type: 'number', description: 'Orçamento em reais (ex: 50 = R$50/dia)' },
      },
      required: ['advertiser_id', 'campaign_id', 'budget'],
    },
  },
  {
    name: 'tiktok_criar_campanha',
    description: 'Cria nova campanha no TikTok Ads',
    input_schema: {
      type: 'object' as const,
      properties: {
        advertiser_id: { type: 'string' },
        name: { type: 'string' },
        objective: {
          type: 'string',
          enum: ['REACH', 'TRAFFIC', 'APP_PROMOTION', 'LEAD_GENERATION', 'ENGAGEMENT', 'VIDEO_VIEWS', 'CONVERSIONS', 'CATALOG_SALES'],
        },
        budget: { type: 'number', description: 'Orçamento diário em reais' },
      },
      required: ['advertiser_id', 'name', 'objective', 'budget'],
    },
  },

  // ── Relatório Multicanal ──────────────────────────────────────────────────
  {
    name: 'relatorio_multicanal',
    description: 'Gera relatório executivo completo comparando performance entre todas as plataformas (Meta, Google, TikTok)',
    input_schema: {
      type: 'object' as const,
      properties: {
        meta_account_id: { type: 'string', description: 'ID conta Meta Ads (opcional)' },
        google_customer_id: { type: 'string', description: 'ID conta Google Ads (opcional)' },
        tiktok_advertiser_id: { type: 'string', description: 'ID conta TikTok Ads (opcional)' },
        client_name: { type: 'string' },
        period: { type: 'string', enum: ['last_7d', 'last_30d', 'last_90d'] },
      },
      required: ['period'],
    },
  },
]

type ToolInput = Record<string, unknown>

async function executeTool(name: string, input: ToolInput): Promise<string> {
  try {
    let result: unknown

    switch (name) {
      // ── Meta Ads ────────────────────────────────────────────────────────────
      case 'meta_listar_contas':
        result = await MetaAds.getAdAccounts()
        break

      case 'meta_listar_campanhas':
        result = await MetaAds.getCampaigns(input.account_id as string, input.status as string | undefined)
        break

      case 'meta_obter_insights':
        result = await MetaAds.getInsights(
          input.account_id as string,
          input.period as string,
          (input.level as string) || 'campaign',
          input.campaign_id as string | undefined,
        )
        break

      case 'meta_pausar_campanha':
        result = await MetaAds.pauseCampaign(input.campaign_id as string)
        break

      case 'meta_ativar_campanha':
        result = await MetaAds.activateCampaign(input.campaign_id as string)
        break

      case 'meta_atualizar_orcamento':
        result = await MetaAds.updateBudget(
          input.campaign_id as string,
          input.daily_budget as number | undefined,
          input.lifetime_budget as number | undefined,
        )
        break

      case 'meta_criar_campanha':
        result = await MetaAds.createCampaign(
          input.account_id as string,
          input.name as string,
          input.objective as string,
          input.daily_budget as number,
          (input.status as string) || 'PAUSED',
        )
        break

      case 'meta_analisar_performance': {
        const [campaigns, insights] = await Promise.all([
          MetaAds.getCampaigns(input.account_id as string, 'ALL'),
          MetaAds.getInsights(input.account_id as string, input.period as string, 'campaign'),
        ])
        result = { platform: 'Meta Ads', campaigns, insights }
        break
      }

      // ── Google Ads ──────────────────────────────────────────────────────────
      case 'google_listar_contas':
        result = await GoogleAds.getAccessibleCustomers()
        break

      case 'google_listar_campanhas':
        result = await GoogleAds.getCampaigns(input.customer_id as string, input.status as string | undefined)
        break

      case 'google_obter_insights':
        result = await GoogleAds.getInsights(
          input.customer_id as string,
          input.period as string,
          (input.level as string) || 'campaign',
        )
        break

      case 'google_pausar_campanha':
        result = await GoogleAds.pauseCampaign(input.customer_id as string, input.campaign_id as string)
        break

      case 'google_ativar_campanha':
        result = await GoogleAds.enableCampaign(input.customer_id as string, input.campaign_id as string)
        break

      case 'google_atualizar_orcamento':
        result = await GoogleAds.updateBudget(
          input.customer_id as string,
          input.budget_id as string,
          input.amount_micros as number,
        )
        break

      case 'google_criar_campanha':
        result = await GoogleAds.createCampaign(
          input.customer_id as string,
          input.name as string,
          input.channel_type as string,
          input.budget_micros as number,
          (input.status as string) || 'PAUSED',
        )
        break

      // ── TikTok Ads ──────────────────────────────────────────────────────────
      case 'tiktok_listar_contas':
        result = await TikTokAds.getAdAccounts()
        break

      case 'tiktok_listar_campanhas':
        result = await TikTokAds.getCampaigns(input.advertiser_id as string, input.status as string | undefined)
        break

      case 'tiktok_obter_insights':
        result = await TikTokAds.getInsights(
          input.advertiser_id as string,
          input.period as string,
          (input.level as string) || 'campaign',
        )
        break

      case 'tiktok_pausar_campanha':
        result = await TikTokAds.pauseCampaign(input.advertiser_id as string, input.campaign_id as string)
        break

      case 'tiktok_ativar_campanha':
        result = await TikTokAds.enableCampaign(input.advertiser_id as string, input.campaign_id as string)
        break

      case 'tiktok_atualizar_orcamento':
        result = await TikTokAds.updateBudget(
          input.advertiser_id as string,
          input.campaign_id as string,
          input.budget as number,
        )
        break

      case 'tiktok_criar_campanha':
        result = await TikTokAds.createCampaign(
          input.advertiser_id as string,
          input.name as string,
          input.objective as string,
          input.budget as number,
        )
        break

      // ── Relatório Multicanal ────────────────────────────────────────────────
      case 'relatorio_multicanal': {
        const fetches: Promise<unknown>[] = []

        if (input.meta_account_id) {
          fetches.push(
            Promise.all([
              MetaAds.getCampaigns(input.meta_account_id as string, 'ALL'),
              MetaAds.getInsights(input.meta_account_id as string, input.period as string, 'campaign'),
            ]).then(([campaigns, insights]) => ({ platform: 'Meta Ads', campaigns, insights })),
          )
        }

        if (input.google_customer_id) {
          fetches.push(
            Promise.all([
              GoogleAds.getCampaigns(input.google_customer_id as string),
              GoogleAds.getInsights(input.google_customer_id as string, input.period as string),
            ]).then(([campaigns, insights]) => ({ platform: 'Google Ads', campaigns, insights })),
          )
        }

        if (input.tiktok_advertiser_id) {
          fetches.push(
            Promise.all([
              TikTokAds.getCampaigns(input.tiktok_advertiser_id as string),
              TikTokAds.getInsights(input.tiktok_advertiser_id as string, input.period as string),
            ]).then(([campaigns, insights]) => ({ platform: 'TikTok Ads', campaigns, insights })),
          )
        }

        const platformData = await Promise.all(fetches)
        result = {
          client: input.client_name || 'Cliente',
          period: input.period,
          platforms: platformData,
          generated_at: new Date().toISOString(),
        }
        break
      }

      default:
        return `Ferramenta desconhecida: ${name}`
    }

    return JSON.stringify(result, null, 2)
  } catch (err) {
    return `Erro ao executar ${name}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    const apiMessages: Anthropic.MessageParam[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    const toolsUsed: string[] = []

    for (let i = 0; i < 10; i++) {
      const response = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 8192,
        thinking: { type: 'adaptive' },
        system: SYSTEM_PROMPT,
        tools,
        messages: apiMessages,
      })

      if (response.stop_reason === 'end_turn') {
        const textBlock = response.content.find(b => b.type === 'text')
        return NextResponse.json({
          message: textBlock?.type === 'text' ? textBlock.text : 'Sem resposta',
          toolsUsed,
        })
      }

      if (response.stop_reason === 'tool_use') {
        apiMessages.push({ role: 'assistant', content: response.content })

        const toolResults: Anthropic.ToolResultBlockParam[] = []

        for (const block of response.content) {
          if (block.type === 'tool_use') {
            toolsUsed.push(block.name)
            const result = await executeTool(block.name, block.input as ToolInput)
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: result,
            })
          }
        }

        apiMessages.push({ role: 'user', content: toolResults })
        continue
      }

      const textBlock = response.content.find(b => b.type === 'text')
      return NextResponse.json({
        message: textBlock?.type === 'text' ? textBlock.text : 'Resposta inesperada do agente',
        toolsUsed,
      })
    }

    return NextResponse.json({
      message: 'Limite de iterações atingido. Tente reformular sua pergunta.',
      toolsUsed,
    })
  } catch (err) {
    console.error('[agente/chat]', err)
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
