import { NextResponse } from 'next/server'
import { A7_COOKIE } from '@/lib/a7-server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(A7_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
