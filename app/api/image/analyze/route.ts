import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 40

const SYSTEM_PROMPT = `Você é um diretor criativo gastronômico especialista em fotografia de alimentos para delivery, iFood, Instagram e campanhas de restaurante. Analise fotos com olhar técnico e comercial.`

const ANALYSIS_PROMPT = `Analise esta foto de alimento como um expert em food photography e retorne APENAS um JSON (sem markdown) com esta estrutura exata:

{
  "foodType": "nome comercial do prato em português",
  "category": "pizza|hamburguer|sushi|drink|churrasco|sobremesa|massa|frutos_do_mar|geral",
  "description": "descrição curta e apetitosa (max 80 chars)",
  "enhancementSuggestions": ["sugestão específica 1", "sugestão 2", "sugestão 3"],
  "bestContext": "ifood|instagram|delivery|promo|cardapio",
  "prompt": "prompt profissional completo em INGLÊS para melhorar esta foto com IA, específico para este alimento, estilo editorial gastronômico, máximo 120 palavras",
  "qualityScore": 7,
  "issues": ["problema técnico encontrado 1", "problema 2"],
  "strengths": ["ponto forte encontrado 1", "ponto forte 2"]
}

Regras:
- qualityScore: de 1 a 10, sendo 1 foto péssima de celular e 10 campanha profissional
- issues: problemas reais visíveis (iluminação fraca, fundo bagunçado, desfocado, sem apetite, etc.)
- strengths: o que está bom na foto
- bestContext: onde esta foto funcionaria melhor após melhoramento
- prompt: deve mencionar o tipo de alimento, estilo de iluminação ideal, composição, fundo sugerido`

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 503 })
  }

  try {
    const { imageBase64, mediaType } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'Imagem não enviada' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: (mediaType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Remove markdown code blocks if present
    const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    const parsed = JSON.parse(clean)

    // Validate and sanitize
    const result = {
      foodType: String(parsed.foodType || 'Prato não identificado'),
      category: String(parsed.category || 'geral'),
      description: String(parsed.description || ''),
      enhancementSuggestions: Array.isArray(parsed.enhancementSuggestions) ? parsed.enhancementSuggestions.slice(0, 5) : [],
      bestContext: String(parsed.bestContext || 'instagram'),
      prompt: String(parsed.prompt || ''),
      qualityScore: Math.max(1, Math.min(10, Number(parsed.qualityScore) || 5)),
      issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 4) : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4) : [],
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[image/analyze]', err)
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: `Erro na análise: ${msg}` }, { status: 500 })
  }
}
