'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function UserNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    company: '',
    position: '',
    city: '',
    phone: '',
  })

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const onSave = async () => {
    try {
      setSaving(true)
      const payload = {
        email: form.email.trim(),
        name: form.name.trim(),
        surname: form.surname.trim(),
        company: form.company.trim() || null,
        position: form.position.trim() || null,
        city: form.city.trim() || null,
        phone: form.phone.trim() || null,
      }
      if (!payload.email || !payload.name || !payload.surname) {
        alert('Введите имя, фамилию и email')
        return
      }
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        alert(`Ошибка: ${json.error || 'unknown'}`)
        throw new Error(json.error || 'create failed')
      }
      router.push('/users')
      router.refresh()
    } catch (e) {
      // сообщение уже показано выше
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
          <p className="text-sm text-gray-500">Заполните данные пользователя и сохраните</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Name</label>
              <input className="mt-1 block w-full rounded-md border-gray-300" value={form.name} onChange={(e) => setField('name', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Surname</label>
              <input className="mt-1 block w-full rounded-md border-gray-300" value={form.surname} onChange={(e) => setField('surname', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input className="mt-1 block w-full rounded-md border-gray-300" value={form.email} onChange={(e) => setField('email', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Company</label>
              <input className="mt-1 block w-full rounded-md border-gray-300" value={form.company} onChange={(e) => setField('company', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Position</label>
              <input className="mt-1 block w-full rounded-md border-gray-300" value={form.position} onChange={(e) => setField('position', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">City</label>
              <input className="mt-1 block w-full rounded-md border-gray-300" value={form.city} onChange={(e) => setField('city', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Phone</label>
              <input className="mt-1 block w-full rounded-md border-gray-300" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onSave} disabled={saving} className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              Save
            </button>
            <button onClick={() => router.back()} className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-semibold text-gray-700">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
