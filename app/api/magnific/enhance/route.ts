import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 120 // Magnific pode demorar alguns segundos

export async function POST(req: NextRequest) {
  const apiKey = process.env.MAGNIFIC_API_KEY

  if (!apiKey || apiKey === 'COLE_AQUI_SUA_CHAVE_MAGNIFIC') {
    return NextResponse.json(
      {
        error: 'MAGNIFIC_API_KEY não configurada.',
        howTo:
          'Acesse magnific.ai → Configurações → API Keys → Copie sua chave e adicione em .env.local como MAGNIFIC_API_KEY=sua-chave',
      },
      { status: 400 },
    )
  }

  try {
    const body = await req.formData()

    const image = body.get('image') as File | null
    if (!image) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 })
    }

    // Parâmetros de melhoria
    const scaleFactor    = body.get('scaleFactor')    ?? '2'
    const creativity     = body.get('creativity')     ?? '3'
    const hdr            = body.get('hdr')            ?? '0'
    const resemblance    = body.get('resemblance')    ?? '7'
    const prompt         = body.get('prompt')         ?? ''
    const optimizedFor   = body.get('optimizedFor')   ?? 'standard_photography'

    // Monta o form para o Magnific
    const magnificForm = new FormData()
    magnificForm.append('image', image)
    magnificForm.append('scale_factor',           String(scaleFactor))
    magnificForm.append('upscaling_creativity',   String(creativity))
    magnificForm.append('upscaling_hdr',          String(hdr))
    magnificForm.append('upscaling_resonance',    String(resemblance))
    magnificForm.append('optimized_for',          String(optimizedFor))
    if (prompt) magnificForm.append('prompt',     String(prompt))

    const response = await fetch('https://engine.magnific.ai/upscale', {
      method: 'POST',
      headers: {
        'x-magnific-api-key': apiKey,
      },
      body: magnificForm,
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json(
        { error: `Magnific API retornou erro ${response.status}: ${errText}` },
        { status: response.status },
      )
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[magnific/enhance]', err)
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
