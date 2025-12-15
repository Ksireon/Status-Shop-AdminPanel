'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { User, Mail, Phone, Building, Briefcase, MapPin, Calendar } from 'lucide-react'

type Profile = Tables['profiles']['Row']

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.id as string
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading user details...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-500">User not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              User Profile
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Detailed information about {user.name} {user.surname}
            </p>
          </div>
        </div>

        {/* User Information Card */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Full Name</p>
                    <p className="text-sm text-gray-600">{user.name} {user.surname}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Company</p>
                    <p className="text-sm text-gray-600">{user.company || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Position</p>
                    <p className="text-sm text-gray-600">{user.position || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">City</p>
                    <p className="text-sm text-gray-600">{user.city || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Registered</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(user.created_at), 'MMMM d, yyyy', { locale: ru })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Actions</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  // Navigate to edit page
                  window.location.href = `/users/${userId}/edit`
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Edit Profile
              </button>
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this user?')) {
                    try {
                      const { error } = await supabase
                        .from('profiles')
                        .delete()
                        .eq('id', userId)
                      
                      if (error) throw error
                      window.location.href = '/users'
                    } catch (error) {
                      console.error('Error deleting user:', error)
                      alert('Failed to delete user')
                    }
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}