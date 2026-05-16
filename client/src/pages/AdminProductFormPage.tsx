import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetAdminProductQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
} from '@/services/adminProductsApi'
import { useGetCategoriesQuery } from '@/services/categoriesApi'
import type { Category } from '@/types/category.types'
import { ArrowLeft, Save, X, ImageIcon } from 'lucide-react'
import { resolveImageUrl } from '@/utils/imageUrl'

const DEFAULTS = {
  name: '',
  slug: '',
  sku: '',
  brand: '',
  description: '',
  categoryId: '',
  price: 0,
  compareAtPrice: 0,
  stockCount: 0,
  features: [] as string[],
  specifications: [] as Array<{ name: string; value: string }>,
  isActive: true,
  isFeatured: false,
  isOnOffer: false,
  isNew: false,
  isClearance: false,
  reserveAvailable: false,
}

function flattenCategories(
  cats: Category[],
  prefix = '',
  depth = 0,
): Array<{ id: string; label: string; depth: number }> {
  const out: Array<{ id: string; label: string; depth: number }> = []
  for (const c of cats) {
    const label = prefix ? `${prefix} › ${c.name}` : c.name
    out.push({ id: c.id, label, depth })
    if (c.children && c.children.length > 0) {
      out.push(...flattenCategories(c.children, label, depth + 1))
    }
  }
  return out
}

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: existing, isLoading: loadingProduct } = useGetAdminProductQuery(id ?? '', {
    skip: !isEdit,
  })
  const { data: categories = [] } = useGetCategoriesQuery()
  const [createProduct] = useCreateAdminProductMutation()
  const [updateProduct] = useUpdateAdminProductMutation()
  const [uploadImages] = useUploadProductImagesMutation()
  const [deleteImage] = useDeleteProductImageMutation()

  const [form, setForm] = useState(DEFAULTS)
  const [featureInput, setFeatureInput] = useState('')
  const [specName, setSpecName] = useState('')
  const [specValue, setSpecValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories])

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        slug: existing.slug,
        sku: existing.sku,
        brand: existing.brand ?? '',
        description: existing.description ?? '',
        categoryId: existing.categoryId,
        price: existing.price,
        compareAtPrice: existing.compareAtPrice ?? 0,
        stockCount: existing.stockCount,
        features: existing.features,
        specifications: existing.specifications,
        isActive: existing.isActive ?? true,
        isFeatured: existing.isFeatured ?? false,
        isOnOffer: existing.isOnOffer ?? false,
        isNew: existing.isNew ?? false,
        isClearance: existing.isClearance ?? false,
        reserveAvailable: existing.reserveAvailable ?? false,
      })
    }
  }, [existing])

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setPendingFiles((prev) => [...prev, ...files])
    const newPreviews = files.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...newPreviews])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePending = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      const url = prev[index]
      if (url) URL.revokeObjectURL(url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const existingImages = existing?.imagesFull ?? []

  const handleDeleteExistingImage = async (imageId: string) => {
    if (!id) return
    if (!confirm('Remove this image?')) return
    try {
      await deleteImage({ productId: id, imageId }).unwrap()
    } catch {
      alert('Failed to remove image')
    }
  }

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let productId = id
      if (isEdit && productId) {
        await updateProduct({ id: productId, body: form }).unwrap()
      } else {
        const created = await createProduct(form).unwrap()
        productId = created.id
      }

      // Upload pending images if any
      if (productId && pendingFiles.length > 0) {
        await uploadImages({ productId, files: pendingFiles }).unwrap()
        setPendingFiles([])
        setPreviews([])
      }

      navigate('/admin/products')
    } catch {
      alert('Failed to save product. Please check your inputs.')
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && loadingProduct) {
    return (
      <div className="page-container py-8">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container py-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="text-argos-gray hover:text-argos-dark transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-argos-dark">
          {isEdit ? 'Edit product' : 'Add new product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity */}
        <section className="bg-white border border-argos-border rounded p-6">
          <h2 className="text-lg font-bold text-argos-dark mb-4">Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-argos-dark block mb-1">
                Name <span className="text-argos-red">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full border border-argos-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-argos-dark block mb-1">
                Slug <span className="text-argos-red">*</span>
              </label>
              <input
                required
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
                className="w-full border border-argos-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-argos-dark block mb-1">
                SKU <span className="text-argos-red">*</span>
              </label>
              <input
                required
                value={form.sku}
                onChange={(e) => update('sku', e.target.value)}
                className="w-full border border-argos-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-argos-dark block mb-1">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => update('brand', e.target.value)}
                className="w-full border border-argos-border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-bold text-argos-dark block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              className="w-full border border-argos-border rounded px-3 py-2 text-sm"
            />
          </div>
        </section>

        {/* Category & Pricing */}
        <section className="bg-white border border-argos-border rounded p-6">
          <h2 className="text-lg font-bold text-argos-dark mb-4">Category & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-sm font-bold text-argos-dark block mb-1">
                Category <span className="text-argos-red">*</span>
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => update('categoryId', e.target.value)}
                className="w-full border border-argos-border rounded px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {'  '.repeat(c.depth)}
                    {c.depth > 0 ? '› ' : ''}
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-argos-dark block mb-1">
                Price (pence) <span className="text-argos-red">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.price}
                onChange={(e) => update('price', Number(e.target.value))}
                className="w-full border border-argos-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-argos-dark block mb-1">
                Compare at price (pence)
              </label>
              <input
                type="number"
                min={0}
                value={form.compareAtPrice || ''}
                onChange={(e) => update('compareAtPrice', Number(e.target.value) || 0)}
                className="w-full border border-argos-border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-bold text-argos-dark block mb-1">
              Stock count <span className="text-argos-red">*</span>
            </label>
            <input
              type="number"
              min={0}
              required
              value={form.stockCount}
              onChange={(e) => update('stockCount', Number(e.target.value))}
              className="w-40 border border-argos-border rounded px-3 py-2 text-sm"
            />
          </div>
        </section>

        {/* Images */}
        <section className="bg-white border border-argos-border rounded p-6">
          <h2 className="text-lg font-bold text-argos-dark mb-4">Images</h2>

          {/* Existing images */}
          {isEdit && existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-bold text-argos-dark mb-2">Existing images</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative w-24 h-24 border border-argos-border rounded overflow-hidden group bg-white"
                  >
                    <img
                      src={resolveImageUrl(img.url)}
                      alt={img.altText ?? ''}
                      className="w-full h-full object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-white/90 border border-argos-border rounded-full p-0.5 text-argos-red hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload area */}
          <div
            className="border-2 border-dashed border-argos-border rounded p-6 text-center hover:bg-argos-gray-bg transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFilesChange}
            />
            <ImageIcon size={32} className="mx-auto text-argos-gray mb-2" />
            <p className="text-sm font-bold text-argos-dark">Click to upload images</p>
            <p className="text-xs text-argos-gray mt-1">JPG, PNG, WebP up to 10 files</p>
          </div>

          {/* Pending previews */}
          {previews.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-bold text-argos-dark mb-2">Pending uploads</p>
              <div className="flex flex-wrap gap-3">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 border border-argos-border rounded overflow-hidden bg-white"
                  >
                    <img src={src} alt="preview" className="w-full h-full object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => removePending(i)}
                      className="absolute top-1 right-1 bg-white/90 border border-argos-border rounded-full p-0.5 text-argos-red hover:bg-red-50"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Features */}
        <section className="bg-white border border-argos-border rounded p-6">
          <h2 className="text-lg font-bold text-argos-dark mb-4">Features</h2>
          <div className="flex gap-2 mb-3">
            <input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="Add a feature"
              className="flex-1 border border-argos-border rounded px-3 py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (featureInput.trim()) {
                    update('features', [...form.features, featureInput.trim()])
                    setFeatureInput('')
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (featureInput.trim()) {
                  update('features', [...form.features, featureInput.trim()])
                  setFeatureInput('')
                }
              }}
              className="bg-argos-gray-bg border border-argos-border rounded px-3 py-2 text-sm font-bold hover:bg-argos-border transition-colors"
            >
              Add
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {form.features.map((f, i) => (
              <li
                key={i}
                className="bg-argos-gray-bg border border-argos-border rounded px-2 py-1 text-sm flex items-center gap-2"
              >
                {f}
                <button
                  type="button"
                  onClick={() =>
                    update(
                      'features',
                      form.features.filter((_, idx) => idx !== i),
                    )
                  }
                  className="text-argos-red hover:text-red-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Specifications */}
        <section className="bg-white border border-argos-border rounded p-6">
          <h2 className="text-lg font-bold text-argos-dark mb-4">Specifications</h2>
          <div className="flex gap-2 mb-3">
            <input
              value={specName}
              onChange={(e) => setSpecName(e.target.value)}
              placeholder="Name"
              className="flex-1 border border-argos-border rounded px-3 py-2 text-sm"
            />
            <input
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              placeholder="Value"
              className="flex-1 border border-argos-border rounded px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (specName.trim() && specValue.trim()) {
                  update('specifications', [
                    ...form.specifications,
                    { name: specName.trim(), value: specValue.trim() },
                  ])
                  setSpecName('')
                  setSpecValue('')
                }
              }}
              className="bg-argos-gray-bg border border-argos-border rounded px-3 py-2 text-sm font-bold hover:bg-argos-border transition-colors"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {form.specifications.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-argos-gray-bg rounded px-3 py-2 text-sm"
              >
                <span>
                  <strong>{s.name}</strong>: {s.value}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    update(
                      'specifications',
                      form.specifications.filter((_, idx) => idx !== i),
                    )
                  }
                  className="text-argos-red hover:text-red-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Flags */}
        <section className="bg-white border border-argos-border rounded p-6">
          <h2 className="text-lg font-bold text-argos-dark mb-4">Flags</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(
              [
                { key: 'isActive', label: 'Active' },
                { key: 'isFeatured', label: 'Featured' },
                { key: 'isOnOffer', label: 'On offer' },
                { key: 'isNew', label: 'New' },
                { key: 'isClearance', label: 'Clearance' },
                { key: 'reserveAvailable', label: 'Reserve available' },
              ] as const
            ).map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-argos-dark cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  className="w-4 h-4 accent-argos-green"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-argos-green text-white font-bold px-6 py-3 rounded hover:bg-argos-green-dark transition-colors disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving...' : isEdit ? 'Update product' : 'Create product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="border border-argos-border text-argos-dark font-bold px-6 py-3 rounded hover:bg-argos-gray-bg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
