import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function apiBase() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api/v1'
}

export async function GET(_: NextRequest) {
  const store = await cookies()
  const role = store.get('admin_role')?.value || null
  if (role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json([], { status: 200 })
  try {
    const res = await fetch(`${url}/rest/v1/branches?select=id,name,city,address,phone,card_number`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      cache: 'no-store'
    })
    if (res.ok) {
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      const normalized = list.map((r: any) => ({
        id: String(r.id),
        name: typeof r.name === 'string' ? r.name : r?.name?.ru ?? r?.name?.en ?? String(r?.name ?? ''),
        city: typeof r.city === 'string' ? r.city : r?.city?.ru ?? r?.city?.en ?? String(r?.city ?? ''),
        address: r.address ?? '',
        phone: r.phone ?? '',
        card_number: r.card_number ?? ''
      }))
      return NextResponse.json(normalized, { status: 200 })
    }
  } catch {}
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase.from('branches').select('id,name,city,address,phone,card_number')
  if (error) return NextResponse.json([], { status: 200 })
  const list = Array.isArray(data) ? data : []
  const normalized = list.map((r: any) => ({
    id: String((r as any).id),
    name: typeof (r as any).name === 'string' ? (r as any).name : (r as any)?.name?.ru ?? (r as any)?.name?.en ?? String((r as any)?.name ?? ''),
    city: typeof (r as any).city === 'string' ? (r as any).city : (r as any)?.city?.ru ?? (r as any)?.city?.en ?? String((r as any)?.city ?? ''),
    address: (r as any).address ?? '',
    phone: (r as any).phone ?? '',
    card_number: (r as any).card_number ?? ''
  }))
  return NextResponse.json(normalized, { status: 200 })
}

export async function POST(req: NextRequest) {
  const store = await cookies()
  const role = store.get('admin_role')?.value || null
  if (role !== 'owner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const payload = {
    name: String(body.name || '').trim(),
    city: body.city ? String(body.city).trim() : null,
    address: body.address ? String(body.address).trim() : null,
    phone: body.phone ? String(body.phone).trim() : null,
    card_number: body.card_number ? String(body.card_number).trim() : null
  }
  if (!payload.name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
  const { data, error } = await supabase.from('branches').insert(payload).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 200 })
}
