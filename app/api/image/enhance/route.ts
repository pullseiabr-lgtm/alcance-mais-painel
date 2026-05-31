import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 90

// fal.ai Clarity Upscaler — ideal para food photography
// Configurações conservadoras: preserva aparência natural dos alimentos (sem queijo plástico)
const FAL_ENDPOINT = 'https://fal.run/fal-ai/clarity-upscaler'

// Parâmetros específicos por categoria para Editor Humanizado
const CATEGORY_PARAMS: Record<string, { creativity: number; resemblance: number }> = {
  sushi:         { creativity: 0.20, resemblance: 0.90 }, // Máxima fidelidade — frescor natural
  frutos_do_mar: { creativity: 0.20, resemblance: 0.90 },
  sobremesa:     { creativity: 0.30, resemblance: 0.80 },
  pizza:         { creativity: 0.28, resemblance: 0.82 },
  hamburguer:    { creativity: 0.30, resemblance: 0.80 },
  churrasco:     { creativity: 0.28, resemblance: 0.82 },
  massa:         { creativity: 0.28, resemblance: 0.82 },
  drink:         { creativity: 0.25, resemblance: 0.85 },
  geral:         { creativity: 0.25, resemblance: 0.85 },
}

export async function POST(req: NextRequest) {
  const falKey = process.env.FAL_KEY

  if (!falKey) {
    return NextResponse.json(
      {
        error: 'FAL_KEY não configurada.',
        needsKey: true,
        howTo: 'Acesse fal.ai/dashboard/keys → Add key → Copie e adicione FAL_KEY=sua-chave no .env.local',
      },
      { status: 400 },
    )
  }

  try {
    const { imageBase64, mediaType, prompt, category } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'Imagem não enviada' }, { status: 400 })
    }

    const params = CATEGORY_PARAMS[category] || CATEGORY_PARAMS.geral
    const imageDataUrl = `data:${mediaType || 'image/jpeg'};base64,${imageBase64}`

    const response = await fetch(FAL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageDataUrl,
        scale_factor: 2,
        creativity: params.creativity,
        resemblance: params.resemblance,
        prompt: prompt || 'professional food photography, appetizing, sharp details, warm studio lighting, restaurant quality, natural textures',
        negative_prompt: 'blurry, noisy, plastic, artificial, fake food, overprocessed, low quality, watermark',
        enable_safety_checker: false,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[image/enhance fal.ai]', response.status, errText)
      return NextResponse.json(
        { error: `fal.ai retornou erro ${response.status}: ${errText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    const imageUrl = data.image?.url

    if (!imageUrl) {
      console.error('[image/enhance] fal.ai response:', JSON.stringify(data))
      return NextResponse.json({ error: 'fal.ai não retornou imagem' }, { status: 500 })
    }

    // Proxy a imagem para evitar problemas de CORS no canvas export
    const imgRes = await fetch(imageUrl)
    const imgBuffer = await imgRes.arrayBuffer()
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(imgBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[image/enhance]', err)
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
