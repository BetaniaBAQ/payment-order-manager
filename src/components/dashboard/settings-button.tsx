import { Link } from '@tanstack/react-router'

import { GearSix } from '@phosphor-icons/react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SettingsButtonProps {
  slug: string
  profileSlug?: string
  size?: 'small' | 'large'
}

const sizeClasses = {
  small: 'size-4',
  large: 'size-10',
} as const

export function SettingsButton({
  slug,
  profileSlug,
  size = 'small',
}: SettingsButtonProps) {
  const isLarge = size === 'large'

  const linkProps = profileSlug
    ? {
        to: '/orgs/$slug/profiles/$profileSlug/settings' as const,
        params: { slug, profileSlug },
      }
    : { to: '/orgs/$slug/settings' as const, params: { slug } }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={isLarge ? 'h-10 w-10 p-0' : undefined}
            nativeButton={false}
            render={
              <Link {...linkProps}>
                <GearSix
                  weight="fill"
                  size={isLarge ? 40 : undefined}
                  className={sizeClasses[size]}
                />
              </Link>
            }
          />
        }
      />
      <TooltipContent>
        <p>Settings</p>
      </TooltipContent>
    </Tooltip>
  )
}
