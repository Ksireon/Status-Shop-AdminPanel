import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/favicon.ico',
  '/_next',
  '/public',
]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))
}

function getRole(req: NextRequest): 'owner' | 'director' | 'manager' | null {
  const role = req.cookies.get('admin_role')?.value || null
  if (role === 'owner' || role === 'director' || role === 'manager') return role
  return null
}

function isAllowed(pathname: string, role: 'owner' | 'director' | 'manager') {
  if (role === 'owner') return true
  const allowedDirector = ['/', '/orders', '/finance', '/branches']
  const allowedManager = ['/', '/orders']
  const dynamicAllowed = (p: string) => p.startsWith('/orders/')
  if (role === 'director') {
    return allowedDirector.includes(pathname) || dynamicAllowed(pathname)
  }
  if (role === 'manager') {
    return allowedManager.includes(pathname) || dynamicAllowed(pathname)
  }
  return false
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (isPublicPath(pathname)) return NextResponse.next()
  const role = getRole(req)
  if (!role) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    return NextResponse.redirect(url)
  }
  if (!isAllowed(pathname, role)) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/).*)'],
}

