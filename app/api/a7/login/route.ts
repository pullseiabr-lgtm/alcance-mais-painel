import { NextRequest, NextResponse } from 'next/server'
import { A7_COOKIE, admin, hashSenha, tokenCliente } from '@/lib/a7-server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()
    if (!email || !senha) return NextResponse.json({ error: 'Informe e-mail e senha' }, { status: 400 })

    const sb = admin()
    const { data: a } = await sb.from('a7_acessos').select('*')
      .eq('email', String(email).trim().toLowerCase()).eq('ativo', true).maybeSingle()
    if (!a || a.senha_hash !== hashSenha(senha)) {
      return NextResponse.json({ error: 'E-mail ou senha inválidos' }, { status: 401 })
    }
    await sb.from('a7_acessos').update({ ultimo_login: new Date().toISOString() }).eq('id', a.id)

    const res = NextResponse.json({ ok: true, nome: a.nome })
    res.cookies.set(A7_COOKIE, await tokenCliente(a.email, a.cliente_id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
