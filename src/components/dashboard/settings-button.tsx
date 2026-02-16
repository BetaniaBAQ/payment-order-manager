import { Link } from '@tanstack/react-router'

import { GearSix } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

interface SettingsButtonProps {
  slug: string
  profileSlug?: string
}

export function SettingsButton({ slug, profileSlug }: SettingsButtonProps) {
  const { t } = useTranslation('common')

  const linkProps = profileSlug
    ? {
        to: '/orgs/$slug/profiles/$profileSlug/settings' as const,
        params: { slug, profileSlug },
      }
    : { to: '/orgs/$slug/settings' as const, params: { slug } }

  return (
    <Button
      variant="outline"
      nativeButton={false}
      render={
        <Link {...linkProps}>
          <GearSix data-icon="inline-start" />
          {t('sidebar.settings')}
        </Link>
      }
    />
  )
}
