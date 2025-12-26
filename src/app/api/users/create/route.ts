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
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: 'Missing SUPABASE_SERVICE_ROLE_KEY. Required to create auth users and link profiles.' },
        { status: 500 },
      )
    }
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const payload = {
      email: String(body.email || '').trim(),
      name: String(body.name || '').trim(),
      surname: String(body.surname || '').trim(),
      company: body.company ? String(body.company).trim() : null,
      position: body.position ? String(body.position).trim() : null,
      city: body.city ? String(body.city).trim() : null,
      phone: body.phone ? String(body.phone).trim() : null,
      created_at: new Date().toISOString(),
    }
    if (!payload.email || !payload.name || !payload.surname) {
      return NextResponse.json({ error: 'name, surname and email are required' }, { status: 400 })
    }

    const admin = supabase.auth.admin
    const created = await admin.createUser({
      email: payload.email,
      email_confirm: true,
      user_metadata: {
        name: payload.name,
        surname: payload.surname,
        company: payload.company,
        position: payload.position,
        city: payload.city,
        phone: payload.phone,
      },
    })
    if (created.error) {
      return NextResponse.json({ error: String(created.error.message || 'failed to create auth user') }, { status: 400 })
    }
    const userId = created.data?.user?.id as string
    if (!userId) {
      return NextResponse.json({ error: 'Could not resolve auth user id' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...payload })
      .select('*')
      .single()
    if (error) {
      return NextResponse.json({ error: String(error.message || error) }, { status: 400 })
    }
    return NextResponse.json({ data }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
