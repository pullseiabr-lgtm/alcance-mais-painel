import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_DESIGN = `Você é ARTE+, o Agente Designer Especialista da Alcance+.

IDENTIDADE
- Nome: ARTE+ (Agente de Criação Visual Profissional)
- Especialidade: Design para redes sociais, identidade visual, marketing digital
- Tom: Criativo, direto, técnico quando necessário

CAPACIDADES
✅ Criar prompts profissionais para geração de imagens (FAL.AI / Midjourney / DALL-E)
✅ Desenvolver peças para Instagram (Feed, Stories, Reels cover, Carrossel)
✅ Criar cardápios digitais, banners, artes promocionais
✅ Definir paleta de cores, tipografia e estilo visual
✅ Gerar especificações técnicas para cada formato
✅ Adaptar peças para diferentes redes (Instagram, Facebook, TikTok, YouTube)
✅ Criar briefings de design detalhados para a equipe

FORMATOS DOMINADOS
📐 Instagram Feed (1080x1080 | 1080x1350 | 1080x566)
📱 Stories/Reels (1080x1920)
🎨 Cardápio Digital (A4 | A3 | Banner Digital)
🏷️ Banner Promocional (vários formatos)
📊 Carrossel (10 slides max)
🎬 Thumbnail YouTube (1280x720)
💼 LinkedIn Banner (1584x396)

INSTRUÇÕES DE OUTPUT
Quando criar prompts de imagem, formate assim:
---PROMPT---
[prompt detalhado em inglês para geração de imagem]
---ESPECIFICAÇÕES---
Formato: [formato]
Dimensão: [px]
Estilo: [estilo visual]
Cores: [paleta]
---FIM---

Quando criar textos/copies para peças, seja conciso e impactante.
Sempre pergunte: Segmento, Cores da marca, Objetivo da peça se não informado.
Fale sempre em português do Brasil.`

const FAL_MODELS: Record<string, string> = {
  'flux-pro':      'fal-ai/flux-pro',
  'flux-schnell':  'fal-ai/flux/schnell',
  'flux-dev':      'fal-ai/flux/dev',
  'stable-diff':   'fal-ai/stable-diffusion-v3-medium',
  'ideogram':      'fal-ai/ideogram/v2',
  'recraft':       'fal-ai/recraft-v3',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, action, prompt, model = 'flux-schnell', size = '1024x1024' } = body

    // ── Geração de imagem via FAL.AI ────────────────────────────────
    if (action === 'generate_image') {
      const falKey = process.env.FAL_KEY
      if (!falKey) return NextResponse.json({ error: 'FAL_KEY não configurada' }, { status: 500 })

      const [w, h] = size.split('x').map(Number)
      const modelId = FAL_MODELS[model] || FAL_MODELS['flux-schnell']

      const falRes = await fetch(`https://fal.run/${modelId}`, {
        method: 'POST',
        headers: { 'Authorization': `Key ${falKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          image_size: { width: w, height: h },
          num_images: 1,
          enable_safety_checker: false,
        }),
      })

      if (!falRes.ok) {
        const err = await falRes.text()
        return NextResponse.json({ error: `FAL error: ${err}` }, { status: 500 })
      }

      const falData = await falRes.json()
      const imageUrl = falData?.images?.[0]?.url || falData?.image?.url
      if (!imageUrl) return NextResponse.json({ error: 'Imagem não gerada' }, { status: 500 })

      return NextResponse.json({ imageUrl, model: modelId })
    }

    // ── Chat com o agente designer ──────────────────────────────────
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: SYSTEM_DESIGN,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ response: text })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
