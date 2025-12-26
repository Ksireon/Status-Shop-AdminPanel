'use client'

import { Search, Bell, Settings, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Topbar() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [role, setRole] = useState('')
  useEffect(() => {
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    const val =
      (document.cookie.split('; ').find((c) => c.startsWith('admin_role_public=')) || '')
        .split('=')
        .slice(1)
        .join('=') || ''
    setRole(val)
  }, [mounted])
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }
  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold brand-gradient">Status Shop Admin</div>
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                placeholder="Поиск..."
                className="pl-9 pr-3 py-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <Bell className="h-5 w-5" />
          </button>
          {mounted && role === 'owner' && (
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => router.push('/system')}
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
          <div className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white">
            <UserIcon className="h-5 w-5" />
          </div>
          <button
            className="ml-2 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            onClick={logout}
          >
            Выход
          </button>
        </div>
      </div>
    </div>
  )
}
