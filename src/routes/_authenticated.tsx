import { useEffect, useRef } from 'react'

import {
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from '@tanstack/react-router'

import { getAuth, getSignInUrl } from '@workos/authkit-tanstack-react-start'
import { api } from 'convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'

import { AppSidebar } from '@/components/shared/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { useSyncPreferences } from '@/hooks/use-sync-preferences'

export const Route = createFileRoute('/_authenticated')({
  loader: async ({ context, location }) => {
    const { user: workosUser } = await getAuth()
    if (!workosUser) {
      const signInUrl = await getSignInUrl({
        data: { returnPathname: location.pathname },
      })
      throw redirect({ href: signInUrl })
    }

    // Prefetch user and org memberships in parallel (sidebar needs orgs)
    const [user] = await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.users.getByAuthKitId, { authKitId: workosUser.id }),
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.organizationMemberships.getByUser, {
          authKitId: workosUser.id,
        }),
      ),
    ])

    if (!user) {
      // User should exist from auth callback, redirect to sign in if not
      const signInUrl = await getSignInUrl({
        data: { returnPathname: location.pathname },
      })
      throw redirect({ href: signInUrl })
    }

    return { authKitId: workosUser.id }
  },
  component: AuthenticatedLayout,
})

function SyncPreferences({ children }: { children: React.ReactNode }) {
  useSyncPreferences()
  return children
}

/** Close the mobile sidebar sheet when the route changes. */
function CloseSidebarOnNavigate() {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      setOpenMobile(false)
    }
  }, [pathname, setOpenMobile])

  return null
}

function AuthenticatedLayout() {
  return (
    <SyncPreferences>
      <SidebarProvider>
        <CloseSidebarOnNavigate />
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="animate-in fade-in flex-1 p-4 duration-200 sm:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SyncPreferences>
  )
}
