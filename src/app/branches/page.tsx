'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

type BranchRow = {
  id: string
  name: string
  city?: string
  address?: string
  coords?: string
  phone?: string
  card_number?: string
  manager_user_id?: string
}

export default function BranchesPage() {
  const [items, setItems] = useState<BranchRow[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<BranchRow | null>(null)
  const [form, setForm] = useState<BranchRow>({
    id: '',
    name: '',
    city: '',
    address: '',
    coords: '',
    phone: '',
    card_number: '',
    manager_user_id: '',
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'
      const res = await fetch(`${API}/branches`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch branches')
      const data = await res.json()
      setItems((data as BranchRow[]) || [])
    } catch (e) {
      console.warn('Branches fetch warning', e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onEdit = (row: BranchRow) => {
    setEditing(row)
    setForm(row)
  }

  const onNew = () => {
    setEditing(null)
    setForm({ id: '', name: '', city: '', address: '', coords: '', phone: '', card_number: '', manager_user_id: '' })
  }

  const onSave = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'
      if (editing?.id) {
        const res = await fetch(`${API}/branches/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            city: form.city,
            address: form.address,
            phone: form.phone,
            card_number: form.card_number
          })
        })
        if (!res.ok) throw new Error('Update branch failed')
      } else {
        const res = await fetch(`${API}/branches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            city: form.city,
            address: form.address,
            phone: form.phone,
            card_number: form.card_number
          })
        })
        if (!res.ok) throw new Error('Create branch failed')
      }
      onNew()
      fetchData()
    } catch (e) {
      console.warn('Save branch warning', e)
      alert('Не удалось сохранить филиал')
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Удалить филиал?')) return
    try {
      const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'
      const res = await fetch(`${API}/branches/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete branch failed')
      fetchData()
    } catch (e) {
      console.warn('Delete branch warning', e)
      alert('Не удалось удалить филиал')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="brand-header brand-gradient">Филиалы</h2>
            <p className="mt-1 text-sm text-gray-500">Список филиалов и реквизиты</p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button className="btn-primary" onClick={onNew}>Добавить филиал</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="text-lg font-semibold mb-3">Список</div>
            {loading ? (
              <div className="text-center py-8"><div className="animate-spin spinner-brand mx-auto"></div></div>
            ) : (
              <div className="space-y-2">
                {items.map((b) => (
                  <div key={b.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">{b.name}</div>
                        <div className="text-sm text-gray-500">{b.city} • {b.address}</div>
                        <div className="text-sm text-gray-500">Тел: {b.phone}</div>
                        <div className="text-sm text-gray-500">Карта: {b.card_number}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary" onClick={() => onEdit(b)}>Edit</button>
                        <button className="text-red-600" onClick={() => onDelete(b.id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card p-5">
            <div className="text-lg font-semibold mb-3">{editing?.id ? 'Редактирование' : 'Новый филиал'}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Name</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">City</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-700">Address</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Coords</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.coords} onChange={(e) => setForm({ ...form, coords: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Phone</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Card Number</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.card_number} onChange={(e) => setForm({ ...form, card_number: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-gray-700">Manager User ID</label>
                <input className="mt-1 block w-full rounded-md border-gray-300" value={form.manager_user_id} onChange={(e) => setForm({ ...form, manager_user_id: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-primary" onClick={onSave}>Save</button>
              <button className="btn-secondary" onClick={onNew}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
