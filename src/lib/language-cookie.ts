import type { Language } from '@/i18n'
import { SUPPORTED_LANGUAGES } from '@/i18n'

export const LANGUAGE_COOKIE_NAME = 'lang'

export function setLanguageCookie(lang: Language) {
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${lang}; path=/; max-age=31536000; SameSite=Lax`
}

export function detectLanguageFromHeader(header: string | undefined): Language {
  if (!header) return 'es'

  const languages = header
    .split(',')
    .map((part) => {
      const [locale, qParam] = part.trim().split(';')
      const q = qParam ? parseFloat(qParam.split('=')[1] ?? '0') : 1
      return { locale: locale.trim().split('-')[0].toLowerCase(), q }
    })
    .sort((a, b) => b.q - a.q)

  for (const { locale } of languages) {
    if (SUPPORTED_LANGUAGES.includes(locale as Language)) {
      return locale as Language
    }
  }

  return 'es'
}
