import { useEffect, useRef } from 'react'

import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import type { Language } from '@/i18n'

import { useUser } from '@/hooks/use-user'
import { setLanguageCookie } from '@/lib/language-cookie'
import {
  useLanguage,
  usePreferencesActions,
  usePreferredTheme,
} from '@/stores/preferencesStore'

export function useSyncPreferences() {
  const user = useUser()
  const language = useLanguage()
  const theme = usePreferredTheme()
  const { setPreferences } = usePreferencesActions()
  const { i18n } = useTranslation()
  const { setTheme } = useTheme()
  const hasSyncedRef = useRef(false)

  // On mount: load DB preferences into store (once)
  useEffect(() => {
    if (hasSyncedRef.current || !user) return
    hasSyncedRef.current = true

    if (user.language || user.theme) {
      setPreferences({
        ...(user.language ? { language: user.language as Language } : {}),
        ...(user.theme
          ? { theme: user.theme as 'light' | 'dark' | 'system' }
          : {}),
      })
    }
  }, [user, setPreferences])

  // Sync language changes to i18next + html lang attribute + cookie
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
    document.documentElement.lang = language
    setLanguageCookie(language)
  }, [language, i18n])

  // Sync theme changes to next-themes
  useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])
}
