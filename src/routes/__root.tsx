import { TanStackDevtools } from '@tanstack/react-devtools'
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import * as Sentry from '@sentry/tanstackstart-react'

import { ThemeProvider } from 'next-themes'
import { useTranslation } from 'react-i18next'

import '@/i18n'

import appCss from '../styles/globals.css?url'
import type { QueryClient } from '@tanstack/react-query'

import { ErrorFallback } from '@/components/shared/error-boundary'
import { RouteProgressBar } from '@/components/shared/route-progress-bar'
import { Toaster } from '@/components/ui/sonner'
import { APP_TITLE } from '@/lib/constants'


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          title: APP_TITLE,
        },
      ],
      links: [
        {
          rel: 'stylesheet',
          href: appCss,
        },
      ],
    }),

    shellComponent: RootDocument,
  },
)

function RootDocument({ children }: { children: React.ReactNode }) {
  const { i18n, t } = useTranslation('common')

  return (
    <html lang={i18n.language} suppressHydrationWarning>
      <head>
        <HeadContent />
        <script src="https://checkout.wompi.co/widget.js" />
        <script
          src="https://wompijs.wompi.com/libs/js/v1.js"
          data-public-key="pub_test_wFoeKqVV0LOo3A87m1yAdzsfUEMM4u0Z"
        />
      </head>
      <body>
        <RouteProgressBar />
        <a
          href="#main-content"
          className="focus:bg-background focus:text-foreground focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:ring-2"
        >
          {t('skipToContent')}
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
            {children}
          </Sentry.ErrorBoundary>
          <Toaster />
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'TanStack Query',
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: 'TanStack Form',
              render: <FormDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
