import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { api } from 'convex/_generated/api'

import {
  CaretDown,
  Check,
  Desktop,
  Moon,
  SignOut,
  Sun,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import type { Language } from '@/i18n'
import { LANGUAGE_CONFIG, SUPPORTED_LANGUAGES } from '@/i18n'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/hooks/use-user'
import { useConvexMutation } from '@/lib/convex'
import { setLanguageCookie } from '@/lib/language-cookie'
import {
  useLanguage,
  usePreferencesActions,
  usePreferredTheme,
} from '@/stores/preferencesStore'

export function PreferencesDropdown() {
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
      <DropdownMenuTrigger className="focus:ring-ring flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm outline-none focus:ring-2">
        <span className="text-muted-foreground">{user?.email}</span>
        <CaretDown className="text-muted-foreground size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
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
