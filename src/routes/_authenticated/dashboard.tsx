import { createFileRoute } from '@tanstack/react-router'

import { AppHeader } from '@/components/app-header'
import { useUser } from '@/hooks/use-user'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const user = useUser()

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader breadcrumbs={[{ label: 'Betania', to: '/dashboard' }]} />

      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            Your dashboard is ready. Start managing payment orders.
          </p>
        </div>
      </main>
    </div>
  )
}
