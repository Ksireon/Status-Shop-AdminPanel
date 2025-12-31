'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [query, setQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all')
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])

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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      let list = data || []
      if (query.trim()) {
        const q = query.toLowerCase()
        list = list.filter(
          (p) =>
            textFromMulti(p.name).toLowerCase().includes(q) ||
            textFromMulti(p.description).toLowerCase().includes(q) ||
            (p.tag || '').toLowerCase().includes(q),
        )
      }
      if (typeFilter !== 'all') {
        list = list.filter((p) => textFromMulti(p.type).toLowerCase() === typeFilter.toLowerCase())
      }
      if (categoryFilter !== 'all') {
        list = list.filter((p) => (p.category_id ?? null) === categoryFilter)
      }
      setProducts(list)
      const { data: cdata } = await supabase.from('categories').select('*').order('sort_order', { ascending: true })
      const mapped = (cdata || []).map((c: any) => ({
        id: c.id as number,
        name:
          typeof c.name === 'object'
            ? (c.name.en || c.name.uk || '')
            : String(c.name || ''),
      }))
      setCategories(mapped)
    } catch (error) {
      console.warn('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [query, typeFilter, categoryFilter])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

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
        console.warn('Error deleting product:', error)
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
        <div className="card p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-700">Search</label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, description or tag"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Type</label>
              <select
                className="mt-1 block w-40 rounded-md border-gray-300"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All</option>
                {Array.from(new Set(products.map((p) => textFromMulti(p.type)).filter((s) => !!s))).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Category</label>
              <select
                className="mt-1 block w-52 rounded-md border-gray-300"
                value={categoryFilter === 'all' ? 'all' : String(categoryFilter)}
                onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              >
                <option value="all">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary" onClick={fetchProducts}>Apply</button>
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
                  <div key={product.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="rounded-xl overflow-hidden bg-gray-100">
                        <Image
                          src={
                            product.image ||
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEgxMDBWMTUwSDUwVjEwMEgxMDBWNTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPgo='
                          }
                          alt={textFromMulti(product.name)}
                          width={800}
                          height={400}
                          className="h-56 w-full object-cover"
                          unoptimized
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {textFromMulti(product.name) || '—'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {textFromMulti(product.description)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Price</div>
                            <div className="text-lg font-bold text-gray-900">
                              UZS {Number(product.price).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            {textFromMulti(product.type) || 'type'}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            {textFromMulti(product.color) || 'color'}
                          </span>
                          {product.category_id && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                              {categories.find((c) => c.id === product.category_id)?.name || 'Category'}
                            </span>
                          )}
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            Amount: {Number(product.amount ?? 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-gray-500">
                            Tag: {product.tag}
                          </span>
                          <div className="flex items-center space-x-3">
                            <Link
                              href={`/products/${product.id}`}
                              className="text-gray-600 hover:text-gray-900"
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
