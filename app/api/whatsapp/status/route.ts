import { NextResponse } from 'next/server'

export async function GET() {
  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME

  const configured = !!(evolutionUrl && evolutionKey && instanceName)

  if (!configured) {
    return NextResponse.json({
      configured: false,
      connected: false,
      message: 'Variáveis EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE_NAME não configuradas no .env.local',
    })
  }

  try {
    const res = await fetch(`${evolutionUrl}/instance/connectionState/${instanceName}`, {
      headers: { apikey: evolutionKey },
      cache: 'no-store',
    })

    if (res.ok) {
      const data = await res.json()
      const state = data.instance?.state ?? data.state
      return NextResponse.json({
        configured: true,
        connected: state === 'open',
        state,
        instanceName,
        evolutionUrl,
      })
    }

    return NextResponse.json({
      configured: true,
      connected: false,
      instanceName,
      evolutionUrl,
      message: `Evolution API retornou ${res.status} — verifique se o servidor está rodando`,
    })
  } catch {
    return NextResponse.json({
      configured: true,
      connected: false,
      instanceName,
      evolutionUrl,
      message: 'Não foi possível conectar com a Evolution API',
    })
  }
}
