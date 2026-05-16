import { useState } from 'react'
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
  type AdminUserSummary,
} from '@/services/adminApi'
import { formatDate } from '@/utils/format'
import { Search, ChevronLeft, ChevronRight, Users, X, Shield, Mail, Calendar } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useNavigate } from 'react-router-dom'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const ROLE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'customer', label: 'Customer' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
]

export default function AdminCustomersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [detailUser, setDetailUser] = useState<AdminUserSummary | null>(null)

  const { data, isLoading, error } = useGetAdminUsersQuery({
    page,
    limit: 30,
    q: q || undefined,
    role: role || undefined,
    status: status || undefined,
  })

  const [updateStatus, { isLoading: isUpdating }] = useUpdateAdminUserStatusMutation()

  const users = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-argos-dark">Customers</h1>
      </div>

      {/* Filters */}
      <div className="bg-white border border-argos-border rounded p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={16} className="text-argos-gray" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            className="flex-1 border border-argos-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-argos-green"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-argos-dark">Role</label>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value)
              setPage(1)
            }}
            className="border border-argos-border rounded px-2 py-2 text-sm"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-argos-dark">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="border border-argos-border rounded px-2 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
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
          <p className="text-argos-red mb-2">Failed to load customers.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-argos-blue hover:underline text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-argos-border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-argos-gray-bg border-b border-argos-border">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Name</th>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Email</th>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Role</th>
                  <th className="text-center px-4 py-3 font-bold text-argos-dark">Status</th>
                  <th className="text-left px-4 py-3 font-bold text-argos-dark">Joined</th>
                  <th className="px-4 py-3 font-bold text-argos-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-argos-border hover:bg-argos-gray-bg transition-colors cursor-pointer"
                    onClick={() => setDetailUser(u)}
                  >
                    <td className="px-4 py-3 font-bold text-argos-dark">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-argos-gray">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge active={u.isActive} />
                    </td>
                    <td className="px-4 py-3 text-xs text-argos-gray">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/admin/orders?q=${encodeURIComponent(u.email)}`)
                        }}
                        className="text-xs font-bold text-argos-blue hover:underline"
                      >
                        Orders
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-argos-gray">
                      <Users size={40} className="mx-auto mb-2 text-argos-gray-light" />
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded border border-argos-border hover:bg-argos-gray-bg disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-argos-gray">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="p-2 rounded border border-argos-border hover:bg-argos-gray-bg disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail drawer */}
      {detailUser && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          onClick={() => setDetailUser(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-argos-border">
              <h2 className="font-bold text-argos-dark">Customer detail</h2>
              <button
                onClick={() => setDetailUser(null)}
                className="p-1 hover:bg-argos-gray-bg rounded"
              >
                <X size={18} className="text-argos-gray" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-argos-gray-bg flex items-center justify-center font-bold text-argos-dark">
                  {detailUser.firstName[0]}
                  {detailUser.lastName[0]}
                </div>
                <div>
                  <p className="font-bold text-argos-dark">
                    {detailUser.firstName} {detailUser.lastName}
                  </p>
                  <p className="text-xs text-argos-gray flex items-center gap-1">
                    <Mail size={12} />
                    {detailUser.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-argos-border rounded p-3">
                  <p className="text-xs text-argos-gray font-bold uppercase">Role</p>
                  <div className="mt-1">
                    <RoleBadge role={detailUser.role} />
                  </div>
                </div>
                <div className="border border-argos-border rounded p-3">
                  <p className="text-xs text-argos-gray font-bold uppercase">Status</p>
                  <div className="mt-1">
                    <StatusBadge active={detailUser.isActive} />
                  </div>
                </div>
              </div>

              <div className="border border-argos-border rounded p-3 space-y-1">
                <p className="text-xs text-argos-gray font-bold uppercase">Details</p>
                <div className="flex items-center gap-2 text-sm text-argos-dark">
                  <Shield size={14} className="text-argos-gray" />
                  {detailUser.emailVerified ? 'Email verified' : 'Email not verified'}
                </div>
                <div className="flex items-center gap-2 text-sm text-argos-dark">
                  <Calendar size={14} className="text-argos-gray" />
                  Joined {formatDate(detailUser.createdAt)}
                </div>
                {detailUser.lastLoginAt && (
                  <div className="flex items-center gap-2 text-sm text-argos-dark">
                    <Calendar size={14} className="text-argos-gray" />
                    Last login {formatDate(detailUser.lastLoginAt)}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={async () => {
                    try {
                      await updateStatus({
                        id: detailUser.id,
                        isActive: !detailUser.isActive,
                      }).unwrap()
                      setDetailUser({ ...detailUser, isActive: !detailUser.isActive })
                    } catch {
                      // toast handles error via RTK middleware
                    }
                  }}
                  disabled={isUpdating}
                  className={cn(
                    'flex-1 font-bold px-4 py-2 rounded text-sm transition-colors',
                    detailUser.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-argos-green text-white hover:bg-argos-green-dark',
                  )}
                >
                  {isUpdating
                    ? 'Saving...'
                    : detailUser.isActive
                      ? 'Deactivate account'
                      : 'Activate account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        'inline-block text-xs font-bold px-2 py-0.5 rounded uppercase',
        role === 'admin'
          ? 'bg-purple-100 text-purple-700'
          : role === 'staff'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700',
      )}
    >
      {role}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-block text-xs font-bold px-2 py-0.5 rounded uppercase',
        active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
      )}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
