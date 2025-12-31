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
    const contentType = req.headers.get('content-type') || ''
    const body = contentType.includes('application/json') ? await req.json() : await req.formData()
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const isForm = body instanceof FormData
    const extract = (k: string) => isForm ? body.get(k) : (body as any)[k]
    const parseObj = (v: any) => {
      if (typeof v === 'object' && v !== null) return v
      const s = String(v || '')
      return { en: s }
    }
    const base = {
      name: parseObj(extract('name')),
      description: parseObj(extract('description')),
      type: parseObj(extract('type')),
      image: String(extract('image') || ''),
      color: parseObj(extract('color')),
      price: Number(extract('price') || 0),
      tag: String(extract('tag') || ''),
      created_at: new Date().toISOString(),
    }
    const newCols = { amount: Number(extract('amount') || 0), characteristic: parseObj(extract('characteristic')) }
    const oldCols = { meters: Number(extract('amount') || 0), size: String(extract('characteristic') || '') }
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
        /does not exist/i.test(errMsg) ||
        /jsonb/i.test(errMsg)
      if (needsFallback) {
        const fallbackBase = { 
          ...base, 
          type: typeof base.type === 'object' ? (base.type as any).en || '' : String(base.type || ''),
          color: typeof base.color === 'object' ? (base.color as any).en || '' : String(base.color || ''),
        }
        const fallbackOldCols = { ...oldCols, size: typeof newCols.characteristic === 'object' ? (newCols.characteristic as any).en || '' : String(oldCols.size || '') }
        const { data: d2, error: e2 } = await supabase.from('products').insert({ ...fallbackBase, ...fallbackOldCols }).select('*').single()
        if (e2) {
          // handle duplicate tag gracefully: regenerate and retry once
          const dup = /duplicate key/i.test(e2.message || '')
          if (dup) {
            const rand = Array.from({ length: 4 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36))).join('')
            const newTag = `${fallbackBase.tag}-${rand}`
            const { data: d3, error: e3 } = await supabase.from('products').insert({ ...fallbackBase, ...fallbackOldCols, tag: newTag }).select('*').single()
            if (e3) return NextResponse.json({ error: e3.message }, { status: 500 })
            data = d3
          } else {
            return NextResponse.json({ error: e2.message }, { status: 500 })
          }
        } else {
        data = d2
        }
      } else {
        // duplicate tag on new schema: regenerate and retry
        const dup = /duplicate key/i.test(errMsg || '')
        if (dup) {
          const rand = Array.from({ length: 4 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36))).join('')
          const newTag = `${base.tag}-${rand}`
          const { data: d4, error: e4 } = await supabase.from('products').insert({ ...base, ...newCols, tag: newTag }).select('*').single()
          if (e4) return NextResponse.json({ error: e4.message }, { status: 500 })
          data = d4
        } else {
          return NextResponse.json({ error: errMsg }, { status: 500 })
        }
      }
    }
    // append tag to category resolved by type (name.en === type)
    try {
      const typeName = typeof base.type === 'object' ? String((base.type as any).en || '').trim() : String(base.type || '').trim()
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
