
import { Link } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'

type NavLink = {
  label: string
  to: string
}

type PublicLayoutProps = {
  children: ReactNode
  navLinks?: Array<NavLink>
}

export function PublicLayout({ children, navLinks }: PublicLayoutProps) {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Button
              variant="link"
              className="p-0 text-xl font-semibold"
              render={(props) => (
                <Link {...props} to="/">
                  {APP_NAME}
                </Link>
              )}
            />
            {navLinks && (
              <nav className="flex items-center gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            render={(props) => (
              <Link {...props} to="/dashboard">
                {t('landing.signIn')}
              </Link>
            )}
          />
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="border-border border-t py-6">
        <div className="text-muted-foreground container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {APP_NAME}.{' '}
            {t('landing.allRightsReserved')}
          </p>
          <nav className="flex gap-4">
            <Link to="/legal/privacy" className="hover:underline">
              {t('landing.privacy')}
            </Link>
            <Link to="/legal/terms" className="hover:underline">
              {t('landing.terms')}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
