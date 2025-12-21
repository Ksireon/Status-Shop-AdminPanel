'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/supabase'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Trash2, User, ShoppingCart, Clock } from 'lucide-react'

type CartItem = Tables['cart_items']['Row']
type Profile = Tables['profiles']['Row']

interface CartItemWithUser extends CartItem {
  user: Profile | null
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemWithUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      setLoading(true)
      
      // Fetch cart items with user data
      const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (itemsError) throw itemsError

      // Fetch user data for each cart item
      const itemsWithUsers = await Promise.all(
        (items || []).map(async (item) => {
          const { data: user } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', item.user_id)
            .single()

          return {
            ...item,
            user: user || null,
          }
        })
      )

      setCartItems(itemsWithUsers)
    } catch (error) {
      console.error('Error fetching cart items:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCartItem = async (itemId: number) => {
    if (confirm('Are you sure you want to remove this item from the cart?')) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)

        if (error) throw error
        fetchCartItems()
      } catch (error) {
        console.error('Error deleting cart item:', error)
        alert('Failed to remove item from cart')
      }
    }
  }

  // Group cart items by user
  const cartItemsByUser = cartItems.reduce((acc, item) => {
    const userId = item.user_id
    if (!acc[userId]) {
      acc[userId] = []
    }
    acc[userId].push(item)
    return acc
  }, {} as Record<string, CartItemWithUser[]>)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Cart Monitoring
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Monitor active shopping carts and abandoned items.
            </p>
          </div>
        </div>

        {/* Cart Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Cart Items</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{cartItems.length}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{Object.keys(cartItemsByUser).length}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Items per Cart</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {cartItems.length > 0 ? Math.round(cartItems.length / Object.keys(cartItemsByUser).length) : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Items by User */}
        <div className="space-y-6">
          {Object.entries(cartItemsByUser).map(([userId, items]) => {
            const user = items[0].user
            return (
              <div key={userId} className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user ? `${user.name} ${user.surname}` : 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {user?.email || 'No email'} • {items.length} items
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Last updated: {format(new Date(items[0].created_at), 'MMM d, yyyy HH:mm', { locale: ru })}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{item.tag}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Added: {format(new Date(item.created_at), 'MMM d, yyyy HH:mm', { locale: ru })}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteCartItem(item.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Remove from cart"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {cartItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No cart items</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are currently no items in any shopping carts.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
