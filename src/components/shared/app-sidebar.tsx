import { Suspense } from 'react'

import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { Link, getRouteApi, useLocation } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'
import {
  CaretUpDown,
  Check,
  Desktop,
  Gear,
  Moon,
  Plus,
  SignOut,
  Sun,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import type { Id } from 'convex/_generated/dataModel'

import type { Language } from '@/i18n'
import { LANGUAGE_CONFIG, SUPPORTED_LANGUAGES } from '@/i18n'

import { BetaniaLogo } from '@/components/shared/betania-logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useUser } from '@/hooks/use-user'
import { isOwnerOrAdmin } from '@/lib/auth'
import { ROUTES } from '@/lib/constants'
import { convexQuery, useConvexMutation } from '@/lib/convex'
import { setLanguageCookie } from '@/lib/language-cookie'
import {
  useLanguage,
  usePreferencesActions,
  usePreferredTheme,
} from '@/stores/preferencesStore'

const PROFILE_COLORS = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
] as const

const TIER_BADGE_VARIANT: Record<string, 'secondary' | 'default' | 'outline'> =
  {
    free: 'secondary',
    pro: 'default',
    enterprise: 'outline',
  }

const authRoute = getRouteApi('/_authenticated')

export function AppSidebar() {
  const { t } = useTranslation('common')
  const { authKitId } = authRoute.useLoaderData()
  const location = useLocation()

  // Extract org slug from URL
  const slugMatch = location.pathname.match(/\/orgs\/([^/]+)/)
  const currentSlug = slugMatch?.[1]

  const { data: organizations } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getByUser, { authKitId }),
  )

  const currentOrg = currentSlug
    ? organizations.find((org) => org.slug === currentSlug)
    : undefined

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <OrgSwitcher
              organizations={organizations}
              currentOrg={currentOrg}
              currentSlug={currentSlug}
              authKitId={authKitId}
            />
          </SidebarMenuItem>
          {currentOrg && (
            <Suspense>
              <SettingsMenuItem
                orgId={currentOrg._id}
                slug={currentOrg.slug}
                authKitId={authKitId}
              />
            </Suspense>
          )}
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {currentOrg && (
          <Suspense
            fallback={<ProfilesSkeleton label={t('sidebar.profiles')} />}
          >
            <ProfilesGroup orgId={currentOrg._id} slug={currentOrg.slug} />
          </Suspense>
        )}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

// ---------------------------------------------------------------------------
// Org Switcher
// ---------------------------------------------------------------------------

type OrgSwitcherProps = {
  organizations: Array<{ _id: string; name: string; slug: string }>
  currentOrg: { _id: string; name: string; slug: string } | undefined
  currentSlug: string | undefined
  authKitId: string
}

function OrgSwitcher({
  organizations,
  currentOrg,
  currentSlug,
  authKitId,
}: OrgSwitcherProps) {
  const { t } = useTranslation('common')
  const { t: tb } = useTranslation('billing')

  const { data: subscription } = useQuery(
    convexQuery(api.subscriptions.getByOrganization, {
      organizationId: (currentOrg?._id ?? '') as Id<'organizations'>,
    }),
  )
  const tier = subscription?.tier ?? 'free'

  const convexUpdateLastSelectedOrg = useConvexMutation(
    api.users.updateLastSelectedOrg,
  )
  const updateLastSelectedOrg = useMutation({
    mutationFn: (args: {
      authKitId: string
      organizationId: Id<'organizations'>
    }) => convexUpdateLastSelectedOrg(args),
  })

  const handleOrgSelect = (organizationId: string) => {
    updateLastSelectedOrg.mutate({
      authKitId,
      organizationId: organizationId as Id<'organizations'>,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors duration-150"
          />
        }
      >
        <BetaniaLogo className="logo-glow size-6 shrink-0" />
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="font-serif text-sm tracking-tight">Betania</span>
          <span className="flex items-center gap-1.5 text-xs font-medium opacity-80">
            <span className="truncate">
              {currentOrg?.name ?? t('sidebar.organizations')}
            </span>
            {currentOrg && (
              <Badge
                variant={TIER_BADGE_VARIANT[tier] ?? 'secondary'}
                className="h-4 px-1.5 text-[10px] leading-none"
              >
                {tb(`tiers.${tier}`)}
              </Badge>
            )}
          </span>
        </div>
        <CaretUpDown className="ml-auto size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
        align="start"
      >
        <DropdownMenuItem
          render={(props) => <Link {...props} to={ROUTES.newOrg} />}
        >
          <Plus />
          <span>{t('breadcrumbs.createOrganization')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('sidebar.organizations')}</DropdownMenuLabel>
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org._id}
              render={(props) => (
                <Link
                  {...props}
                  to={ROUTES.org}
                  params={{ slug: org.slug }}
                  onClick={() => handleOrgSelect(org._id)}
                />
              )}
            >
              <span>{org.name}</span>
              {org.slug === currentSlug && <Check className="ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// Profiles Group
// ---------------------------------------------------------------------------

function ProfilesGroup({ orgId, slug }: { orgId: string; slug: string }) {
  const { t } = useTranslation('common')
  const location = useLocation()

  const { data: profiles } = useSuspenseQuery(
    convexQuery(api.paymentOrderProfiles.getByOrganization, {
      organizationId: orgId as Id<'organizations'>,
    }),
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground font-serif text-sm tracking-tight">
        {t('sidebar.profiles')}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {profiles.map((profile, index) => {
            const profilePath = `/orgs/${slug}/profiles/${profile.slug}`
            const isActive = location.pathname.startsWith(profilePath)
            const colorClass = PROFILE_COLORS[index % PROFILE_COLORS.length]

            return (
              <SidebarMenuItem key={profile._id}>
                <SidebarMenuButton
                  className="sidebar-active-indicator transition-colors duration-150"
                  isActive={isActive}
                  render={
                    <Link
                      to={ROUTES.profile}
                      params={{ slug, profileSlug: profile.slug }}
                    />
                  }
                >
                  <span
                    className={`size-2 shrink-0 rounded-full ${colorClass}`}
                  />
                  <span>{profile.name}</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>{profile.paymentOrderCount}</SidebarMenuBadge>
              </SidebarMenuItem>
            )
          })}
          {profiles.length === 0 && (
            <SidebarMenuItem>
              <div className="flex flex-col items-center gap-2 px-2 py-4">
                <div className="bg-sidebar-accent/10 flex size-8 items-center justify-center rounded-lg">
                  <Plus className="text-sidebar-foreground/40 size-4" />
                </div>
                <span className="text-muted-foreground text-xs">
                  {t('empty.profiles.title')}
                </span>
              </div>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function ProfilesSkeleton({ label }: { label: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {Array.from({ length: 3 }).map((_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// ---------------------------------------------------------------------------
// Settings Menu Item (conditional on role)
// ---------------------------------------------------------------------------

function SettingsMenuItem({
  orgId,
  slug,
  authKitId,
}: {
  orgId: string
  slug: string
  authKitId: string
}) {
  const { t } = useTranslation('common')
  const location = useLocation()

  const { data: memberRole } = useSuspenseQuery(
    convexQuery(api.organizationMemberships.getMemberRole, {
      organizationId: orgId as Id<'organizations'>,
      authKitId,
    }),
  )

  if (!isOwnerOrAdmin(memberRole)) return null

  const settingsPath = `/orgs/${slug}/settings`
  const isActive = location.pathname.startsWith(settingsPath)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="sidebar-active-indicator text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors duration-150"
        isActive={isActive}
        render={<Link to={ROUTES.orgSettings} params={{ slug }} />}
      >
        <Gear />
        <span>{t('sidebar.settings')}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// ---------------------------------------------------------------------------
// User Menu
// ---------------------------------------------------------------------------

function UserMenu() {
  const user = useUser()
  const language = useLanguage()
  const theme = usePreferredTheme()
  const { setLanguage, setTheme } = usePreferencesActions()
  const { t } = useTranslation('common')

  const convexUpdate = useConvexMutation(api.users.update)
  const updateMutation = useMutation({
    mutationFn: (args: Parameters<typeof convexUpdate>[0]) =>
      convexUpdate(args),
  })

  const handleLanguageChange = (newLanguage: Language) => {
    if (newLanguage === language) return
    setLanguage(newLanguage)
    setLanguageCookie(newLanguage)
    if (user) {
      updateMutation.mutate({
        id: user._id,
        authKitId: user.authKitId,
        language: newLanguage,
      })
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === theme) return
    setTheme(newTheme)
    if (user) {
      updateMutation.mutate({
        id: user._id,
        authKitId: user.authKitId,
        theme: newTheme,
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors duration-150"
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="truncate text-xs font-medium">{user?.email}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-48"
        side="top"
        align="start"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('preferences.language')}</DropdownMenuLabel>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
            >
              <span>{LANGUAGE_CONFIG[lang].flag}</span>
              <span>{t(`preferences.languages.${lang}`)}</span>
              {language === lang && <Check className="ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('preferences.theme')}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleThemeChange('light')}>
            <Sun />
            <span>{t('preferences.light')}</span>
            {theme === 'light' && <Check className="ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
            <Moon />
            <span>{t('preferences.dark')}</span>
            {theme === 'dark' && <Check className="ml-auto" />}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('system')}>
            <Desktop />
            <span>{t('preferences.system')}</span>
            {theme === 'system' && <Check className="ml-auto" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={(props) => <Link {...props} to="/logout" />}>
          <SignOut />
          <span>{t('preferences.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
