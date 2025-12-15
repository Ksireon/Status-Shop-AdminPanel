import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-public-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          surname: string
          company: string | null
          position: string | null
          city: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          surname: string
          company?: string | null
          position?: string | null
          city?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          surname?: string
          company?: string | null
          position?: string | null
          city?: string | null
          phone?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: number
          name: Record<string, any>
          description: Record<string, any>
          type: string
          image: string
          color: string
          price: number
          meters: number
          size: string
          tag: string
          created_at: string
        }
        Insert: {
          id?: number
          name: Record<string, any>
          description: Record<string, any>
          type: string
          image: string
          color: string
          price: number
          meters: number
          size: string
          tag: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: Record<string, any>
          description?: Record<string, any>
          type?: string
          image?: string
          color?: string
          price?: number
          meters?: number
          size?: string
          tag?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          short_id: string
          user_id: string
          email: string
          name: string
          phone: string
          branch: string
          branch_key: string
          branch_address: string
          delivery_type: string
          delivery_address: string | null
          payment_method: string
          total: number
          status: string
          items: Record<string, any>[]
          created_at: string
        }
        Insert: {
          id?: string
          short_id: string
          user_id: string
          email: string
          name: string
          phone: string
          branch: string
          branch_key: string
          branch_address: string
          delivery_type: string
          delivery_address?: string | null
          payment_method: string
          total: number
          status?: string
          items: Record<string, any>[]
          created_at?: string
        }
        Update: {
          id?: string
          short_id?: string
          user_id?: string
          email?: string
          name?: string
          phone?: string
          branch?: string
          branch_key?: string
          branch_address?: string
          delivery_type?: string
          delivery_address?: string | null
          payment_method?: string
          total?: number
          status?: string
          items?: Record<string, any>[]
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: number
          user_id: string
          tag: string
          data: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          tag: string
          data: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          tag?: string
          data?: Record<string, any>
          created_at?: string
        }
      }
    }
  }
}

export type Tables = Database['public']['Tables']
