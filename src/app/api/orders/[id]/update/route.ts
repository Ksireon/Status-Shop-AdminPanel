import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Role = 'owner' | 'director' | 'manager'

function filterPayload(role: Role, body: any) {
  const base = {
    status: body.status,
    delivery_type: body.delivery_type,
    delivery_address: body.delivery_address ?? null,
    payment_method: body.payment_method,
  } as Record<string, any>
  if (role === 'owner') {
    base.branch = body.branch
    base.branch_address = body.branch_address
    base.name = body.name
    base.email = body.email
    base.phone = body.phone
  } else if (role === 'director') {
    base.name = body.name
    base.email = body.email
    base.phone = body.phone
  }
  Object.keys(base).forEach((k) => {
    const v = base[k]
    if (typeof v === 'undefined') delete base[k]
  })
  return base
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const store = await cookies()
  const role = (store.get('admin_role')?.value || null) as Role | null
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const payload = filterPayload(role, body)
  if (!Object.keys(payload).length) {
    return NextResponse.json({ error: 'No allowed fields to update' }, { status: 400 })
  }
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error } = await supabase.from('orders').update(payload).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 200 })
}

