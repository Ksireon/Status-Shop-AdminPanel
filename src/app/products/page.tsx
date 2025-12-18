'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'
import { Tables } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Trash2, Eye, Plus } from 'lucide-react'

type Product = Tables['products']['Row']

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const textFromMulti = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>
      const en = obj['en']
      const uk = obj['uk']
      if (typeof en === 'string' && en) return en
      if (typeof uk === 'string' && uk) return uk
    }
    return ''
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId)

        if (error) throw error
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="brand-header brand-gradient">Products Catalog</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your product inventory and catalog.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/products/new"
              className="ml-3 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="card hover-lift animate-fade-up">
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <div key={product.id} className="card hover-lift border border-gray-200">
                    <div className="p-4">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                        <Image
                          src={
                            product.image ||
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEgxMDBWMTUwSDUwVjEwMEgxMDBWNTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPgo='
                          }
                          alt={textFromMulti(product.name)}
                          width={800}
                          height={400}
                          className="h-48 w-full object-cover"
                          unoptimized
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {textFromMulti(product.name)}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {textFromMulti(product.description)}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-lg font-semibold text-gray-900">
                            ₴{product.price.toFixed(2)}
                          </p>
                          <span className="text-sm text-gray-500">
                            {product.type}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Size: {product.size}</p>
                          <p>Color: {product.color}</p>
                          <p>Meters: {product.meters}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Tag: {product.tag}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/products/${product.id}`}
                              className="text-red-600 hover:text-red-700"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/products/${product.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-700"
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
