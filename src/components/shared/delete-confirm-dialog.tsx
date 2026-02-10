import { useTranslation } from 'react-i18next'
import type { ReactElement } from 'react'


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmDialogProps {
  title: string
  description: string
  onConfirm: () => void
  trigger?: ReactElement
  isPending?: boolean
}

export function DeleteConfirmDialog({
  title,
  description,
  onConfirm,
  trigger,
  isPending,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation('common')

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          trigger ?? (
            <Button variant="ghost" size="sm">
              {t('actions.delete')}
            </Button>
          )
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? t('actions.deleting') : t('actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
