const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://status-shop-backend-production.up.railway.app/api/v1'

export interface User {
  id: string
  email: string
  name: string
  surname: string
  company?: string
  position?: string
  city?: string
  phone?: string
  created_at: string
}

export interface Order {
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
  delivery_address?: string
  payment_method: string
  total: number
  status: string
  items: Array<{
    tag: string
    name: Record<string, unknown>
    price: number
    quantity: number
  }>
  created_at: string
}

export interface Product {
  id: number
  name: Record<string, unknown>
  description: Record<string, unknown>
  type: Record<string, unknown>
  image: string
  color: Record<string, unknown>
  price: number
  amount: number
  characteristic: Record<string, unknown>
  tag: string
  created_at: string
}

export interface CartItem {
  id: number
  user_id: string
  tag: string
  data: Record<string, unknown>
  created_at: string
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      if (response.status === 204) {
        return undefined as T
      }
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        return (await response.json()) as T
      }
      const text = await response.text()
      return text as unknown as T
    } catch (error) {
      console.error('API request error:', error)
      throw error
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    // Since we don't have a direct endpoint for all users, we'll get them from Supabase
    throw new Error('Use Supabase client for users')
  }

  async getUser(uid: string): Promise<User> {
    return this.request<User>(`/users/${uid}`)
  }

  async updateUser(uid: string, data: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${uid}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getUserOrders(uid: string): Promise<Order[]> {
    return this.request<Order[]>(`/users/${uid}/orders`)
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    // Since we don't have a direct endpoint for all orders, we'll get them from Supabase
    throw new Error('Use Supabase client for orders')
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`)
  }

  async createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    return this.request<Order>(`/orders`, {
      method: 'POST',
      body: JSON.stringify(order),
    })
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    return this.request<Order>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Products
  async getProducts(page = 1, limit = 20, sort = 'created_at', order = 'desc'): Promise<Product[]> {
    return this.request<Product[]>(`/products?page=${page}&limit=${limit}&sort=${sort}&order=${order}`)
  }

  // Cart
  async getUserCart(uid: string): Promise<CartItem[]> {
    return this.request<CartItem[]>(`/users/${uid}/cart`)
  }

  async addCartItem(uid: string, item: Omit<CartItem, 'id' | 'created_at'>): Promise<CartItem> {
    return this.request<CartItem>(`/users/${uid}/cart`, {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  async deleteCartItem(uid: string, tag: string): Promise<void> {
    await this.request<void>(`/users/${uid}/cart/${tag}`, {
      method: 'DELETE',
    })
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/products?page=1&limit=1`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        return { status: 'ok', timestamp: new Date().toISOString() }
      }
      throw new Error(`Health check failed: ${response.status}`)
    } catch {
      return { status: 'error', timestamp: new Date().toISOString() }
    }
  }
}

export const apiService = new ApiService()
