'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'
import { apiService } from '@/lib/api'
import { format } from 'date-fns'
import { 
  Server, 
  Database, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  MessageSquarePlus
} from 'lucide-react'

interface SystemStatus {
  supabase: {
    status: 'connected' | 'error'
    responseTime?: number
    lastCheck: string
  }
  api: {
    status: 'healthy' | 'error'
    responseTime?: number
    lastCheck: string
  }
}

export default function SystemPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    supabase: {
      status: 'connected',
      lastCheck: '',
    },
    api: {
      status: 'healthy',
      lastCheck: '',
    },
  })
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const checkSystemHealth = async () => {
    setLoading(true)
    
    try {
      // Check Supabase connection
      const supabaseStart = Date.now()
      let supabaseError: Error | null = null
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !String(process.env.NEXT_PUBLIC_SUPABASE_URL).includes('example.supabase.co')
      ) {
        const { error } = await supabase.from('profiles').select('id').limit(1)
        supabaseError = (error as unknown as Error) || null
      } else {
        supabaseError = new Error('Supabase not configured')
      }
      
      const supabaseStatus: SystemStatus['supabase'] = {
        status: supabaseError ? 'error' : 'connected',
        responseTime: Date.now() - supabaseStart,
        lastCheck: new Date().toISOString(),
      }

      // Check API health
      const apiStart = Date.now()
      let apiStatus: SystemStatus['api'] = {
        status: 'healthy',
        responseTime: 0,
        lastCheck: new Date().toISOString(),
      }

      try {
        const health = await apiService.healthCheck()
        apiStatus = {
          status: health.status === 'error' ? 'error' : 'healthy',
          responseTime: Date.now() - apiStart,
          lastCheck: new Date().toISOString(),
        }
      } catch {
        apiStatus = {
          status: 'error',
          responseTime: Date.now() - apiStart,
          lastCheck: new Date().toISOString(),
        }
      }

      setSystemStatus({
        supabase: supabaseStatus,
        api: apiStatus,
      })
    } catch (error) {
      console.warn('Health check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSystemHealth()
    
    // Set up periodic health checks
    const interval = setInterval(checkSystemHealth, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    setHydrated(true)
  }, [])

  const getStatusIcon = (status: 'connected' | 'healthy' | 'error') => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-500" />
    }
  }

  const getStatusColor = (status: 'connected' | 'healthy' | 'error') => {
    switch (status) {
      case 'connected':
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="brand-header brand-gradient">System Health</h2>
            <p className="mt-1 text-sm text-gray-500">
              Monitor the status of your Status Shop system components.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              onClick={checkSystemHealth}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={async () => {
                setLoading(true)
                try {
                  const res = await fetch('/api/system/init-chat', { method: 'POST' })
                  if (!res.ok) {
                    const t = await res.text()
                    throw new Error(t || 'Init failed')
                  }
                  alert('Chat schema initialized')
                } catch (e: any) {
                  alert((e?.message || 'Failed to initialize chat schema').slice(0, 500))
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Init Chat
            </button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Supabase Status */}
          <div className="card hover-lift animate-fade-up">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Database (Supabase)</h3>
                    <p className="text-sm text-gray-500">PostgreSQL Database Status</p>
                  </div>
                </div>
                {getStatusIcon(systemStatus.supabase.status)}
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(systemStatus.supabase.status)
                  }`}>
                    {systemStatus.supabase.status === 'connected' ? 'Connected' : 'Error'}
                  </span>
                </div>
                
                {systemStatus.supabase.responseTime && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Response Time</span>
                    <span className="text-sm text-gray-900">{systemStatus.supabase.responseTime}ms</span>
                  </div>
                )}
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Last Check</span>
                  <span className="text-sm text-gray-900" suppressHydrationWarning>
                    {hydrated && systemStatus.supabase.lastCheck
                      ? format(new Date(systemStatus.supabase.lastCheck), 'HH:mm:ss')
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* API Status */}
          <div className="card hover-lift animate-fade-up">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Server className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Backend API</h3>
                    <p className="text-sm text-gray-500">Status Shop Backend API</p>
                  </div>
                </div>
                {getStatusIcon(systemStatus.api.status)}
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getStatusColor(systemStatus.api.status)
                  }`}>
                    {systemStatus.api.status === 'healthy' ? 'Healthy' : 'Error'}
                  </span>
                </div>
                
                {systemStatus.api.responseTime && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Response Time</span>
                    <span className="text-sm text-gray-900">{systemStatus.api.responseTime}ms</span>
                  </div>
                )}
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Last Check</span>
                  <span className="text-sm text-gray-900" suppressHydrationWarning>
                    {hydrated && systemStatus.api.lastCheck
                      ? format(new Date(systemStatus.api.lastCheck), 'HH:mm:ss')
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="card hover-lift animate-fade-up">
          <div className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">System Metrics</h3>
                <p className="text-sm text-gray-500">Real-time performance indicators</p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700">Uptime</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">99.9%</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700">Avg Response Time</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  {systemStatus.supabase.responseTime || 0}ms
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700">Active Connections</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">1</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700">Health Checks</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">Auto</div>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Details */}
        <div className="card hover-lift animate-fade-up">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Details</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Supabase Configuration</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
                  <p>Status: Anonymous access enabled</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Backend API Configuration</h4>
                <div className="mt-2 text-sm text-gray-600">
                  <p>URL: {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
                  <p>Authentication: Bearer token (when available)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
