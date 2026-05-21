import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.EVOLUTION_API_URL
  const key = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE_NAME

  if (!url || !key || !instance) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  try {
    const res = await fetch(`${url}/instance/connect/${instance}`, {
      headers: { apikey: key },
      cache: 'no-store',
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: 'api_error', detail: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      base64: data.base64 ?? null,
      code: data.code ?? null,
      count: data.count ?? null,
      pairingCode: data.pairingCode ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'unreachable' }, { status: 503 })
  }
}
