'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, Tables } from '@/lib/supabase'
import Image from 'next/image'

type ProductInsert = Tables['products']['Insert']

export default function ProductNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<ProductInsert>>(() => {
    return {
      name: { en: '' },
      description: { en: '' },
      type: '',
      image: '',
      color: '',
      price: 0,
      amount: 0,
      characteristic: '',
      tag: '',
    }
  })
 
  useEffect(() => {
    if (!form.tag) {
      const gen = Array.from({ length: 8 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36)),
      ).join('')
      setForm((f) => ({ ...f, tag: gen }))
    }
  }, [])

  const setField = <K extends keyof ProductInsert>(k: K, v: ProductInsert[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const onSave = async () => {
    try {
      setSaving(true)
      const payload = {
        name: { en: typeof form.name === 'object' ? (form.name as any).en ?? '' : String(form.name ?? '') },
        description: { en: typeof form.description === 'object' ? (form.description as any).en ?? '' : String(form.description ?? '') },
        type: form.type ?? '',
        image: form.image ?? '',
        color: form.color ?? '',
        price: Number(form.price ?? 0),
        amount: Number(form.amount ?? 0),
        characteristic: form.characteristic ?? '',
        tag: form.tag ?? '',
      }
      if (!payload.tag) {
        alert('Введите уникальный Tag продукта')
        return
      }
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to create product')
      router.push('/products')
      router.refresh()
    } catch (e) {
      console.error('Failed to create product', e)
      alert('Не удалось создать продукт')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Создать товар</h2>
          <p className="text-sm text-gray-500">Заполните данные товара и сохраните</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Название</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={typeof form.name === 'object' ? (form.name as any).en ?? '' : String(form.name ?? '')}
                  onChange={(e) => setField('name', { en: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Описание</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={typeof form.description === 'object' ? (form.description as any).en ?? '' : String(form.description ?? '')}
                  onChange={(e) => setField('description', { en: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Тип</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.type ?? ''}
                  onChange={(e) => setField('type', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Ссылка на изображение</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.image ?? ''}
                  onChange={(e) => setField('image', e.target.value)}
                />
              </div>
            <div>
              <label className="text-sm text-gray-700">Цвет</label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300"
                value={form.color ?? ''}
                onChange={(e) => setField('color', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Цена</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300"
                value={Number(form.price ?? 0)}
                onChange={(e) => setField('price', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Количество</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300"
                value={Number(form.amount ?? 0)}
                onChange={(e) => setField('amount', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Характеристика</label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300"
                value={form.characteristic ?? ''}
                onChange={(e) => setField('characteristic', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Тег (авто)</label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                value={form.tag ?? ''}
                readOnly
              />
            </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={
                    form.image ||
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEgxMDBWMTUwSDUwVjEwMEgxMDBWNTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPgo='
                  }
                  alt="Preview"
                  width={800}
                  height={400}
                  className="h-48 w-full object-cover"
                  unoptimized
                />
              </div>
              <div className="mt-4">
                <div className="text-lg font-semibold text-gray-900">
                  {typeof form.name === 'object' ? (form.name as any).en ?? '' : String(form.name ?? '') || 'Product name'}
                </div>
                <div className="text-sm text-gray-500">
                  {typeof form.description === 'object' ? (form.description as any).en ?? '' : String(form.description ?? '') || 'Description'}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-900">UZS {new Intl.NumberFormat('ru-RU').format(Number(form.price ?? 0))}</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{form.type || 'type'}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Характеристика: {form.characteristic || '-'}</p>
                  <p>Цвет: {form.color || '-'}</p>
                  <p>Количество: {Number(form.amount ?? 0) || 0}</p>
                </div>
                <div className="mt-2 text-xs text-gray-500">Тег: {form.tag}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Сохранить
            </button>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-semibold text-gray-700"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
