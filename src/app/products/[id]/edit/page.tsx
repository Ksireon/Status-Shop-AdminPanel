'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'

type Lang = 'ru' | 'uz' | 'en'
type FormState = {
  id?: number
  name: Record<Lang, string>
  description: Record<Lang, string>
  price: number
  type: Record<Lang, string>
  color: Record<Lang, string>
  amount: number
  characteristic: Record<Lang, string>
  image: string
  tag: string
  category_id?: number | null
}

export default function ProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const productId = String(params.id as string || '')
  const productIdNum = Number(productId || NaN)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeLang, setActiveLang] = useState<Lang>('ru')
  const [form, setForm] = useState<FormState>({
    name: { ru: '', uz: '', en: '' },
    description: { ru: '', uz: '', en: '' },
    price: 0,
    type: { ru: '', uz: '', en: '' },
    color: { ru: '', uz: '', en: '' },
    amount: 0,
    characteristic: { ru: '', uz: '', en: '' },
    image: '',
    tag: '',
    category_id: null,
  })
  const textFromMulti = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>
      return (String(obj['ru'] || obj['uz'] || obj['en'] || '')).trim()
    }
    return ''
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes('example.supabase.co')
        ) {
          setLoading(false)
          return
        }
        if (!Number.isFinite(productIdNum)) {
          setLoading(false)
          return
        }
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productIdNum)
          .single()
        if (error) throw error
        const row = (data as any) || {}
        const parseToObj = (v: any) => {
          if (v && typeof v === 'object') return v as Record<string, string>
          const s = String(v || '')
          if (s.trim().startsWith('{')) {
            try {
              const o = JSON.parse(s)
              if (o && typeof o === 'object') return o as Record<string, string>
            } catch {}
          }
          return { en: s }
        }
        setForm({
          id: row.id,
          name: (() => { const o = parseToObj(row.name); return { ru: o.ru || '', uz: o.uz || '', en: o.en || '' } })(),
          description: (() => { const o = parseToObj(row.description); return { ru: o.ru || '', uz: o.uz || '', en: o.en || '' } })(),
          price: Number(row.price || 0),
          type: (() => { const o = parseToObj(row.type); return { ru: o.ru || '', uz: o.uz || '', en: o.en || '' } })(),
          color: (() => { const o = parseToObj(row.color); return { ru: o.ru || '', uz: o.uz || '', en: o.en || '' } })(),
          amount: Number(row.amount || 0),
          characteristic: (() => { const o = parseToObj(row.characteristic); return { ru: o.ru || '', uz: o.uz || '', en: o.en || '' } })(),
          image: String(row.image || ''),
          tag: String(row.tag || ''),
          category_id: row.category_id ?? null,
        })
      } catch (e) {
        console.warn('Failed to load product', e)
        alert('Не удалось загрузить товар')
      } finally {
        setLoading(false)
      }
    }
    if (productId) load()
  }, [productId])

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))
  const setLangField = (k: keyof Pick<FormState, 'name' | 'description' | 'type' | 'color' | 'characteristic'>, v: string) =>
    setForm((f) => ({ ...f, [k]: { ...f[k], [activeLang]: v } }))

  const onSave = async () => {
    try {
      setSaving(true)
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes('example.supabase.co')
      ) {
        alert('Supabase не сконфигурирован')
        return
      }
      const base = {
        name: { ru: form.name.ru || '', uz: form.name.uz || '', en: form.name.en || '' },
        description: { ru: form.description.ru || '', uz: form.description.uz || '', en: form.description.en || '' },
        price: Number(form.price ?? 0),
        type: { ru: form.type.ru || '', uz: form.type.uz || '', en: form.type.en || '' },
        color: { ru: form.color.ru || '', uz: form.color.uz || '', en: form.color.en || '' },
        image: form.image ?? '',
      }
      const newCols = { amount: Number(form.amount ?? 0), characteristic: { ru: form.characteristic.ru || '', uz: form.characteristic.uz || '', en: form.characteristic.en || '' } }
      const oldCols = { meters: Number(form.amount ?? 0), size: String(form.characteristic.en || '') }
      let errMsg: string | null = null
      {
        if (!Number.isFinite(productIdNum)) throw new Error('Invalid product id')
        const { error } = await supabase.from('products').update({ ...base, ...newCols }).eq('id', productIdNum)
        errMsg = error?.message || null
      }
      if (errMsg) {
        const needsFallback =
          /column .*amount/i.test(errMsg) ||
          /column .*characteristic/i.test(errMsg) ||
          /undefined column/i.test(errMsg) ||
          /does not exist/i.test(errMsg) ||
          /jsonb/i.test(errMsg)
        if (needsFallback) {
          const fallbackBase = {
            ...base,
            type: String((base.type as any)?.en || ''),
            color: String((base.color as any)?.en || ''),
          }
          const { error: e2 } = await supabase.from('products').update({ ...fallbackBase, ...oldCols }).eq('id', productIdNum)
          if (e2) throw e2
        } else {
          throw new Error(errMsg)
        }
      }
      router.push('/products')
      router.refresh()
    } catch (e) {
      console.warn('Failed to save product', e)
      alert('Не удалось сохранить товар')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
          <p className="text-sm text-gray-500">ID: {productId}</p>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setActiveLang('ru')}
                className={`px-3 py-1 rounded-md border text-sm ${activeLang === 'ru' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700'}`}
              >Русский</button>
              <button
                type="button"
                onClick={() => setActiveLang('uz')}
                className={`px-3 py-1 rounded-md border text-sm ${activeLang === 'uz' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700'}`}
              >O‘zbekcha</button>
              <button
                type="button"
                onClick={() => setActiveLang('en')}
                className={`px-3 py-1 rounded-md border text-sm ${activeLang === 'en' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700'}`}
              >English</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Name ({activeLang.toUpperCase()})</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.name[activeLang] || ''}
                  onChange={(e) => setLangField('name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Description ({activeLang.toUpperCase()})</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.description[activeLang] || ''}
                  onChange={(e) => setLangField('description', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Price</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={Number(form.price ?? 0)}
                  onChange={(e) => setField('price', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Type ({activeLang.toUpperCase()})</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.type[activeLang] || ''}
                  onChange={(e) => setLangField('type', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Color ({activeLang.toUpperCase()})</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.color[activeLang] || ''}
                  onChange={(e) => setLangField('color', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Amount</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={Number(form.amount ?? 0)}
                  onChange={(e) => setField('amount', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Characteristic ({activeLang.toUpperCase()})</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.characteristic[activeLang] || ''}
                  onChange={(e) => setLangField('characteristic', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Image URL</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.image ?? ''}
                  onChange={(e) => setField('image', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Tag (read-only)</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                  value={form.tag ?? ''}
                  readOnly
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
