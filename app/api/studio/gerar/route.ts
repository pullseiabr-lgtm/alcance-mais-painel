import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

const ESTILOS: Record<string, string> = {
  premium:      'dark moody premium background, deep blacks and charcoal tones, subtle gold/amber accent lighting, luxury brand aesthetic, volumetric fog, cinematic depth',
  moderno:      'clean modern minimal background, soft gradient light gray to white, geometric subtle shapes, contemporary corporate aesthetic, crisp studio look',
  vibrante:     'vibrant bold colorful background, energetic gradient, dynamic diagonal shapes, eye-catching commercial style, high saturation, pop art energy',
  rustico:      'warm rustic textured background, dark wood grain or concrete, natural earthy burnt orange and brown tones, artisan handcrafted feel',
  minimalista:  'ultra minimal background, single soft gradient, large negative space, sophisticated monochromatic palette, Scandinavian design aesthetic',
  festivo:      'festive celebration background, colorful bokeh lights, gold confetti particles, warm party atmosphere, red and gold tones, joyful energy',
  tropical:     'tropical lush background, deep green leaves, vibrant flowers, Brazilian warmth, organic natural textures, food photography backdrop',
  neon:         'neon cyberpunk background, dark base with vivid neon light streaks, purple and cyan glow, futuristic urban night aesthetic',
}

const TAMANHOS: Record<string, { w: number; h: number; label: string; falSize: string }> = {
  feed:      { w: 1080, h: 1080, label: 'Feed Instagram', falSize: 'square_hd' },
  story:     { w: 1080, h: 1920, label: 'Story / Reels',  falSize: 'portrait_16_9' },
  whatsapp:  { w: 800,  h: 800,  label: 'WhatsApp',       falSize: 'square_hd' },
  banner:    { w: 1920, h: 1080, label: 'Banner Web',      falSize: 'landscape_16_9' },
  cardapio:  { w: 1200, h: 900,  label: 'Cardápio',        falSize: 'landscape_4_3' },
  ifood:     { w: 600,  h: 600,  label: 'iFood',           falSize: 'square' },
  linkedin:  { w: 1200, h: 627,  label: 'LinkedIn',        falSize: 'landscape_16_9' },
  tiktok:    { w: 1080, h: 1920, label: 'TikTok',          falSize: 'portrait_16_9' },
}

export async function POST(req: NextRequest) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const falKey       = process.env.FAL_KEY

  if (!anthropicKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada' }, { status: 503 })
  if (!falKey)       return NextResponse.json({ error: 'FAL_KEY não configurada', needsKey: true }, { status: 400 })

  try {
    const { tipo, estilo, titulo, subtitulo, cta, segmento, cor1 } = await req.json()

    const tam   = TAMANHOS[tipo as string] ?? TAMANHOS.feed
    const mood  = ESTILOS[estilo as string] ?? ESTILOS.moderno
    const color = cor1 ?? '#00C4B4'

    // ── 1. Claude gera o prompt visual ideal ─────────────────────────────────
    const client = new Anthropic({ apiKey: anthropicKey })
    const promptRes = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You are an expert art director for Brazilian marketing agencies.

Create a concise image generation prompt (max 100 words, in English) for a ${tam.label} marketing card background.

Context:
- Business segment: ${segmento ?? 'marketing agency'}
- Visual style: ${estilo} — ${mood}
- Brand accent color: ${color}
- Card title will be: "${titulo ?? ''}"

Rules:
1. Describe ONLY the background visual — NO text, NO people, NO faces
2. Leave clean empty space for text overlay (especially center and bottom area)
3. Include: lighting, composition, colors, texture, atmosphere
4. The style must match: ${mood}
5. Output ONLY the prompt, nothing else.`,
      }],
    })

    const visualPrompt = promptRes.content[0].type === 'text'
      ? promptRes.content[0].text.trim()
      : `${mood}, professional marketing background, clean space for text overlay, ${color} accent tones`

    // ── 2. fal.ai — tenta Flux Schnell (rápido) com fallback para Flux Dev ──────
    // flux/schnell: ~3s, grátis nos créditos free, suficiente para backgrounds
    const FAL_MODELS = ['fal-ai/flux/schnell', 'fal-ai/flux/dev']
    let imageUrl: string | undefined

    for (const model of FAL_MODELS) {
      const falRes = await fetch(`https://fal.run/${model}`, {
        method: 'POST',
        headers: { Authorization: `Key ${falKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:              visualPrompt,
          image_size:          tam.falSize,   // 'square_hd', 'landscape_16_9', etc.
          num_inference_steps: model.includes('schnell') ? 4 : 28,
          num_images:          1,
          output_format:       'jpeg',
        }),
      })

      // Lê resposta como texto primeiro para evitar JSON.parse em erros HTML
      const rawText = await falRes.text()

      if (!falRes.ok) {
        console.warn(`[studio/gerar] ${model} falhou (${falRes.status}): ${rawText.slice(0, 200)}`)
        continue  // tenta próximo modelo
      }

      try {
        const falData = JSON.parse(rawText)
        imageUrl = falData.images?.[0]?.url
        if (imageUrl) break  // sucesso
      } catch {
        console.warn(`[studio/gerar] ${model} retornou não-JSON: ${rawText.slice(0, 100)}`)
        continue
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'Nenhum modelo fal.ai retornou imagem. Verifique FAL_KEY.' }, { status: 500 })
    }

    // ── 3. Proxy da imagem gerada ─────────────────────────────────────────────
    const imgRes    = await fetch(imageUrl)
    const imgBuffer = await imgRes.arrayBuffer()

    return new NextResponse(imgBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
        'X-Prompt':  encodeURIComponent(visualPrompt),
        'X-Width':   String(tam.w),
        'X-Height':  String(tam.h),
        'X-Label':   encodeURIComponent(tam.label),
      },
    })
  } catch (err) {
    console.error('[studio/gerar]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro interno' }, { status: 500 })
  }
}
