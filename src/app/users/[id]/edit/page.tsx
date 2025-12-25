'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'

export default function UserEditPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    surname: '',
    company: '',
    position: '',
    city: '',
    phone: ''
  })

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
        if (error || !data) return
        setForm({
          name: data.name || '',
          surname: data.surname || '',
          company: data.company || '',
          position: data.position || '',
          city: data.city || '',
          phone: data.phone || ''
        })
      } finally {
        setLoading(false)
      }
    }
    if (userId) run()
  }, [userId])

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const onSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...form })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data?.error || 'Не удалось обновить пользователя')
        return
      }
      router.push(`/users/${userId}`)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Загрузка...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Редактирование пользователя
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Обновите информацию профиля
            </p>
          </div>
        </div>

        <div className="card hover-lift animate-fade-up">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm text-gray-700">Имя</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.name} onChange={(e) => setField('name', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Фамилия</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.surname} onChange={(e) => setField('surname', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Компания</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.company} onChange={(e) => setField('company', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Должность</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.position} onChange={(e) => setField('position', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Город</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.city} onChange={(e) => setField('city', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Телефон</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Сохранить
              </button>
              <button
                onClick={() => router.push(`/users/${userId}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

