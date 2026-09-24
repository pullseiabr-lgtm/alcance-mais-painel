import { NextRequest, NextResponse } from 'next/server'
import { admin, getCtx } from '@/lib/a7-server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const ctx = await getCtx(req)
  if (!ctx) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  if (!ctx.clienteId) return NextResponse.json({ tipo: ctx.tipo, cliente: null })

  const sb = admin()
  const { data: c } = await sb.from('clientes').select('id,nome').eq('id', ctx.clienteId).maybeSingle()
  let nome = ctx.email
  if (ctx.tipo === 'cliente') {
    const { data: a } = await sb.from('a7_acessos').select('nome').eq('email', ctx.email).maybeSingle()
    nome = a?.nome || ctx.email
  }
  return NextResponse.json({ tipo: ctx.tipo, nome, cliente: c ?? { id: ctx.clienteId, nome: 'Cliente' } })
}
