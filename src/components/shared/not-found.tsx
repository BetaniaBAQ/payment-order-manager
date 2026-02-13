import { Link } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'

export function NotFound() {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('errors.notFound')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('errors.notFoundDescription')}
        </p>
        <Link to="/" className="mt-4 inline-block underline">
          {t('errors.goHome')}
        </Link>
      </div>
    </div>
  )
}
