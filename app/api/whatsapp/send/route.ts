import { NextRequest, NextResponse } from 'next/server'

function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return digits
  return `55${digits}`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { to, message } = body

  if (!to || !message) {
    return NextResponse.json({ error: 'to e message são obrigatórios' }, { status: 400 })
  }

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME

  if (!evolutionUrl || !evolutionKey || !instanceName) {
    return NextResponse.json({ error: 'Evolution API não configurada' }, { status: 503 })
  }

  const phone = cleanPhone(to)

  try {
    const res = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionKey,
      },
      body: JSON.stringify({
        number: phone,
        options: { delay: 1200, presence: 'composing' },
        textMessage: { text: message },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    return NextResponse.json({ ok: true, phone })
  } catch {
    return NextResponse.json({ error: 'Erro ao conectar com Evolution API' }, { status: 500 })
  }
}
