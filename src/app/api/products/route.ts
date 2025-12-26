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
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const base = {
      name: typeof body.name === 'object' ? body.name : { en: String(body.name || '') },
      description: typeof body.description === 'object' ? body.description : { en: String(body.description || '') },
      type: String(body.type || ''),
      image: String(body.image || ''),
      color: String(body.color || ''),
      price: Number(body.price || 0),
      tag: String(body.tag || ''),
      created_at: new Date().toISOString(),
    }
    const newCols = { amount: Number(body.amount || 0), characteristic: String(body.characteristic || '') }
    const oldCols = { meters: Number(body.amount || 0), size: String(body.characteristic || '') }
    if (!base.tag) {
      return NextResponse.json({ error: 'tag is required' }, { status: 400 })
    }
    // try with new schema first
    let data: any = null
    let errMsg: string | null = null
    {
      const { data: d, error: e } = await supabase.from('products').insert({ ...base, ...newCols }).select('*').single()
      data = d
      errMsg = e?.message || null
    }
    if (!data && errMsg) {
      const needsFallback =
        /column .*amount/i.test(errMsg) ||
        /column .*characteristic/i.test(errMsg) ||
        /undefined column/i.test(errMsg) ||
        /does not exist/i.test(errMsg)
      if (needsFallback) {
        const { data: d2, error: e2 } = await supabase.from('products').insert({ ...base, ...oldCols }).select('*').single()
        if (e2) {
          return NextResponse.json({ error: e2.message }, { status: 500 })
        }
        data = d2
      } else {
        return NextResponse.json({ error: errMsg }, { status: 500 })
      }
    }
    // append tag to category resolved by type (name.en === type)
    try {
      const typeName = base.type?.trim()
      if (typeName) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id,tags,name,sort_order')
          .eq('name->>en', typeName)
          .limit(1)
          .maybeSingle()
        let catId = (cat as any)?.id as number | undefined
        if (!catId) {
          const created = await supabase
            .from('categories')
            .insert({ name: { en: typeName }, sort_order: 0, tags: [] })
            .select('id')
            .single()
          catId = (created.data as any)?.id
        }
        if (catId) {
          const { data: current } = await supabase.from('categories').select('tags').eq('id', catId).single()
          const tagsArr = Array.isArray((current as any)?.tags) ? (((current as any).tags as any[]) ?? []) : []
          const newTags = Array.from(new Set([...tagsArr, base.tag]))
          await supabase.from('categories').update({ tags: newTags }).eq('id', catId)
        }
      }
    } catch {
      // ignore category tagging errors to not block product creation
    }
    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
