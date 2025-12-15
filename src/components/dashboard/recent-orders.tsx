'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Tables } from '@/lib/supabase'

interface RecentOrdersProps {
  orders: Tables['orders']['Row'][]
}

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

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="card hover-lift animate-fade-up">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <Link
            href="/orders"
            className="text-sm text-red-600 hover:text-red-700 flex items-center"
          >
            View all
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="border-t border-gray-200">
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
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.short_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.name}</div>
                        <div className="text-gray-500">{order.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₴{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                      }`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.created_at), 'MMM d, yyyy HH:mm', { locale: ru })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-red-600 hover:text-red-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
