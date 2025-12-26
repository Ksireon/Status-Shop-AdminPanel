import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const store = await cookies()
    const role = store.get('admin_role')?.value || null
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await req.json()
    const userId = String(body.userId || '')
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey || !userId) {
      return NextResponse.json({ error: 'Missing Supabase config or userId' }, { status: 400 })
    }
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    const payload = {
      name: body.name ? String(body.name).trim() : undefined,
      surname: body.surname ? String(body.surname).trim() : undefined,
      company: body.company ? String(body.company).trim() : undefined,
      position: body.position ? String(body.position).trim() : undefined,
      city: body.city ? String(body.city).trim() : undefined,
      phone: body.phone ? String(body.phone).trim() : undefined
    }
    const { data, error } = await supabase.from('profiles').update(payload).eq('id', userId).select().single()
    if (error || !data) return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 })
    const { error: metaErr } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        name: payload.name,
        surname: payload.surname,
        company: payload.company,
        position: payload.position,
        city: payload.city,
        phone: payload.phone
      }
    })
    if (metaErr) {
      return NextResponse.json({ ok: true, warn: metaErr.message, profile: data }, { status: 200 })
    }
    return NextResponse.json({ ok: true, profile: data }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
