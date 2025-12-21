'use client'

import { Suspense, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DeleteUserButton } from '@/components/users/delete-user-button'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Edit, Eye } from 'lucide-react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes('example.supabase.co')
        ) {
          setUsers([])
          return
        }
        let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
        const qParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') || '' : ''
        if (qParam && qParam.trim()) {
          const term = qParam.trim().replace(/[%\,]/g, '')
          query = query.or(
            `name.ilike.%${term}%,surname.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,company.ilike.%${term}%,position.ilike.%${term}%,city.ilike.%${term}%`,
          )
        }
        const { data, error } = await query
        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.warn('Error fetching users:', error)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="brand-header brand-gradient">Users Management</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage all registered users in your Status Shop.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <form action="/users" method="get" className="flex items-center gap-2">
              <input
                name="q"
                className="rounded-md border-gray-300"
                placeholder="Search name/email/phone"
                defaultValue={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') || '' : ''}
              />
              <button type="submit" className="btn-secondary">Search</button>
            </form>
          </div>
        </div>

        <div className="card hover-lift animate-fade-up">
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin spinner-brand mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name} {user.surname}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.company || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.position || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.city || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/users/${user.id}`}
                              className="text-red-600 hover:text-red-700"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/users/${user.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-700"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <DeleteUserButton userId={user.id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
    </Suspense>
  )
}
