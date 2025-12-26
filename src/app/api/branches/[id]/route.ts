import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function apiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api/v1'
}

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const store = await cookies()
  const role = store.get('admin_role')?.value || null
  if (role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await ctx.params
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  try {
    const res = await fetch(`${url}/rest/v1/branches?id=eq.${encodeURIComponent(id)}&select=id,name,city,address,phone,card_number`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      cache: 'no-store'
    })
    if (res.ok) {
      const arr = await res.json()
      const r = Array.isArray(arr) ? arr[0] : null
      if (r) {
        const row = {
          id: String(r.id),
          name: typeof r.name === 'string' ? r.name : r?.name?.ru ?? r?.name?.en ?? String(r?.name ?? ''),
          city: typeof r.city === 'string' ? r.city : r?.city?.ru ?? r?.city?.en ?? String(r?.city ?? ''),
          address: r.address ?? '',
          phone: r.phone ?? '',
          card_number: r.card_number ?? ''
        }
        return NextResponse.json(row, { status: 200 })
      }
    }
  } catch {}
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase.from('branches').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data, { status: 200 })
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const store = await cookies()
  const role = store.get('admin_role')?.value || null
  if (role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await ctx.params
  const body = await req.json()
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const payload = {
    name: body.name ? String(body.name).trim() : undefined,
    city: body.city ? String(body.city).trim() : undefined,
    address: body.address ? String(body.address).trim() : undefined,
    phone: body.phone ? String(body.phone).trim() : undefined,
    card_number: body.card_number ? String(body.card_number).trim() : undefined
  }
  const { data, error } = await supabase.from('branches').update(payload).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const store = await cookies()
  const role = store.get('admin_role')?.value || null
  if (role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await ctx.params
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error } = await supabase.from('branches').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 200 })
}
