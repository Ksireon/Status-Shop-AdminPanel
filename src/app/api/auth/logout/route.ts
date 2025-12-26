import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(_: NextRequest) {
  const isSecure = process.env.NODE_ENV === 'production'
  const res = NextResponse.json({ ok: true }, { status: 200 })
  const clear = (name: string) =>
    res.cookies.set(name, '', {
      httpOnly: name.endsWith('_public') ? false : true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
  clear('admin_role')
  clear('admin_role_public')
  clear('admin_email')
  clear('admin_email_public')
  clear('active_branch')
  return res
}

