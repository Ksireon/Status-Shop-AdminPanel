'use client'

import { Sidebar } from './sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
