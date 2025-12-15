'use client'

import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface DeleteUserButtonProps {
  userId: string
}

export function DeleteUserButton({ userId }: DeleteUserButtonProps) {
  const router = useRouter()
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this user?')) {
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
          .from('profiles')
          .delete()
          .eq('id', userId)
        
        if (error) throw error
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
