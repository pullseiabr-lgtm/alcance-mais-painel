import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Detecta qual agente usar baseado na mensagem ──────────────────────────────

function detectAgent(text: string): 'figueiredo' | 'trafego' | 'editor' | 'ifood' | 'dev' | 'geral' {
  const lower = text.toLowerCase()

  // FIGUEIREDO é o agente padrão para demandas operacionais, comerciais e estratégicas
  if (/(alcance|figueiredo|campanha completa|planejamento|briefing|proposta|cliente|vendas|comercial|operação|operacao|relatorio|relatório|estratégia|estrategia|crescimento|reunião|reuniao)/.test(lower))
    return 'figueiredo'

  if (/(ifood|cardápio|cardapio|delivery|pedido|marmita|hamburguer|pizza|lanche|avaliação|ranqueamento)/.test(lower))
    return 'ifood'

  if (/(reel|video|vídeo|editar|edição|edicao|corte|legenda|música|musica|criativo|viral)/.test(lower))
    return 'editor'

  if (/(meta ads|google ads|tráfego|trafego|roas|ctr|cpc|orçamento|orcamento|pausar|ativar|anuncio|anúncio)/.test(lower))
    return 'trafego'

  if (/(instalar|instalação|instalacao|erro|bug|código|codigo|deploy|servidor|api|configurar|programar)/.test(lower))
    return 'dev'

  return 'figueiredo'
}

// ── System prompts por agente ─────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  figueiredo: `Você é FIGUEIREDO, Gerente de Operações da Alcance. Responda via WhatsApp de forma executiva e direta.
Coordene os agentes: COPYMASTER, SOCIAL MEDIA, DESIGNER, VIDEO EDITOR, TRÁFEGO, COMERCIAL, FINANCEIRO.
Estruture sempre: Demanda → Prioridade → Agentes → Plano rápido. Máximo 800 caracteres. Use emojis e negrito (*texto*).`,

  trafego: `Você é o Agente de Tráfego IA da Alcance+. Responda de forma concisa e direta via WhatsApp.
Especialidade: Meta Ads, Google Ads, TikTok Ads. Máximo 500 caracteres por resposta. Use emojis.`,

  editor: `Você é o Editor de Vídeos IA da Alcance+. Responda de forma concisa e direta via WhatsApp.
Especialidade: Reels, TikTok, anúncios em vídeo. Máximo 500 caracteres por resposta. Use emojis.`,

  ifood: `Você é o Expert iFood da Alcance+. Responda de forma concisa e direta via WhatsApp.
Especialidade: iFood, delivery, cardápio, algoritmo da plataforma. Máximo 500 caracteres por resposta. Use emojis.`,

  dev: `Você é o Developer IA da Alcance+. Responda de forma concisa e direta via WhatsApp.
Especialidade: programação, instalação, configuração de sistemas. Máximo 500 caracteres por resposta. Use emojis.`,

  geral: `Você é FIGUEIREDO, Gerente de Operações da Alcance. Responda de forma executiva e direta via WhatsApp.
Máximo 500 caracteres. Use emojis.`,
}

// ── Envia mensagem via Evolution API ─────────────────────────────────────────

async function sendWhatsAppMessage(to: string, message: string) {
  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME

  if (!evolutionUrl || !evolutionKey || !instanceName) {
    console.error('Evolution API não configurada')
    return
  }

  try {
    await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionKey,
      },
      body: JSON.stringify({
        number: to,
        options: { delay: 1200, presence: 'composing' },
        textMessage: { text: message },
      }),
    })
  } catch (err) {
    console.error('Erro ao enviar mensagem WhatsApp:', err)
  }
}

// ── Gera resposta com IA ──────────────────────────────────────────────────────

async function generateResponse(userMessage: string, agentType: string): Promise<string> {
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: SYSTEM_PROMPTS[agentType] || SYSTEM_PROMPTS.geral,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    return textBlock?.type === 'text' ? textBlock.text : 'Desculpe, não consegui processar sua mensagem.'
  } catch {
    return '❌ Erro interno. Tente novamente em instantes.'
  }
}

// ── Webhook GET (verificação do Evolution API) ────────────────────────────────

export async function GET() {
  return NextResponse.json({ status: 'Alcance+ WhatsApp Webhook ativo' })
}

// ── Webhook POST (recebe mensagens) ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Evolution API envia eventos com estrutura específica
    const event = body.event
    const data = body.data

    // Ignorar eventos que não sejam mensagens recebidas
    if (event !== 'messages.upsert') {
      return NextResponse.json({ ok: true })
    }

    // Ignorar mensagens enviadas pelo próprio bot
    if (data?.key?.fromMe) {
      return NextResponse.json({ ok: true })
    }

    const from = data?.key?.remoteJid
    const messageText =
      data?.message?.conversation ||
      data?.message?.extendedTextMessage?.text ||
      ''

    if (!from || !messageText.trim()) {
      return NextResponse.json({ ok: true })
    }

    // Detecta agente e gera resposta
    const agentType = detectAgent(messageText)
    const response = await generateResponse(messageText, agentType)

    // Envia resposta de volta ao usuário
    await sendWhatsAppMessage(from, response)

    return NextResponse.json({ ok: true, agent: agentType })
  } catch (err) {
    console.error('[whatsapp/webhook]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
