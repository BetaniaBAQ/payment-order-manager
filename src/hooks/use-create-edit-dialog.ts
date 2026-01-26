import { useCallback, useState } from 'react'

/**
 * Hook to manage create/edit dialog state pattern
 * Encapsulates the common pattern of having a dialog that can be opened
 * for creating new items or editing existing ones.
 */
export function useCreateEditDialog<T>() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)

  const openCreate = useCallback(() => {
    setEditingItem(null)
    setIsOpen(true)
  }, [])

  const openEdit = useCallback((item: T) => {
    setEditingItem(item)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setEditingItem(null)
  }, [])

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        close()
      }
    },
    [close],
  )

  return {
    isOpen,
    editingItem,
    isEditing: editingItem !== null,
    openCreate,
    openEdit,
    close,
    onOpenChange,
  }
}
