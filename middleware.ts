import { NextResponse, type NextRequest } from 'next/server'
import { verificarToken } from '@/lib/auth-session'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Dev bypass — entra direto sem login
  const devBypass = process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
  if (devBypass) {
    if (pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next({ request })
  }

  // Verificar sessão própria (cookie)
  const sessionCookie = request.cookies.get('alcance_session')?.value
  const session = sessionCookie ? verificarToken(sessionCookie) : null

  if (session) {
    // Logado — redirecionar /login → /
    if (pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next({ request })
  }

  // Sem sessão — redirecionar para login (exceto a própria página de login e APIs)
  if (!pathname.startsWith('/login') && !pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
