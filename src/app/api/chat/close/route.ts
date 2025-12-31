import { NextResponse } from 'next/server'
import { Client } from 'pg'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const conn = process.env.SUPABASE_DB_URL || ''
  const body = await req.json()
  const id = (body?.id || '').toString()
  if (!id) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }
  try {
    if (apiBase) {
      const res = await fetch(`${apiBase}/chat/rooms/${id}/close`, { method: 'POST' })
      const text = await res.text()
      return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
    }
    if (conn) {
      const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
      await client.connect()
      const r = await client.query(`update public.chat_rooms set status='closed', closed_at=now() where id=$1 returning *`, [id])
      await client.end()
      return NextResponse.json((r.rows?.[0] || null))
    }
    return NextResponse.json({ error: 'No execution path' }, { status: 500 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed', stack: e?.stack }, { status: 500 })
  }
}

