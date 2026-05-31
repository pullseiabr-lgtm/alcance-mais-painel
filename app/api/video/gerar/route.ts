import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 30

// Usa queue.fal.run para não travar o servidor (polling do client)
const FAL_MODEL_I2V = 'fal-ai/wan/v2.1/image-to-video'
const FAL_MODEL_T2V = 'fal-ai/wan/v2.1/t2v-14B'

const ESTILOS_PROMPT: Record<string, string> = {
  suave:       'gentle subtle camera movement, soft focus, natural motion, calm atmosphere',
  dinamico:    'dynamic energetic motion, cinematic camera movement, vibrant action, professional advertising style',
  cinematico:  'cinematic slow motion, dramatic lighting changes, film-grade quality, epic atmosphere',
  produto:     'professional product reveal, 360 rotation, studio lighting, sharp focus, commercial quality',
  delivery:    'appetizing food motion, steam rising, fresh ingredients, close-up movement, delivery promotion style',
  social:      'trendy social media style, fast-paced, eye-catching motion, viral content aesthetic',
  elegante:    'elegant smooth motion, luxury brand feel, slow subtle movement, premium aesthetic',
}

export async function POST(req: NextRequest) {
  const falKey       = process.env.FAL_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!falKey) {
    return NextResponse.json({ error: 'FAL_KEY não configurada', needsKey: true }, { status: 400 })
  }

  try {
    const { mode, imageBase64, mediaType, userPrompt, estilo, duration, ratio } = await req.json()

    const styleSuffix = ESTILOS_PROMPT[estilo] ?? ESTILOS_PROMPT.suave
    const aspectRatio = ratio ?? '16:9'
    const numFrames   = duration === 8 ? 129 : 81  // ~8s ou ~5s a 16fps

    let finalPrompt = userPrompt || ''

    // Enriquece o prompt com Claude se tiver key
    if (anthropicKey && userPrompt) {
      try {
        const client = new Anthropic({ apiKey: anthropicKey })
        const r = await client.messages.create({
          model: 'claude-opus-4-7',
          max_tokens: 120,
          messages: [{
            role: 'user',
            content: `Improve this video generation prompt for marketing/social media content.
Add cinematic motion details. Keep under 80 words. Return ONLY the improved prompt in English.
Original: "${userPrompt}"
Style: ${estilo} — ${styleSuffix}`,
          }],
        })
        if (r.content[0].type === 'text') {
          finalPrompt = r.content[0].text.trim()
        }
      } catch { /* usa prompt original se Claude falhar */ }
    }

    if (!finalPrompt) finalPrompt = `professional marketing video, ${styleSuffix}, high quality`
    finalPrompt += `, ${styleSuffix}`

    const negativePrompt = 'blurry, low quality, watermark, text overlay, distorted, choppy, flickering, overexposed'

    // ── Prepara body ──────────────────────────────────────────────────────────
    let body: Record<string, unknown>

    if (mode === 'image' && imageBase64) {
      body = {
        image_url:       `data:${mediaType ?? 'image/jpeg'};base64,${imageBase64}`,
        prompt:          finalPrompt,
        negative_prompt: negativePrompt,
        num_frames:      numFrames,
        resolution:      '720p',
        aspect_ratio:    aspectRatio,
      }
    } else {
      // Text-to-video
      body = {
        prompt:          finalPrompt,
        negative_prompt: negativePrompt,
        num_frames:      numFrames,
        resolution:      '720p',
        aspect_ratio:    aspectRatio,
      }
    }

    const model = mode === 'image' ? FAL_MODEL_I2V : FAL_MODEL_T2V

    // ── Envia para fila do fal.ai (não espera o resultado) ────────────────────
    const queueRes = await fetch(`https://queue.fal.run/${model}`, {
      method:  'POST',
      headers: { Authorization: `Key ${falKey}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    if (!queueRes.ok) {
      const err = await queueRes.text()
      return NextResponse.json({ error: `fal.ai (${queueRes.status}): ${err}` }, { status: queueRes.status })
    }

    const { request_id } = await queueRes.json()

    return NextResponse.json({
      requestId: request_id,
      model,
      prompt: finalPrompt,
    })
  } catch (err) {
    console.error('[video/gerar]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro interno' }, { status: 500 })
  }
}
