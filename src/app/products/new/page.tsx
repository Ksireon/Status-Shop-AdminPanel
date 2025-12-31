'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

type Lang = 'ru' | 'uz' | 'en'

type FormState = {
  name: Record<Lang, string>
  description: Record<Lang, string>
  type: Record<Lang, string>
  color: Record<Lang, string>
  characteristic: Record<Lang, string>
  image: string
  price: number
  amount: number
  tag: string
}

export default function ProductNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeLang, setActiveLang] = useState<Lang>('ru')
  const [form, setForm] = useState<FormState>(() => {
    return {
      name: { ru: '', uz: '', en: '' },
      description: { ru: '', uz: '', en: '' },
      type: { ru: '', uz: '', en: '' },
      color: { ru: '', uz: '', en: '' },
      characteristic: { ru: '', uz: '', en: '' },
      image: '',
      price: 0,
      amount: 0,
      tag: '',
    }
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
 
  useEffect(() => {
    if (!form.tag) {
      const gen = Array.from({ length: 8 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36)),
      ).join('')
      setForm((f) => ({ ...f, tag: gen }))
    }
  }, [])

  const setLangField = (k: keyof Pick<FormState, 'name' | 'description' | 'type' | 'color' | 'characteristic'>, v: string) =>
    setForm((f) => ({ ...f, [k]: { ...f[k], [activeLang]: v } }))

  const onSave = async () => {
    try {
      setSaving(true)
      // upload image if selected
      let imageUrl = form.image || ''
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        fd.append('tag', form.tag || '')
        const resUp = await fetch('/api/uploads/product-image', { method: 'POST', body: fd })
        if (!resUp.ok) throw new Error('Failed to upload image')
        const up = await resUp.json()
        imageUrl = up.url || ''
      }
      const payload = {
        name: { ...form.name },
        description: { ...form.description },
        type: { ...form.type },
        image: imageUrl,
        color: { ...form.color },
        price: Number(form.price || 0),
        amount: Number(form.amount || 0),
        characteristic: { ...form.characteristic },
        tag: form.tag || '',
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

  const tab = (l: Lang, label: string) => (
    <button
      type="button"
      onClick={() => setActiveLang(l)}
      className={`px-3 py-1 rounded-md border text-sm ${activeLang === l ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700'}`}
    >
      {label}
    </button>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Создать товар</h2>
          <p className="text-sm text-gray-500">Заполните данные товара и сохраните</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 space-y-6">
          <div className="flex gap-2">{tab('ru','Русский')}{tab('uz','O‘zbekcha')}{tab('en','English')}</div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Название ({activeLang.toUpperCase()})</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.name[activeLang] || ''}
                  onChange={(e) => setLangField('name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Описание ({activeLang.toUpperCase()})</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.description[activeLang] || ''}
                  onChange={(e) => setLangField('description', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Тип ({activeLang.toUpperCase()})</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.type[activeLang] || ''}
                  onChange={(e) => setLangField('type', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Изображение товара</label>
                <div
                  className="mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4 text-gray-600"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const file = e.dataTransfer.files?.[0]
                    if (file) {
                      setImageFile(file)
                      const url = URL.createObjectURL(file)
                      setForm((f) => ({ ...f, image: url }))
                    }
                  }}
                >
                  <p className="text-sm">Перетащите файл сюда или выберите вручную</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setImageFile(file)
                      if (file) {
                        const url = URL.createObjectURL(file)
                        setForm((f) => ({ ...f, image: url }))
                      }
                    }}
                  />
                </div>
              </div>
            <div>
              <label className="text-sm text-gray-700">Цвет ({activeLang.toUpperCase()})</label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300"
                value={form.color[activeLang] || ''}
                onChange={(e) => setLangField('color', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Цена</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300"
                value={Number(form.price || 0)}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Количество</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300"
                value={Number(form.amount || 0)}
                onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Характеристика ({activeLang.toUpperCase()})</label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300"
                value={form.characteristic[activeLang] || ''}
                onChange={(e) => setLangField('characteristic', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Тег (авто)</label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100"
                value={form.tag || ''}
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
                  {(form.name[activeLang] || form.name.en || '') || 'Product name'}
                </div>
                <div className="text-sm text-gray-500">
                  {(form.description[activeLang] || form.description.en || '') || 'Description'}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-900">UZS {new Intl.NumberFormat('ru-RU').format(Number(form.price || 0))}</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{form.type[activeLang] || form.type.en || 'type'}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Характеристика: {form.characteristic[activeLang] || form.characteristic.en || '-'}</p>
                  <p>Цвет: {form.color[activeLang] || form.color.en || '-'}</p>
                  <p>Количество: {Number(form.amount || 0)}</p>
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
