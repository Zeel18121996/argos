import { useState } from 'react'
import {
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/services/categoriesApi'
import { Search, ChevronLeft, ChevronRight, Plus, X, ListTree } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Category } from '@/types/category.types'

export default function AdminCategoriesPage() {
  const { data: response, isLoading, error } = useGetAdminCategoriesQuery()
  const categories = (response as any)?.data ?? []
  const [createCat, { isLoading: isCreating }] = useCreateCategoryMutation()
  const [updateCat, { isLoading: isUpdating }] = useUpdateCategoryMutation()
  const [deleteCat, { isLoading: isDeleting }] = useDeleteCategoryMutation()

  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)

  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [imageUrl, setImageUrl] = useState('')

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.slug.toLowerCase().includes(q.toLowerCase()),
  )

  const openCreate = () => {
    setEditCat(null)
    setSlug('')
    setName('')
    setParentId('')
    setSortOrder('0')
    setImageUrl('')
    setFormOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditCat(cat)
    setSlug(cat.slug)
    setName(cat.name)
    setParentId(cat.parentId ?? '')
    setSortOrder(String(cat.sortOrder ?? 0))
    setImageUrl(cat.imageUrl ?? '')
    setFormOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      slug,
      name,
      parentId: parentId || undefined,
      sortOrder: Number(sortOrder) || 0,
      imageUrl: imageUrl || undefined,
    }
    try {
      if (editCat) {
        await updateCat({
          id: editCat.id,
          body: {
            ...payload,
            parentId: parentId || null,
            imageUrl: imageUrl || null,
          },
        }).unwrap()
      } else {
        await createCat(payload).unwrap()
      }
      setFormOpen(false)
    } catch {
      // error handled by RTK middleware
    }
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this category? Products assigned to it may be affected.')) return
    try {
      await deleteCat(id).unwrap()
    } catch {
      // error handled by RTK middleware
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-argos-dark">Categories</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-argos-green text-white font-bold px-4 py-2 rounded hover:bg-argos-green-dark transition-colors"
        >
          <Plus size={16} />
          Add category
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-argos-border rounded p-4 flex items-center gap-2">
        <Search size={16} className="text-argos-gray" />
        <input
          type="text"
          placeholder="Search by name or slug..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 border-none focus:outline-none text-sm"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-argos-red mb-2">Failed to load categories.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-argos-blue hover:underline text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white border border-argos-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-argos-gray-bg border-b border-argos-border">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-argos-dark">Name</th>
                <th className="text-left px-4 py-3 font-bold text-argos-dark">Slug</th>
                <th className="text-left px-4 py-3 font-bold text-argos-dark">Parent</th>
                <th className="text-center px-4 py-3 font-bold text-argos-dark">Sort</th>
                <th className="text-center px-4 py-3 font-bold text-argos-dark">Status</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-argos-border hover:bg-argos-gray-bg transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-argos-dark">{c.name}</td>
                  <td className="px-4 py-3 text-argos-gray">{c.slug}</td>
                  <td className="px-4 py-3 text-argos-gray">
                    {categories.find((p) => p.id === c.parentId)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">{c.sortOrder}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-block text-xs font-bold px-2 py-0.5 rounded uppercase',
                        c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                      )}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-xs font-bold text-argos-blue hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeactivate(c.id)}
                        disabled={isDeleting}
                        className="text-xs font-bold text-red-600 hover:underline disabled:opacity-50"
                      >
                        {isDeleting ? '…' : 'Deactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-argos-gray">
                    <ListTree size={40} className="mx-auto mb-2 text-argos-gray-light" />
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form drawer */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-argos-border">
              <h2 className="font-bold text-argos-dark">
                {editCat ? 'Edit category' : 'New category'}
              </h2>
              <button
                onClick={() => setFormOpen(false)}
                className="p-1 hover:bg-argos-gray-bg rounded"
              >
                <X size={18} className="text-argos-gray" />
              </button>
            </div>
            <form onSubmit={handleSave} className="flex-1 overflow-auto p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-argos-gray uppercase">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-argos-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-argos-green mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-argos-gray uppercase">Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-argos-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-argos-green mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-argos-gray uppercase">
                  Parent category
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full border border-argos-border rounded px-3 py-2 text-sm mt-1"
                >
                  <option value="">— None (top level) —</option>
                  {categories
                    .filter((c) => c.id !== editCat?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-argos-gray uppercase">Sort order</label>
                <input
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full border border-argos-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-argos-green mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-argos-gray uppercase">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-argos-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-argos-green mt-1"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="w-full bg-argos-green text-white font-bold px-4 py-2 rounded hover:bg-argos-green-dark transition-colors disabled:opacity-50"
                >
                  {isCreating || isUpdating
                    ? 'Saving…'
                    : editCat
                      ? 'Save changes'
                      : 'Create category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
