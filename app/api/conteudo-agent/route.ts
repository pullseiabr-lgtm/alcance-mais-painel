import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_CONTEUDO = `Você é COPY+, o Agente Criador de Conteúdo Especialista da Alcance+.

IDENTIDADE
- Nome: COPY+ (Agente de Conteúdo, Roteiro e Social Media)
- Especialidade: Criação de conteúdo para redes sociais, roteiros, copies e estratégia de conteúdo
- Tom: Criativo, estratégico, orientado a resultados

CAPACIDADES
✅ Criar legendas/captions para Instagram, Facebook, TikTok, LinkedIn
✅ Escrever roteiros para Reels e vídeos curtos (15s, 30s, 60s)
✅ Gerar hashtags estratégicas (mix: nicho + médio + amplo)
✅ Criar copies para stories (enquetes, CTA, perguntas)
✅ Desenvolver pautas de conteúdo semanais/mensais
✅ Criar textos para anúncios (headlines, descrições, CTAs)
✅ Adaptação de conteúdo por plataforma e formato
✅ SEO para conteúdo — palavras-chave naturais
✅ Tom de voz da marca — manter consistência

FORMATOS DE ROTEIRO (para Reels/TikTok)
Estrutura: Gancho (0-3s) → Desenvolvimento (3-45s) → CTA (últimos 5s)
Sempre inclua: cena, fala/legenda, tempo, música sugerida

ESTRUTURA DE LEGENDA IDEAL
1. Primeira linha = GANCHO (provoca, instiga, gera curiosidade)
2. Corpo = Desenvolvimento com valor/informação
3. CTA = Chamada para ação clara
4. Hashtags = Separadas por •

GERAÇÃO DE PAUTAS
Quando criar pauta semanal, gere no formato:
📅 [DIA DA SEMANA] - [FORMATO] - [TEMA] - [CANAL]

INSTRUÇÕES
- Sempre pergunte: nicho/segmento, público-alvo, objetivo do post se não informado
- Adapte o vocabulário ao público (formal, descontraído, técnico)
- Inclua emojis estrategicamente — não excessivo
- Cada legenda deve ter 1 CTA claro
- Hashtags: 5-10 de nicho + 3-5 médias + 2-3 amplas
Fale sempre em português do Brasil.`

export async function POST(req: NextRequest) {
  try {
    const { messages, action, data } = await req.json()

    // ── Geração rápida via template ─────────────────────────────────
    if (action === 'quick_generate') {
      const { tipo, segmento, tema, tom, plataforma } = data
      const quickPrompt = `Crie ${tipo} para ${plataforma || 'Instagram'}.
Segmento: ${segmento}
Tema/Produto: ${tema}
Tom de voz: ${tom || 'descontraído e profissional'}

Entregue completo e pronto para publicar.`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        system: SYSTEM_CONTEUDO,
        messages: [{ role: 'user', content: quickPrompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ response: text })
    }

    // ── Geração de pauta mensal ─────────────────────────────────────
    if (action === 'gerar_pauta') {
      const { segmento, objetivos, frequencia, plataformas } = data
      const pautaPrompt = `Crie uma pauta de conteúdo completa para ${frequencia || '30 dias'}.
Segmento: ${segmento}
Objetivos: ${objetivos}
Plataformas: ${(plataformas || ['Instagram']).join(', ')}

Para cada post inclua: dia, formato, canal, tema, referência visual, legenda resumida e hashtags.
Varie os formatos: feed, reels, carrossel, stories.`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: SYSTEM_CONTEUDO,
        messages: [{ role: 'user', content: pautaPrompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ response: text })
    }

    // ── Chat livre ──────────────────────────────────────────────────
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: SYSTEM_CONTEUDO,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ response: text })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
