import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a

const MEDIATYPE: Record<string, string> = { imagem: 'image', video: 'video', documento: 'document' }

async function enviarEvolution(tipo: string, mensagem: string, mediaUrl: string | null, fileName: string | null, numero: string) {
  const url  = process.env.EVOLUTION_API_URL
  const key  = process.env.EVOLUTION_API_KEY
  const inst = process.env.EVOLUTION_INSTANCE_NAME
  if (!url || !key || !inst) return { ok: false, erro: 'Evolution não configurada' }

  try {
    let endpoint: string, body: Record<string, unknown>
    if (tipo === 'texto' || tipo === 'link') {
      endpoint = `${url}/message/sendText/${inst}`
      body = { number: numero, text: mensagem }
    } else {
      endpoint = `${url}/message/sendMedia/${inst}`
      body = { number: numero, mediatype: MEDIATYPE[tipo] || 'document', media: mediaUrl, caption: mensagem || '', fileName: fileName || 'arquivo' }
    }
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key },
      body: JSON.stringify(body),
    })
    if (!r.ok) { const d = await r.json().catch(() => ({})); return { ok: false, erro: (d as any)?.message || `HTTP ${r.status}` } }
    return { ok: true }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'erro' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { disparo_id, tamanho = 12 } = await req.json()
    if (!disparo_id) return NextResponse.json({ error: 'disparo_id obrigatório' }, { status: 400 })

    const { data: disparo } = await supabase.from('disparos').select('*').eq('id', disparo_id).single()
    if (!disparo) return NextResponse.json({ error: 'Disparo não encontrado' }, { status: 404 })

    // Próximo lote de pendentes
    const { data: pend } = await supabase.from('disparo_envios')
      .select('*').eq('disparo_id', disparo_id).eq('status', 'pendente').limit(tamanho)
    const lote = pend || []

    let enviados = 0, falhas = 0
    for (const e of lote) {
      // respeita opt-out: pula se o contato não está mais ativo
      if (e.contato_id) {
        const { data: c } = await supabase.from('mkt_contatos').select('status').eq('id', e.contato_id).single()
        if (c && c.status !== 'ativo') {
          await supabase.from('disparo_envios').update({ status: 'cancelado', erro: 'opt-out/bloqueado' }).eq('id', e.id)
          continue
        }
      }
      const res = await enviarEvolution(disparo.tipo, disparo.mensagem, disparo.media_url, disparo.file_name, e.telefone)
      if (res.ok) { enviados++; await supabase.from('disparo_envios').update({ status: 'enviado', enviado_em: new Date().toISOString() }).eq('id', e.id) }
      else { falhas++; await supabase.from('disparo_envios').update({ status: 'falha', erro: res.erro }).eq('id', e.id) }
      await sleep(rand(1500, 3500)) // gap leve entre mensagens do mesmo lote
    }

    // Atualiza contadores do disparo
    const novoEnviados = (disparo.enviados || 0) + enviados
    const novoFalhas = (disparo.falhas || 0) + falhas
    const { count: restantes } = await supabase.from('disparo_envios')
      .select('id', { count: 'exact', head: true }).eq('disparo_id', disparo_id).eq('status', 'pendente')
    const concluido = (restantes || 0) === 0
    await supabase.from('disparos').update({
      enviados: novoEnviados, falhas: novoFalhas,
      status: concluido ? 'concluido' : 'enviando', updated_at: new Date().toISOString(),
    }).eq('id', disparo_id)

    return NextResponse.json({ enviados, falhas, restantes: restantes || 0, concluido })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro no lote' }, { status: 500 })
  }
}
