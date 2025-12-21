'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'

type SettingsRow = { key: string; value: string }

export default function NotificationsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    large_order: true,
    low_stock: true,
    order_cancelled: true,
  })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes('example.supabase.co')
      ) {
        return
      }
      const { data } = await supabase.from('settings').select('*').eq('key', 'notifications').single()
      const val = (data as SettingsRow | null)?.value
      if (val) {
        const parsed = JSON.parse(val)
        setSettings({
          large_order: !!parsed.large_order,
          low_stock: !!parsed.low_stock,
          order_cancelled: !!parsed.order_cancelled,
        })
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async () => {
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
      const payload = JSON.stringify(settings)
      const { error } = await supabase.from('settings').upsert({ key: 'notifications', value: payload })
      if (error) throw error
      alert('Сохранено')
    } catch (e) {
      console.error('Save notifications error', e)
      alert('Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="brand-header brand-gradient">Уведомления</h2>
            <p className="mt-1 text-sm text-gray-500">Настройка уведомлений для важных событий</p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button className="btn-primary" onClick={save} disabled={saving}>Сохранить</button>
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={settings.large_order} onChange={(e) => setSettings({ ...settings, large_order: e.target.checked })} />
            <span>Крупный заказ</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={settings.low_stock} onChange={(e) => setSettings({ ...settings, low_stock: e.target.checked })} />
            <span>Низкие остатки товара</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={settings.order_cancelled} onChange={(e) => setSettings({ ...settings, order_cancelled: e.target.checked })} />
            <span>Отмена заказа</span>
          </label>
          <p className="text-xs text-gray-500">Сохранение выполняется в таблице settings (key: notifications).</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
