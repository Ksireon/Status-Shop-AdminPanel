import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import Link from 'next/link'
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
} from 'lucide-react'

async function getDashboardData() {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('example.supabase.co')
    ) {
      return {
        usersCount: 0,
        ordersCount: 0,
        productsCount: 0,
        totalRevenue: 0,
        completedOrders: 0,
        avgCheck: 0,
      recentOrders: [],
    }
    }
    const { supabase } = await import('@/lib/supabase')
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (usersError) throw usersError

    // Get orders count and total revenue
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (ordersError) throw ordersError

    // Get products count
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (productsError) throw productsError

    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentOrdersError) throw recentOrdersError

    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0
    const completedOrders = orders?.filter(order => order.status === 'completed').length || 0
    const avgCheck = (orders?.length || 0) ? totalRevenue / (orders?.length || 1) : 0

    return {
      usersCount: usersCount || 0,
      ordersCount: orders?.length || 0,
      productsCount: productsCount || 0,
      totalRevenue,
      completedOrders,
      recentOrders: recentOrders || [],
      avgCheck,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      usersCount: 0,
      ordersCount: 0,
      productsCount: 0,
      totalRevenue: 0,
      completedOrders: 0,
      avgCheck: 0,
      recentOrders: [],
    }
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Overview of your Status Shop performance and key metrics.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={data.usersCount}
            icon={Users}
          />
          <StatsCard
            title="Total Orders"
            value={data.ordersCount}
            icon={ShoppingCart}
          />
          <StatsCard
            title="Total Products"
            value={data.productsCount}
            icon={Package}
          />
          <StatsCard
            title="Total Revenue"
            value={`UZS ${data.totalRevenue.toFixed(2)}`}
            icon={DollarSign}
          />
          <StatsCard
            title="Avg Check"
            value={`UZS ${data.avgCheck.toFixed(0)}`}
          />
          <StatsCard
            title="Completed Orders"
            value={data.completedOrders}
          />
        </div>

        {/* Recent Orders */}
        <div>
          <RecentOrders orders={data.recentOrders} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="/users"
                className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Manage Users
                </span>
              </Link>
              <Link
                href="/orders"
                className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Manage Orders
                </span>
              </Link>
              <Link
                href="/products"
                className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Manage Products
                </span>
              </Link>
              <Link
                href="/analytics"
                className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Sales Analytics
                </span>
              </Link>
              <Link
                href="/finance"
                className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Finance Report
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
