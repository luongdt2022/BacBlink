import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ConfirmModal } from '@/shared/ui/confirm-modal'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from '@/services/intakeService'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const load = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch {
      toast.error('Không thể tải danh mục')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setIsSaving(true)
    try {
      await createCategory(newName.trim())
      toast.success('Đã thêm danh mục')
      setNewName('')
      setIsAdding(false)
      await load()
    } catch {
      toast.error('Không thể thêm danh mục')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = async (id: string) => {
    if (!editingName.trim()) return
    setIsSaving(true)
    try {
      await updateCategory(id, editingName.trim())
      toast.success('Đã cập nhật danh mục')
      setEditingId(null)
      await load()
    } catch {
      toast.error('Không thể cập nhật danh mục')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteCategory(deletingId)
      toast.success('Đã xóa danh mục')
      setDeletingId(null)
      await load()
    } catch {
      toast.error('Không thể xóa danh mục')
    }
  }

  const deletingCategory = categories.find((c) => c.id === deletingId)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý Danh mục</h1>
          <p className="mt-1 text-sm text-gray-500">Danh sách danh mục dùng để phân loại Cung & Cầu</p>
        </div>
        <Button onClick={() => { setIsAdding(true); setNewName('') }}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-600">Tên danh mục</th>
              <th className="px-6 py-3 text-right font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">Đang tải...</td>
              </tr>
            ) : categories.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-400">Chưa có danh mục nào</td>
              </tr>
            ) : null}

            {isAdding && (
              <tr className="bg-blue-50/40">
                <td className="px-6 py-3">
                  <Input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') void handleAdd(); if (e.key === 'Escape') setIsAdding(false) }}
                    placeholder="Nhập tên danh mục..."
                    className="h-8 text-sm"
                  />
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" onClick={() => void handleAdd()} disabled={isSaving || !newName.trim()}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}

            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3">
                  {editingId === cat.id ? (
                    <Input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') void handleEdit(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                      className="h-8 text-sm"
                    />
                  ) : (
                    <span className="font-medium text-gray-800">{cat.name}</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {editingId === cat.id ? (
                      <>
                        <Button size="sm" onClick={() => void handleEdit(cat.id)} disabled={isSaving || !editingName.trim()}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditingId(cat.id); setEditingName(cat.name) }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeletingId(cat.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deletingId}
        onOpenChange={(open) => { if (!open) setDeletingId(null) }}
        onConfirm={() => void handleDelete()}
        title="Xóa danh mục"
        description={`Bạn có chắc muốn xóa danh mục "${deletingCategory?.name ?? ''}"? Các Cung/Cầu thuộc danh mục này sẽ không còn danh mục.`}
        confirmText="Xóa"
        variant="danger"
      />
    </div>
  )
}
