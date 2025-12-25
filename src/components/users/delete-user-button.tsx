'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteUserButtonProps {
  userId: string
}

export function DeleteUserButton({ userId }: DeleteUserButtonProps) {
  const router = useRouter()
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch('/api/users/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data?.error || 'Delete failed')
        }
        router.refresh()
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Failed to delete user')
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-900"
      title="Delete User"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
