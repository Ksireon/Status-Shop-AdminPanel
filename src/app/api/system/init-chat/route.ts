import { NextResponse } from 'next/server'
import { Client } from 'pg'


export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  try {
    if (!apiBase) {
      return NextResponse.json({ error: 'Backend API base url is not configured' }, { status: 500 })
    }
    const res = await fetch(`${apiBase}/system/init-chat`, { method: 'POST' })
    const bodyText = await res.text()
    if (res.ok) {
      return new NextResponse(bodyText, {
        status: res.status,
        headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
      })
    }
    return new NextResponse(bodyText || JSON.stringify({ error: 'Backend init failed' }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed', stack: e?.stack }, { status: 500 })
  }
}
