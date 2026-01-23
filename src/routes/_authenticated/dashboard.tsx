import { Link, createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/use-user'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const user = useUser()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-semibold">Betania</span>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">{user.email}</span>
            <Button
              variant="outline"
              size="sm"
              render={(props) => (
                <Link {...props} to="/logout">
                  Sign out
                </Link>
              )}
            />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="max-w-2xl space-y-6 text-center">
          <h1 className="text-3xl font-bold">
            Welcome, {user.firstName ?? user.email}
          </h1>
          <p className="text-muted-foreground">
            Your dashboard is ready. Start managing payment orders.
          </p>
        </div>
      </main>
    </div>
  )
}
