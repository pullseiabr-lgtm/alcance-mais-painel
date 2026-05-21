import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // Manus tasks can take several minutes

const MANUS_BASE = 'https://api.manus.ai'
const POLL_INTERVAL_MS = 5000
const MAX_POLLS = 60 // 5 min max

interface ManusTaskResult {
  ok: boolean
  task_id?: string
  status?: string
  outputs?: Array<{ type: string; url?: string; content?: string }>
  error?: { code: string; message: string }
}

async function manusRequest(path: string, method = 'GET', body?: object) {
  const apiKey = process.env.MANUS_API_KEY
  const res = await fetch(`${MANUS_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-manus-api-key': apiKey!,
    },
    ...(body && { body: JSON.stringify(body) }),
  })
  return res.json() as Promise<ManusTaskResult>
}

async function pollTask(taskId: string): Promise<ManusTaskResult> {
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    const result = await manusRequest(`/v2/task.get?task_id=${taskId}`)
    if (result.status === 'COMPLETED' || result.status === 'SUCCEEDED') return result
    if (result.status === 'FAILED' || result.status === 'ERROR') {
      throw new Error(`Manus task failed: ${JSON.stringify(result)}`)
    }
  }
  throw new Error('Manus task timed out after 5 minutes')
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.MANUS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'MANUS_API_KEY não configurada.',
        howTo:
          'Acesse manus.im → Login → Settings → API Integration → Create API Key e adicione MANUS_API_KEY=sua-chave no .env.local',
      },
      { status: 400 },
    )
  }

  try {
    const { prato, preco, estilo, formato } = await req.json()

    if (!prato) {
      return NextResponse.json({ error: 'Campo "prato" é obrigatório.' }, { status: 400 })
    }

    const formatoDesc = formato === 'story' ? 'vertical 9:16 para Instagram Stories/Reels' : 'quadrado 1:1 para Instagram feed'
    const estiloDesc = estilo || 'cinematográfico premium, fundo escuro, iluminação âmbar quente, slow motion food porn'

    const prompt = `Generate a professional food photography image for Instagram using Nano Banana Pro.

Dish: ${prato}
${preco ? `Price shown in image: R$ ${preco}` : ''}
Format: ${formatoDesc}
Visual style: ${estiloDesc}

Requirements:
- Ultra sharp, high resolution, 4K quality
- Cinematic warm amber lighting with dramatic shadows
- Dark background (near black) to make food pop
- Steam and natural food textures visible
- If price is provided, show it prominently in bold gold text
- Brazilian restaurant aesthetic
- No people visible, only the dish
- Ready to post on Instagram @amore.paiva restaurant

Return only the generated image file.`

    // Create Manus task
    const createResult = await manusRequest('/v2/task.create', 'POST', {
      message: { content: prompt },
    })

    if (!createResult.ok || !createResult.task_id) {
      return NextResponse.json(
        { error: 'Erro ao criar tarefa no Manus', details: createResult },
        { status: 500 },
      )
    }

    const taskId = createResult.task_id

    // Poll until completion
    const finalResult = await pollTask(taskId)

    // Extract image URL from outputs
    const imageOutput = finalResult.outputs?.find(o => o.type === 'image' || o.url?.match(/\.(png|jpg|jpeg|webp)/i))
    const imageUrl = imageOutput?.url

    if (!imageUrl) {
      return NextResponse.json(
        {
          error: 'Tarefa concluída mas nenhuma imagem encontrada',
          task_id: taskId,
          outputs: finalResult.outputs,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      task_id: taskId,
      image_url: imageUrl,
      prato,
      preco,
    })
  } catch (err) {
    console.error('[manus/gerar-imagem]', err)
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
