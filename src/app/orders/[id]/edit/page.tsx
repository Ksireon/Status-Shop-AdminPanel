'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, Tables } from '@/lib/supabase'

type OrderRow = Tables['orders']['Row']

export default function OrderEditPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Partial<OrderRow>>({
    status: 'pending',
    delivery_type: '',
    branch: '',
    branch_address: '',
    delivery_address: '',
    payment_method: '',
    name: '',
    email: '',
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
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()
        if (error) throw error
        setForm(data || {})
      } catch (e) {
        console.error('Failed to load order', e)
        alert('Не удалось загрузить заказ')
      } finally {
        setLoading(false)
      }
    }
    if (orderId) load()
  }, [orderId])

  const setField = <K extends keyof OrderRow>(k: K, v: OrderRow[K]) =>
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
        .from('orders')
        .update({
          status: form.status ?? 'pending',
          delivery_type: form.delivery_type ?? '',
          branch: form.branch ?? '',
          branch_address: form.branch_address ?? '',
          delivery_address: form.delivery_address ?? null,
          payment_method: form.payment_method ?? '',
          name: form.name ?? '',
          email: form.email ?? '',
          phone: form.phone ?? '',
        })
        .eq('id', orderId)
      if (error) throw error
      router.push(`/orders/${orderId}`)
      router.refresh()
    } catch (e) {
      console.error('Failed to save order', e)
      alert('Не удалось сохранить заказ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Order</h2>
          <p className="text-sm text-gray-500">ID: {orderId}</p>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.status ?? 'pending'}
                  onChange={(e) => setField('status', e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Delivery Type</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.delivery_type ?? ''}
                  onChange={(e) => setField('delivery_type', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Branch</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.branch ?? ''}
                  onChange={(e) => setField('branch', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Branch Address</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.branch_address ?? ''}
                  onChange={(e) => setField('branch_address', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Delivery Address</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.delivery_address ?? ''}
                  onChange={(e) => setField('delivery_address', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Payment Method</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.payment_method ?? ''}
                  onChange={(e) => setField('payment_method', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Customer Name</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.name ?? ''}
                  onChange={(e) => setField('name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Customer Email</label>
                <input
                  className="mt-1 block w-full rounded-md border-gray-300"
                  value={form.email ?? ''}
                  onChange={(e) => setField('email', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Customer Phone</label>
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
