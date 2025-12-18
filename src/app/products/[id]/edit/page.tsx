'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, Tables } from '@/lib/supabase'

type ProductRow = Tables['products']['Row']

export default function ProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const productId = Number(params.id as string)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<ProductRow>>({
    name: { en: '' },
    description: { en: '' },
    price: 0,
    type: '',
    size: '',
    color: '',
    meters: 0,
    image: '',
    tag: '',
  })

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
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single()
        if (error) throw error
        setForm(data || {})
      } catch (e) {
        console.error('Failed to load product', e)
        alert('Не удалось загрузить товар')
      } finally {
        setLoading(false)
      }
    }
    if (productId) load()
  }, [productId])

  const setField = <K extends keyof ProductRow>(k: K, v: ProductRow[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

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
      const { error } = await supabase
        .from('products')
        .update({
          name: form.name ?? { en: '' },
          description: form.description ?? { en: '' },
          price: Number(form.price ?? 0),
          type: form.type ?? '',
          size: form.size ?? '',
          color: form.color ?? '',
          meters: Number(form.meters ?? 0),
          image: form.image ?? '',
        })
        .eq('id', productId)
      if (error) throw error
      router.push('/products')
      router.refresh()
    } catch (e) {
      console.error('Failed to save product', e)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Name (JSON)</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={JSON.stringify(form.name ?? { en: '' })}
                  onChange={(e) => {
                    try {
                      setField('name', JSON.parse(e.target.value))
                    } catch {
                      // ignore invalid JSON
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Description (JSON)</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={JSON.stringify(form.description ?? { en: '' })}
                  onChange={(e) => {
                    try {
                      setField('description', JSON.parse(e.target.value))
                    } catch {
                      // ignore invalid JSON
                    }
                  }}
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
                <label className="text-sm text-gray-700">Type</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.type ?? ''}
                  onChange={(e) => setField('type', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Size</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.size ?? ''}
                  onChange={(e) => setField('size', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Color</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.color ?? ''}
                  onChange={(e) => setField('color', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Meters</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={Number(form.meters ?? 0)}
                  onChange={(e) => setField('meters', Number(e.target.value))}
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
