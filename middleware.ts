import { NextResponse, type NextRequest } from 'next/server'
import { verificarToken } from '@/lib/auth-session'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ── Subdomínio de artista (edualves.alcancemais7.com.br) → landing pública ──
  const host = (request.headers.get('host') || '').toLowerCase()
  const BASE = 'alcancemais7.com.br'
  if (host.endsWith(BASE) && host !== BASE && host !== `www.${BASE}`) {
    const sub = host.slice(0, host.length - BASE.length - 1) // remove ".alcancemais7.com.br"
    if (sub && sub !== 'www') {
      const url = request.nextUrl.clone()
      if (pathname === '/') {
        url.pathname = `/artistas/${sub}`
        return NextResponse.rewrite(url)
      }
      // demais caminhos do subdomínio (assets/api) seguem normalmente
    }
  }

  // ── Rotas públicas (não exigem login) ──
  // Endpoints públicos chamados por serviços externos (Evolution/agente Esdras),
  // protegidos por token próprio — não passam pelo login.
  const publicApi = ['/api/auth', '/api/disparos/coletar', '/api/whatsapp/webhook', '/api/whatsapp/cliente', '/api/whatsapp/qr']
  const isPublic =
    pathname === '/' ||                    // apresentação institucional (home pública)
    pathname.startsWith('/login') ||       // tela de acesso ao sistema
    pathname.startsWith('/artistas') ||    // landings públicas de artistas + agente de contratação
    pathname.startsWith('/api/artistas') ||
    publicApi.some(p => pathname.startsWith(p))

  // Dev bypass — entra direto sem login
  const devBypass = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
  if (devBypass) {
    if (pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/painel', request.url))
    }
    return NextResponse.next({ request })
  }

  // Verificar cookie de sessão
  const sessionCookie = request.cookies.get('alcance_session')?.value
  const session = sessionCookie ? await verificarToken(sessionCookie) : null

  if (session) {
    // Usuário logado abrindo a tela de acesso → leva direto ao painel
    if (pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/painel', request.url))
    }
    return NextResponse.next({ request })
  }

  // Sem sessão válida: rotas públicas passam; o restante (painel) vai para o login
  if (isPublic) {
    return NextResponse.next({ request })
  }
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
