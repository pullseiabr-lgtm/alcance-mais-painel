// Gera URL assinada para o navegador subir o arquivo direto ao Storage (evita o limite de 4,5 MB da Vercel)
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { admin, getCtx } from '@/lib/a7-server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const ctx = await getCtx(req)
  if (!ctx) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const { nome, cliente_id } = await req.json()
  const clienteId = ctx.tipo === 'cliente' ? ctx.clienteId : (cliente_id ?? ctx.clienteId)
  if (!clienteId || !nome) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })

  const limpo = String(nome).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${clienteId}/${crypto.randomUUID()}-${limpo}`
  const sb = admin()
  const { data, error } = await sb.storage.from('a7').createSignedUploadUrl(path)
  if (error || !data) return NextResponse.json({ error: error?.message || 'Falha ao gerar upload' }, { status: 500 })
  const { data: pub } = sb.storage.from('a7').getPublicUrl(path)
  return NextResponse.json({ path, token: data.token, url: pub.publicUrl })
}
