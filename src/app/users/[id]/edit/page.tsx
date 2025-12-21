'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, Tables } from '@/lib/supabase'

type Profile = Tables['profiles']['Row']

export default function UserEditPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<Profile>>({
    email: '',
    name: '',
    surname: '',
    company: '',
    position: '',
    city: '',
    phone: '',
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
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (error) throw error
        setForm(data || {})
      } catch (e) {
        console.error('Failed to load user', e)
        alert('Не удалось загрузить пользователя')
      } finally {
        setLoading(false)
      }
    }
    if (userId) load()
  }, [userId])

  const setField = <K extends keyof Profile>(k: K, v: Profile[K]) =>
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
        .from('users')
        .update({
          email: form.email ?? '',
          name: form.name ?? '',
          surname: form.surname ?? '',
          company: form.company ?? null,
          position: form.position ?? null,
          city: form.city ?? null,
          phone: form.phone ?? null,
        })
        .eq('id', userId)
      if (error) throw error
      router.push('/users')
      router.refresh()
    } catch (e) {
      console.error('Failed to save user', e)
      alert('Не удалось сохранить пользователя')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
          <p className="text-sm text-gray-500">ID: {userId}</p>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Email</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.email ?? ''}
                  onChange={(e) => setField('email', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Name</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.name ?? ''}
                  onChange={(e) => setField('name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Surname</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.surname ?? ''}
                  onChange={(e) => setField('surname', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Company</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.company ?? ''}
                  onChange={(e) => setField('company', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Position</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.position ?? ''}
                  onChange={(e) => setField('position', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">City</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.city ?? ''}
                  onChange={(e) => setField('city', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Phone</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.phone ?? ''}
                  onChange={(e) => setField('phone', e.target.value)}
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
