'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/supabase'
import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Eye, Edit, Clock, CheckCircle, XCircle } from 'lucide-react'

type Order = Tables['orders']['Row']

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusIcons = {
  pending: Clock,
  processing: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [branchFilter, setBranchFilter] = useState<string>('all')
  const [clientQuery, setClientQuery] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [branches, setBranches] = useState<string[]>([])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes('example.supabase.co')
      ) {
        setOrders([])
        return
      }
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      if (branchFilter !== 'all') {
        query = query.eq('branch', branchFilter)
      }
      if (startDate) query = query.gte('created_at', `${startDate}T00:00:00.000Z`)
      if (endDate) query = query.lte('created_at', `${endDate}T23:59:59.999Z`)

      const { data, error } = await query

      if (error) throw error
      let list = data || []
      if (clientQuery.trim()) {
        const q = clientQuery.toLowerCase()
        list = list.filter(
          (o) =>
            o.name.toLowerCase().includes(q) ||
            o.email.toLowerCase().includes(q) ||
            (o.phone || '').toLowerCase().includes(q),
        )
      }
      setOrders(list)
      const { data: bdata } = await supabase.from('orders').select('branch').limit(1000)
      const uniq = Array.from(new Set((bdata || []).map((x: any) => x.branch).filter(Boolean)))
      setBranches(uniq)
    } catch (error) {
      console.warn('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, branchFilter, startDate, endDate, clientQuery])

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, branchFilter, startDate, endDate, clientQuery, fetchOrders])


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="brand-header brand-gradient">Orders Management</h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all customer orders.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card hover-lift animate-fade-up p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Filter by Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700">Client (name/email/phone)</label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300"
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                placeholder="Search client..."
              />
            </div>
            <button
              onClick={fetchOrders}
              className="mt-6 btn-primary"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card hover-lift animate-fade-up">
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin spinner-brand mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading orders...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.short_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{order.name}</div>
                              <div className="text-gray-500">{order.email}</div>
                              <div className="text-gray-500">{order.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            UZS {Number(order.total).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                              }`}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {order.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.payment_method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{order.delivery_type}</div>
                              <div className="text-gray-500">{order.branch}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(order.created_at), 'MMM d, yyyy HH:mm', { locale: ru })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/orders/${order.id}`}
                                className="text-red-600 hover:text-red-900"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/orders/${order.id}/edit`}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit Order"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
