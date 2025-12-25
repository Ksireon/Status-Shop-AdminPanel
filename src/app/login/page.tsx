'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const e = email.trim().toLowerCase()
      const p = password.trim()
      let role: 'owner' | 'director' | 'manager' | null = null
      if (e === 'owner@status.shop' && p === 'status1234') role = 'owner'
      if (e === 'director@status.shop' && p === 'status4321') role = 'director'
      if (e === 'manager@status.shop' && p === 'status2026') role = 'manager'
      if (!role) {
        setError('Неверный логин или пароль')
        return
      }
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `admin_role=${role}; path=/; expires=${expires}`
      document.cookie = `admin_email=${encodeURIComponent(e)}; path=/; expires=${expires}`
      if (role === 'owner') {
        document.cookie = `active_branch=all; path=/; expires=${expires}`
      }
      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Вход в админ-панель</h1>
        <p className="mt-1 text-sm text-gray-600">Введите служебные учетные данные</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@status.shop"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Пароль</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            Войти
          </button>
          <div className="text-xs text-gray-500">
            Владелец: owner@status.shop / status1234<br />
            Директор: director@status.shop / status4321<br />
            Менеджер: manager@status.shop / status2026
          </div>
        </form>
      </div>
    </div>
  )
}

