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
    const { userId } = await req.json()
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey || !userId) {
      return NextResponse.json({ error: 'Missing Supabase config or userId' }, { status: 400 })
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    // Cascade delete dependent records to satisfy FK constraints
    const { error: ordersErr } = await supabase.from('orders').delete().eq('user_id', userId)
    if (ordersErr) return NextResponse.json({ error: `orders: ${ordersErr.message}` }, { status: 500 })
    const { error: cartErr } = await supabase.from('cart_items').delete().eq('user_id', userId)
    if (cartErr) return NextResponse.json({ error: `cart_items: ${cartErr.message}` }, { status: 500 })
    const { error: profileErr } = await supabase.from('profiles').delete().eq('id', userId)
    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

    const { error: authErr } = await supabase.auth.admin.deleteUser(userId)
    if (authErr) {
      // If auth deletion fails, the profile is already removed; return warning but success
      return NextResponse.json({ ok: true, warn: authErr.message }, { status: 200 })
    }
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
