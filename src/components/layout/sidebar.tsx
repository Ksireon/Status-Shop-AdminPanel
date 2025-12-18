'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  Menu,
  X,
  Activity,
  Package2,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Cart', href: '/cart', icon: Package2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'System', href: '/system', icon: Activity },
]

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {sidebarOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white/90 backdrop-blur-md shadow-xl rounded-r-xl">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-red-500" />
                </button>
              </div>
              <div className="flex h-0 flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4">
                  <h1 className="text-xl font-bold text-gray-900">Status Shop Admin</h1>
                </div>
                <nav className="mt-5 flex-1 space-y-1 px-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`nav-link ${
                        pathname === item.href
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      } group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`${
                          pathname === item.href ? 'text-red-600' : 'text-gray-400'
                        } mr-3 h-5 w-5 flex-shrink-0`}
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white/80 backdrop-blur-md">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">Status Shop Admin</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link ${
                    pathname === item.href
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all`}
                >
                  <item.icon
                    className={`${
                      pathname === item.href ? 'text-red-600' : 'text-gray-400'
                    } mr-3 h-5 w-5 flex-shrink-0`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <button
          type="button"
          className="ml-1 inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </>
  )
}
