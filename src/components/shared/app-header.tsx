import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/use-user'

type BreadcrumbItem = {
  label: string
  to?: string
  params?: Record<string, string>
}

type AppHeaderProps = {
  breadcrumbs?: Array<BreadcrumbItem>
  children?: React.ReactNode
}

export function AppHeader({ breadcrumbs = [], children }: AppHeaderProps) {
  const user = useUser()

  return (
    <header className="border-border border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {breadcrumbs.length === 0 ? (
            <span className="text-xl font-semibold">Betania</span>
          ) : (
            breadcrumbs.map((item, index) => {
              const isFirst = index === 0
              const isLast = index === breadcrumbs.length - 1

              return (
                <div key={index} className="flex items-center gap-4">
                  {index > 0 && (
                    <span className="text-muted-foreground">/</span>
                  )}
                  {item.to ? (
                    <Link
                      to={item.to}
                      params={item.params}
                      className={
                        isFirst ? 'text-xl font-semibold' : 'hover:underline'
                      }
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
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">{user?.email}</span>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={(props) => (
              <Link {...props} to="/logout">
                Sign out
              </Link>
            )}
          />
        </div>
      </div>
    </header>
  )
}
