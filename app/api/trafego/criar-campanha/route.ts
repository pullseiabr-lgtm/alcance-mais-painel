import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const OBJETIVOS: Record<string, string> = {
  reservas: 'Gerar reservas para o estabelecimento (restaurante, casa de eventos, espaço)',
  delivery: 'Aumentar pedidos via delivery (iFood, app próprio, WhatsApp)',
  evento: 'Vender ingressos / gerar presença em um evento específico',
  festival: 'Divulgar um festival ou ação sazonal de grande porte',
  lancamento: 'Lançar um novo produto, cardápio, unidade ou serviço',
}

const SYSTEM_PROMPT = `Você é o motor de criação automática de campanhas do Alcance Growth AI (módulo Tráfego da Alcance+ Agência de Marketing).

Dado um objetivo de campanha e o contexto do negócio, gere uma ESTRUTURA COMPLETA E ACIONÁVEL de campanha de tráfego pago para Meta Ads e/ou Google Ads, especializada em restaurantes, delivery e eventos no Brasil.

Responda APENAS com um JSON válido (sem markdown, sem texto antes/depois), seguindo exatamente este formato:
{
  "resumo": "string — visão geral da estratégia em 2-3 frases",
  "publico": {
    "descricao": "string",
    "idade": "string (ex: 25-45 anos)",
    "interesses": ["string", "..."],
    "raio_km": "string (se aplicável a negócio local)"
  },
  "orcamento": {
    "sugestao_mensal": "string (ex: R$ 1.500 - R$ 3.000)",
    "distribuicao": [{ "canal": "string", "percentual": "string", "justificativa": "string" }]
  },
  "campanhas": [
    {
      "nome": "string",
      "canal": "string (Meta Ads | Google Ads | TikTok Ads)",
      "objetivo_plataforma": "string (ex: Conversão, Tráfego, Reconhecimento)",
      "fase": "string (ex: Awareness, Consideração, Conversão, Retargeting)",
      "segmentacao": "string"
    }
  ],
  "criativos": [
    { "formato": "string (ex: Reels 9:16, Carrossel, Imagem única)", "sugestao": "string" }
  ],
  "copies": [
    { "headline": "string", "descricao": "string", "cta": "string" }
  ]
}

Seja específico e prático — nada de generalidades. Use valores em reais (R$) e referências reais do mercado brasileiro de food service e eventos.`

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 503 })

  try {
    const { objetivo, contexto } = await req.json()
    if (!objetivo || !OBJETIVOS[objetivo]) {
      return NextResponse.json({ error: 'Objetivo inválido. Use: reservas, delivery, evento, festival ou lancamento.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey })

    const prompt = `Objetivo selecionado: ${OBJETIVOS[objetivo]}

Contexto fornecido pelo usuário (cliente/negócio): ${contexto?.trim() || 'Não informado — use premissas razoáveis para um negócio típico de food service/eventos no Brasil.'}

Gere a estrutura completa de campanha em JSON conforme especificado.`

    const res = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const texto = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/```$/i, '')
      .trim()

    let estrutura
    try {
      estrutura = JSON.parse(texto)
    } catch {
      return NextResponse.json({ error: 'A IA retornou um formato inesperado. Tente novamente.', bruto: texto }, { status: 502 })
    }

    return NextResponse.json({ ok: true, objetivo, estrutura })
  } catch (err) {
    console.error('[trafego/criar-campanha]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro interno' }, { status: 500 })
  }
}
