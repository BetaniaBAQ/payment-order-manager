import { Link, createFileRoute } from '@tanstack/react-router'

import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/lib/constants'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-semibold">{APP_NAME}</span>
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

      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center px-4"
      >
        <div className="max-w-2xl space-y-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t('landing.hero')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('landing.heroDescription')}
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              render={(props) => (
                <Link {...props} to="/dashboard">
                  {t('landing.getStarted')}
                </Link>
              )}
            />
          </div>
        </div>
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
