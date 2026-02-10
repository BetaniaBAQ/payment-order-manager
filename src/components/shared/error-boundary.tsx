import { useTranslation } from 'react-i18next'

export function ErrorFallback() {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('errors.somethingWentWrong')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('errors.weveBeenNotified')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 underline"
        >
          {t('errors.reloadPage')}
        </button>
      </div>
    </div>
  )
}
