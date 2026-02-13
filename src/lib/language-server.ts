import { createServerFn } from '@tanstack/react-start'
import { getCookie, getRequestHeader } from '@tanstack/react-start/server'

import type { Language } from '@/i18n'
import { SUPPORTED_LANGUAGES } from '@/i18n'

import {
  LANGUAGE_COOKIE_NAME,
  detectLanguageFromHeader,
} from '@/lib/language-cookie'

export const getServerLanguage = createServerFn({ method: 'GET' }).handler(
  () => {
    const cookieLang = getCookie(LANGUAGE_COOKIE_NAME)
    if (cookieLang && SUPPORTED_LANGUAGES.includes(cookieLang as Language)) {
      return cookieLang as Language
    }

    const acceptLanguage = getRequestHeader('accept-language')
    return detectLanguageFromHeader(acceptLanguage)
  },
)
