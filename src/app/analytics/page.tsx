'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/supabase'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type Order = Tables['orders']['Row']

function toISODate(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)).toISOString()
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month')
  const [start, setStart] = useState<string>(toISODate(new Date(new Date().setMonth(new Date().getMonth() - 1))))
  const [end, setEnd] = useState<string>(toISODate(new Date()))
  const [branch, setBranch] = useState<string>('all')
  const [orders, setOrders] = useState<Order[]>([])
  const [branches, setBranches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const now = new Date()
    let s: string
    let e: string
    if (range !== 'custom') {
      if (range === 'day') s = toISODate(new Date(new Date().setDate(new Date().getDate() - 1)))
      else if (range === 'week') s = toISODate(new Date(new Date().setDate(new Date().getDate() - 7)))
      else if (range === 'month') s = toISODate(new Date(new Date().setMonth(new Date().getMonth() - 1)))
      else s = toISODate(new Date(new Date().setFullYear(new Date().getFullYear() - 1)))
      e = toISODate(new Date())
      setStart(s)
      setEnd(e)
    }
  }, [range])

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
      let query = supabase.from('orders').select('*').gte('created_at', start).lte('created_at', end).order('created_at', { ascending: true })
      if (branch !== 'all') {
        query = query.eq('branch', branch)
      }
      const { data, error } = await query
      if (error) throw error
      setOrders(data || [])
      const { data: allOrders } = await supabase.from('orders').select('branch').limit(1000)
      const uniqueBranches = Array.from(new Set((allOrders || []).map((o: any) => o.branch).filter(Boolean)))
      setBranches(uniqueBranches)
    } catch (e) {
      console.error('Analytics fetch error', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, branch])

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total ?? 0), 0)
    const count = orders.length
    const avg = count ? totalRevenue / count : 0
    // group by day
    const byDay = new Map<string, number>()
    orders.forEach((o) => {
      const d = new Date(o.created_at)
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
      byDay.set(key, (byDay.get(key) || 0) + Number(o.total ?? 0))
    })
    const labels = Array.from(byDay.keys()).sort()
    const data = labels.map((l) => byDay.get(l) || 0)
    const paymentBreakdown = orders.reduce<Record<string, number>>((acc, o) => {
      const key = o.payment_method || 'unknown'
      acc[key] = (acc[key] || 0) + Number(o.total ?? 0)
      return acc
    }, {})
    const byCustomer = orders.reduce<Record<string, { name: string; company?: string; total: number; count: number }>>((acc, o) => {
      const key = o.email
      const curr = acc[key] || { name: o.name, company: undefined, total: 0, count: 0 }
      curr.total += Number(o.total ?? 0)
      curr.count += 1
      acc[key] = curr
      return acc
    }, {})
    const topClients = Object.entries(byCustomer)
      .map(([email, info]) => ({ email, ...info }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
    return { totalRevenue, count, avg, labels, data, paymentBreakdown, topClients }
  }, [orders])

  const chartData = useMemo(
    () => ({
      labels: metrics.labels,
      datasets: [
        {
          label: 'Revenue (UZS)',
          data: metrics.data,
          backgroundColor: 'rgba(220, 38, 38, 0.6)',
        },
      ],
    }),
    [metrics],
  )

  const exportTopClients = () => {
    const header = 'Email,Name,Total,Orders\n'
    const rows = metrics.topClients.map((c) => `${c.email},${c.name},${c.total},${c.count}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'top_clients.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="brand-header brand-gradient">Sales Analytics</h2>
            <p className="mt-1 text-sm text-gray-500">Просмотр продаж по периодам и филиалам</p>
          </div>
        </div>

        <div className="card hover-lift animate-fade-up p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-sm text-gray-700">Период</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as any)}
                className="mt-1 block w-40 rounded-md border-gray-300"
              >
                <option value="day">День</option>
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
                <option value="year">Год</option>
                <option value="custom">Диапазон</option>
              </select>
            </div>
            {range === 'custom' && (
              <>
                <div>
                  <label className="text-sm text-gray-700">Начало</label>
                  <input type="date" className="mt-1 block rounded-md border-gray-300"
                    value={start.slice(0, 10)}
                    onChange={(e) => setStart(`${e.target.value}T00:00:00.000Z`)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Конец</label>
                  <input type="date" className="mt-1 block rounded-md border-gray-300"
                    value={end.slice(0, 10)}
                    onChange={(e) => setEnd(`${e.target.value}T00:00:00.000Z`)}
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-sm text-gray-700">Филиал</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="mt-1 block w-52 rounded-md border-gray-300"
              >
                <option value="all">Все</option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={fetchData} className="btn-primary">Обновить</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="text-sm text-gray-500">Общий объем продаж</div>
            <div className="text-2xl font-semibold">UZS {metrics.totalRevenue.toLocaleString()}</div>
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
          <div className="text-lg font-semibold mb-3">График продаж</div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin spinner-brand mx-auto"></div>
            </div>
          ) : (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' }, title: { display: false } },
              }}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="text-lg font-semibold mb-3">Разбивка по оплате</div>
            <div className="space-y-2">
              {Object.entries(metrics.paymentBreakdown).map(([method, sum]) => (
                <div key={method} className="flex justify-between text-sm">
                  <span className="text-gray-600">{method}</span>
                  <span className="font-medium">UZS {sum.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">Топ-10 клиентов</div>
              <button className="btn-secondary" onClick={exportTopClients}>Экспорт CSV</button>
            </div>
            <div className="space-y-2">
              {metrics.topClients.map((c, idx) => (
                <div key={c.email} className="flex justify-between text-sm">
                  <span className="text-gray-600">{idx + 1}. {c.name} ({c.email})</span>
                  <span className="font-medium">UZS {c.total.toLocaleString()} • {c.count} заказ(ов)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
