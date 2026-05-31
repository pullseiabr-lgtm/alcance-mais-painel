import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 15

export async function GET(req: NextRequest) {
  const falKey = process.env.FAL_KEY
  if (!falKey) return NextResponse.json({ error: 'FAL_KEY não configurada' }, { status: 400 })

  const { searchParams } = new URL(req.url)
  const requestId = searchParams.get('id')
  const model     = searchParams.get('model') ?? 'fal-ai/wan/v2.1/image-to-video'

  if (!requestId) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })

  try {
    const statusRes = await fetch(
      `https://queue.fal.run/${model}/requests/${requestId}/status`,
      { headers: { Authorization: `Key ${falKey}` } },
    )

    if (!statusRes.ok) {
      const err = await statusRes.text()
      return NextResponse.json({ error: `Status check failed: ${err}` }, { status: statusRes.status })
    }

    const status = await statusRes.json()
    // status.status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

    if (status.status === 'COMPLETED') {
      // Busca o resultado completo
      const resultRes = await fetch(
        `https://queue.fal.run/${model}/requests/${requestId}`,
        { headers: { Authorization: `Key ${falKey}` } },
      )
      const result = await resultRes.json()
      const videoUrl = result.video?.url ?? result.videos?.[0]?.url ?? null

      return NextResponse.json({ status: 'COMPLETED', videoUrl, seed: result.seed })
    }

    return NextResponse.json({
      status:   status.status,
      progress: status.queue_position ?? null,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 500 })
  }
}
