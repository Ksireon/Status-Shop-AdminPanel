'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/supabase'

type Order = Tables['orders']['Row']

export default function FinancePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [branch, setBranch] = useState<string>('all')
  const [branches, setBranches] = useState<string[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes('example.supabase.co')
      ) {
        setOrders([])
        setBranches([])
        return
      }
      let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (startDate) q = q.gte('created_at', `${startDate}T00:00:00.000Z`)
      if (endDate) q = q.lte('created_at', `${endDate}T23:59:59.999Z`)
      if (branch !== 'all') q = q.eq('branch', branch)
      const { data, error } = await q
      if (error) throw error
      setOrders(data || [])
      const { data: bdata } = await supabase.from('orders').select('branch').limit(1000)
      const uniq = Array.from(new Set((bdata || []).map((x: any) => x.branch).filter(Boolean)))
      setBranches(uniq)
    } catch (e) {
      console.warn('Finance fetch error', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const metrics = useMemo(() => {
    const total = orders.reduce((s, o) => s + Number(o.total ?? 0), 0)
    const byMethod = orders.reduce<Record<string, number>>((acc, o) => {
      const m = o.payment_method || 'unknown'
      acc[m] = (acc[m] || 0) + Number(o.total ?? 0)
      return acc
    }, {})
    const count = orders.length
    const avg = count ? total / count : 0
    const byProduct: Record<string, number> = {}
    orders.forEach((o) => {
      ;(o.items || []).forEach((it: any) => {
        const name =
          typeof it.name === 'object'
            ? (it.name.en || it.name.uk || 'unknown')
            : (it.name || 'unknown')
        byProduct[name] = (byProduct[name] || 0) + Number(it.price ?? 0) * Number(it.quantity ?? 1)
      })
    })
    const topProducts = Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 10)
    return { total, byMethod, count, avg, topProducts }
  }, [orders])

  const exportCSV = () => {
    const header = 'Date,ShortID,Branch,Payment,Total\n'
    const rows = orders
      .map((o) => `${o.created_at},${o.short_id},${o.branch},${o.payment_method},${o.total}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'finance_report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="brand-header brand-gradient">Касса / Финансы</h2>
            <p className="mt-1 text-sm text-gray-500">Отчет по продажам за период</p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button className="btn-secondary" onClick={exportCSV}>Экспорт CSV</button>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-sm text-gray-700">Начало</label>
              <input type="date" className="mt-1 block rounded-md border-gray-300" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Конец</label>
              <input type="date" className="mt-1 block rounded-md border-gray-300" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Филиал</label>
              <select className="mt-1 block rounded-md border-gray-300" value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option value="all">Все</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary" onClick={fetchData}>Сформировать отчет</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="text-sm text-gray-500">Итого продаж</div>
            <div className="text-2xl font-semibold">UZS {metrics.total.toLocaleString()}</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-gray-500">Количество заказов</div>
            <div className="text-2xl font-semibold">{metrics.count}</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-gray-500">Средний чек</div>
            <div className="text-2xl font-semibold">UZS {metrics.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-lg font-semibold mb-3">Оплаты</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(metrics.byMethod).map(([method, sum]) => (
              <div key={method} className="flex justify-between text-sm">
                <span className="text-gray-600">{method}</span>
                <span className="font-medium">UZS {sum.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-lg font-semibold mb-3">Топ товаров</div>
          <div className="space-y-2">
            {metrics.topProducts.map(([name, sum], idx) => (
              <div key={name} className="flex justify-between text-sm">
                <span className="text-gray-600">{idx + 1}. {name}</span>
                <span className="font-medium">UZS {Number(sum).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
