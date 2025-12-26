'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, Tables } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

type ProductRow = Tables['products']['Row']

export default function ProductViewPage() {
  const router = useRouter()
  const params = useParams()
  const productId = String(params.id as string || '')
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<ProductRow | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('products').select('*').eq('id', productId).single()
        if (error) throw error
        setProduct(data as ProductRow)
      } catch (e) {
        alert('Не удалось загрузить товар')
      } finally {
        setLoading(false)
      }
    }
    if (productId) load()
  }, [productId])

  const textFromMulti = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>
      return (String(obj['en'] || obj['uk'] || '')).trim()
    }
    return ''
  }

  const deleteProduct = async () => {
    if (!productId) return
    if (!confirm('Удалить товар?')) return
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      alert('Не удалось удалить товар')
      return
    }
    router.push('/products')
    router.refresh()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Товар</h2>
            <p className="text-sm text-gray-500">ID: {productId}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/products/${productId}/edit`}
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-semibold text-gray-700"
            >
              Редактировать
            </Link>
            <button
              onClick={deleteProduct}
              className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Удалить
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : product ? (
          <div className="bg-white shadow rounded-xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={
                      product.image ||
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEgxMDBWMTUwSDUwVjEwMEgxMDBWNTBaIiBmaWxsPSIjOUI5QjlCIi8+Cjwvc3ZnPgo='
                    }
                    alt={textFromMulti(product.name)}
                    width={800}
                    height={400}
                    className="h-64 w-full object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xl font-semibold text-gray-900">{textFromMulti(product.name)}</div>
                <div className="text-sm text-gray-500">{textFromMulti(product.description)}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-900">UZS {new Intl.NumberFormat('ru-RU').format(Number(product.price ?? 0))}</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{product.type || 'type'}</span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Характеристика: {product.characteristic || '-'}</p>
                  <p>Цвет: {product.color || '-'}</p>
                  <p>Количество: {Number(product.amount ?? 0) || 0}</p>
                </div>
                <div className="text-xs text-gray-500">Тег: {product.tag}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">Товар не найден</div>
        )}
      </div>
    </DashboardLayout>
  )
}
