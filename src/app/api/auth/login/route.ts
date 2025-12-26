import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function verifyCredentials(email: string, password: string): 'owner' | 'director' | 'manager' | null {
  const e = email.trim().toLowerCase()
  const p = password.trim()
  if (e === 'owner@status.shop' && p === 'status1234') return 'owner'
  if (e === 'director@status.shop' && p === 'status4321') return 'director'
  if (e === 'manager@status.shop' && p === 'status2026') return 'manager'
  return null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body.email || '')
    const password = String(body.password || '')
    const role = verifyCredentials(email, password)
    if (!role) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 })
    }
    const isSecure = process.env.NODE_ENV === 'production'
    const maxAge = 7 * 24 * 60 * 60
    const res = NextResponse.json({ ok: true }, { status: 200 })
    res.cookies.set('admin_role', role, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge,
    })
    res.cookies.set('admin_role_public', role, {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge,
    })
    res.cookies.set('admin_email', encodeURIComponent(email), {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge,
    })
    res.cookies.set('admin_email_public', encodeURIComponent(email), {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge,
    })
    if (role === 'owner') {
      res.cookies.set('active_branch', 'all', {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
        maxAge,
      })
    }
    return res
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}

