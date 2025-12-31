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
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

    const form = await req.formData()
    const file = form.get('file') as File | null
    const tag = String(form.get('tag') || '')
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })
    if (!tag) return NextResponse.json({ error: 'tag is required' }, { status: 400 })

    // ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const hasBucket = (buckets || []).some((b) => b.name === 'products')
    if (!hasBucket) {
      await supabase.storage.createBucket('products', { public: true })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
    const ts = Math.floor(Date.now() / 1000)
    const path = `${tag}/${ts}.${ext}`
    const upload = await supabase.storage.from('products').upload(path, buf, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })
    if (upload.error) {
      return NextResponse.json({ error: upload.error.message }, { status: 500 })
    }
    const pub = supabase.storage.from('products').getPublicUrl(path)
    return NextResponse.json({ url: pub.data.publicUrl, path }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
