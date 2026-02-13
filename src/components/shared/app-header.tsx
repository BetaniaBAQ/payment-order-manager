import { Link } from '@tanstack/react-router'

import { BetaniaLogo } from '@/components/shared/betania-logo'
import { OrgBreadcrumbChooser } from '@/components/shared/org-breadcrumb-chooser'
import { PreferencesDropdown } from '@/components/shared/preferences-dropdown'

type BreadcrumbLabelItem = {
  label: string
  to?: string
  params?: Record<string, string>
}

type BreadcrumbOrgChooserItem = {
  type: 'org-chooser'
  currentSlug: string
}

type BreadcrumbItem = BreadcrumbLabelItem | BreadcrumbOrgChooserItem

type AppHeaderProps = {
  breadcrumbs?: Array<BreadcrumbItem>
  children?: React.ReactNode
}

function isOrgChooser(item: BreadcrumbItem): item is BreadcrumbOrgChooserItem {
  return 'type' in item
}

export function AppHeader({ breadcrumbs = [], children }: AppHeaderProps) {
  return (
    <header className="border-border border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {breadcrumbs.length === 0 ? (
            <BetaniaLogo className="size-8" />
          ) : (
            breadcrumbs.map((item, index) => {
              const isFirst = index === 0
              const isLast = index === breadcrumbs.length - 1

              return (
                <div key={index} className="flex items-center gap-4">
                  {index > 0 && (
                    <span className="text-muted-foreground">/</span>
                  )}
                  {isOrgChooser(item) ? (
                    <OrgBreadcrumbChooser currentOrgSlug={item.currentSlug} />
                  ) : isFirst && item.to ? (
                    <Link to={item.to} params={item.params}>
                      <BetaniaLogo className="size-8" />
                    </Link>
                  ) : item.to ? (
                    <Link
                      to={item.to}
                      params={item.params}
                      className="hover:underline"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'font-medium' : ''}>
                      {item.label}
                    </span>
                  )}
                </div>
              )
            })
          )}
          {children}
        </div>
        <PreferencesDropdown />
      </div>
    </header>
  )
}
