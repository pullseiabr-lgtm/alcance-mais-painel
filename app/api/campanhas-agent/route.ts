import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_CAMPANHAS = `Você é TRAFFIC+, o Agente Especialista em Tráfego Pago e Campanhas da Alcance+.

IDENTIDADE
- Nome: TRAFFIC+ (Gestor de Tráfego Sênior IA)
- Especialidade: Meta Ads, Google Ads, TikTok Ads — criação, análise e otimização
- Abordagem: Focado em ROI, ROAS e resultados mensuráveis

CAPACIDADES
✅ Analisar performance de campanhas (Meta/Google/TikTok)
✅ Diagnosticar problemas: CPM alto, CTR baixo, CPA fora de meta
✅ Criar estrutura completa de campanhas (campanha → conjunto → anúncio)
✅ Gerar copies persuasivas para anúncios (headline + descrição + CTA)
✅ Recomendar segmentações de público (interesses, lookalike, remarketing)
✅ Calcular orçamentos e projeções de resultado
✅ Auditar contas de anúncio e identificar desperdiço
✅ Criar relatórios de performance com insights e próximos passos

FRAMEWORK DE ANÁLISE DE CAMPANHAS
Sempre avalie:
📊 MÉTRICAS PRINCIPAIS: CPM, CTR, CPC, CPA/CPL, ROAS, Frequência
🎯 QUALIDADE: Score de relevância, taxa de conversão, taxa de saída
💰 EFICIÊNCIA: Custo por resultado vs meta, retorno sobre investimento
🔄 FUNIL: Topo (alcance) → Meio (engajamento) → Fundo (conversão)

BENCHMARKS POR SEGMENTO
- E-commerce: CTR >1,5% | ROAS >3x | CPC <R$2,00
- Serviços: CTR >1% | CPL <R$30 | Conv. Rate >5%
- Restaurantes/Delivery: CPM <R$15 | CTR >1,5% | CPC <R$1,50
- Infoprodutos: CTR >2% | CPA <30% do ticket | ROAS >4x

ESTRUTURA DE CAMPANHA (quando criar)
Formate assim:
🏗️ ESTRUTURA DA CAMPANHA
Campanha: [nome] — [objetivo] — Orçamento: R$ X/dia
│
├── Conjunto 1: [nome] — Público: [descrição]
│   ├── Anúncio A: [formato] — [copy]
│   └── Anúncio B: [formato] — [copy]
└── Conjunto 2: [nome] — Público: [descrição]

Fale sempre em português do Brasil. Seja assertivo e baseado em dados.`

export async function POST(req: NextRequest) {
  try {
    const { messages, action, data } = await req.json()

    // ── Criar estrutura de campanha ─────────────────────────────────
    if (action === 'criar_campanha') {
      const {
        objetivo, segmento, produto, publico, orcamento,
        plataforma, periodo, diferencial, cta
      } = data

      const campPrompt = `Crie uma campanha completa de ${plataforma || 'Meta Ads'}.

BRIEFING
Objetivo: ${objetivo}
Produto/Serviço: ${produto}
Segmento: ${segmento}
Público-alvo: ${publico}
Orçamento disponível: R$ ${orcamento}/mês
Período: ${periodo || '30 dias'}
Diferencial: ${diferencial || 'não informado'}
CTA desejado: ${cta || 'não informado'}

Entregue:
1. Estrutura completa (campanhas, conjuntos, anúncios)
2. Segmentações recomendadas (interesses, comportamentos, lookalike)
3. Copies de anúncios (3 variações: direto, emocional, prova social)
4. Orçamento distribuído entre as campanhas
5. KPIs esperados e metas de resultado
6. Configurações técnicas importantes`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: SYSTEM_CAMPANHAS,
        messages: [{ role: 'user', content: campPrompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ response: text })
    }

    // ── Analisar performance de campanha ────────────────────────────
    if (action === 'analisar_campanha') {
      const {
        nome, plataforma, periodo, orcamento_gasto,
        impressoes, alcance, cliques, ctr, cpc, conversoes,
        cpa, roas, frequencia, objetivo
      } = data

      const analyzePrompt = `Analise esta campanha e gere diagnóstico completo com recomendações.

DADOS DA CAMPANHA
Nome: ${nome || 'Campanha'}
Plataforma: ${plataforma || 'Meta Ads'}
Período: ${periodo || '30 dias'}
Objetivo: ${objetivo || 'conversão'}

MÉTRICAS
Orçamento gasto: R$ ${orcamento_gasto}
Impressões: ${impressoes?.toLocaleString('pt-BR') || '?'}
Alcance: ${alcance?.toLocaleString('pt-BR') || '?'}
Cliques: ${cliques?.toLocaleString('pt-BR') || '?'}
CTR: ${ctr || '?'}%
CPC: R$ ${cpc || '?'}
Conversões: ${conversoes || '?'}
CPA: R$ ${cpa || '?'}
ROAS: ${roas || '?'}x
Frequência: ${frequencia || '?'}x

Gere: diagnóstico detalhado, o que está bom, o que precisa melhorar, 5 ações imediatas de otimização.`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        system: SYSTEM_CAMPANHAS,
        messages: [{ role: 'user', content: analyzePrompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ response: text })
    }

    // ── Gerar copies de anúncio ─────────────────────────────────────
    if (action === 'gerar_copies') {
      const { produto, publico, diferencial, cta, formato, tom } = data

      const copyPrompt = `Crie 5 variações de copy para anúncio ${formato || 'de conversão'}.
Produto: ${produto}
Público: ${publico}
Diferencial: ${diferencial}
CTA: ${cta || 'Saiba mais'}
Tom: ${tom || 'persuasivo e direto'}

Para cada copy: headline (máx 40 chars) + texto principal (máx 125 chars) + CTA`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        system: SYSTEM_CAMPANHAS,
        messages: [{ role: 'user', content: copyPrompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ response: text })
    }

    // ── Auditoria de conta ──────────────────────────────────────────
    if (action === 'auditoria') {
      const { dados, plataforma } = data
      const auditPrompt = `Realize auditoria completa desta conta ${plataforma}:
${JSON.stringify(dados, null, 2)}

Identifique: desperdícios de orçamento, campanhas ineficientes, oportunidades perdidas, configurações incorretas, e gere plano de otimização.`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 3000,
        system: SYSTEM_CAMPANHAS,
        messages: [{ role: 'user', content: auditPrompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ response: text })
    }

    // ── Chat livre ──────────────────────────────────────────────────
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: SYSTEM_CAMPANHAS,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ response: text })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
