'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'

export default function AboutPage() {
  const [text, setText] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes('example.supabase.co')
      ) {
        setText('')
        return
      }
      const { data, error } = await supabase.from('settings').select('*').eq('key', 'about').single()
      if (error) {
        setText('')
        return
      }
      const value = (data as any)?.value as string
      setText(value || '')
    } catch {
      setText('')
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
      const { error } = await supabase.from('settings').upsert({ key: 'about', value: text })
      if (error) throw error
      alert('Сохранено')
    } catch (e) {
      console.error('Save about error', e)
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
            <h2 className="brand-header brand-gradient">О нас</h2>
            <p className="mt-1 text-sm text-gray-500">Редактирование текста страницы “О нас”</p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button onClick={save} disabled={saving} className="btn-primary">Сохранить</button>
          </div>
        </div>

        <div className="card p-5">
          <textarea
            className="w-full min-h-[300px] rounded-md border-gray-300"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите информацию о компании, адреса и контакты..."
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
