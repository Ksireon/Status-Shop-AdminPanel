'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { User, MapPin, CreditCard, Package, Clock, CheckCircle } from 'lucide-react'

type Order = Tables['orders']['Row']

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes('example.supabase.co')
      ) {
        setOrder(null)
        return
      }
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    try {
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
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      fetchOrder()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading order details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">Order not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="brand-header brand-gradient">Order Details</h2>
            <p className="mt-1 text-sm text-gray-500">
              Order #{order.short_id} - {format(new Date(order.created_at), 'MMMM d, yyyy HH:mm', { locale: ru })}
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Order Status Update */}
        <div className="card hover-lift animate-fade-up">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => updateOrderStatus('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  order.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => updateOrderStatus('processing')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  order.status === 'processing'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => updateOrderStatus('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  order.status === 'completed'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => updateOrderStatus('cancelled')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="card hover-lift animate-fade-up">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="mt-1 text-sm text-gray-900">{order.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="mt-1 text-sm text-gray-900">{order.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="mt-1 text-sm text-gray-900">{order.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="card hover-lift animate-fade-up">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Delivery Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Delivery Type</p>
                <p className="mt-1 text-sm text-gray-900">{order.delivery_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Branch</p>
                <p className="mt-1 text-sm text-gray-900">{order.branch}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Branch Address</p>
                <p className="mt-1 text-sm text-gray-900">{order.branch_address}</p>
              </div>
              {order.delivery_address && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                  <p className="mt-1 text-sm text-gray-900">{order.delivery_address}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="card hover-lift animate-fade-up">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Information
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Payment Method</p>
                <p className="mt-1 text-sm text-gray-900">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Amount</p>
                <p className="mt-1 text-sm text-gray-900 font-semibold">₴{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="card hover-lift animate-fade-up">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {typeof item.name === 'object' ? item.name.en || item.name.uk : item.name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">Tag: {item.tag}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₴{item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Order Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Order Created</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.created_at), 'MMMM d, yyyy HH:mm', { locale: ru })}
                  </p>
                </div>
              </div>
              
              {order.status !== 'pending' && (
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Status Updated</p>
                    <p className="text-sm text-gray-500">Current status: {order.status}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
