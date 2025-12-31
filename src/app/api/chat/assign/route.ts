import { NextResponse } from 'next/server'
import { Client } from 'pg'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const conn = process.env.SUPABASE_DB_URL || ''
  const body = await req.json()
  const id = (body?.id || '').toString()
  const role = (body?.assigned_role || '').toString()
  const staff = body?.assigned_staff_id ? (body.assigned_staff_id as string) : null
  if (!id || !role || !['owner','director','manager'].includes(role)) {
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
  }
  try {
    if (apiBase) {
      const res = await fetch(`${apiBase}/chat/rooms/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_role: role, assigned_staff_id: staff })
      })
      const text = await res.text()
      return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
    }
    if (conn) {
      const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
      await client.connect()
      const params: any[] = [role, id]
      let sql = `update public.chat_rooms set assigned_role = $1 where id = $2 returning *`
      if (staff !== null) {
        sql = `update public.chat_rooms set assigned_role = $1, assigned_staff_id = $3 where id = $2 returning *`
        params.push(staff)
      }
      const r = await client.query(sql, params)
      await client.end()
      return NextResponse.json((r.rows?.[0] || null))
    }
    return NextResponse.json({ error: 'No execution path' }, { status: 500 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed', stack: e?.stack }, { status: 500 })
  }
}

