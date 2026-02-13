import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { z } from 'zod'


import enBilling from './locales/en/billing.json'
import enCommon from './locales/en/common.json'
import enErrors from './locales/en/errors.json'
import enOrders from './locales/en/orders.json'
import enSettings from './locales/en/settings.json'
import esBilling from './locales/es/billing.json'
import esCommon from './locales/es/common.json'
import esErrors from './locales/es/errors.json'
import esOrders from './locales/es/orders.json'
import esSettings from './locales/es/settings.json'
import { i18nErrorMap } from '@/lib/validators/i18n-error-map'

export const SUPPORTED_LANGUAGES = ['es', 'en'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

function getInitialLanguage(): Language {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)lang=(\w+)/)
    const lang = match?.[1]
    if (lang && SUPPORTED_LANGUAGES.includes(lang as Language)) {
      return lang as Language
    }
  }
  return 'es'
}

export const LANGUAGE_CONFIG: Record<
  Language,
  { label: string; flag: string }
> = {
  es: { label: 'Español', flag: 'ES' },
  en: { label: 'English', flag: 'EN' },
}

const NAMESPACES = [
  'common',
  'orders',
  'settings',
  'billing',
  'errors',
] as const

i18n.use(initReactI18next).init({
  lng: getInitialLanguage(),
  resources: {
    es: {
      common: esCommon,
      orders: esOrders,
      settings: esSettings,
      billing: esBilling,
      errors: esErrors,
    },
    en: {
      common: enCommon,
      orders: enOrders,
      settings: enSettings,
      billing: enBilling,
      errors: enErrors,
    },
  },
  fallbackLng: 'es',
  defaultNS: 'common',
  ns: [...NAMESPACES],
  interpolation: {
    escapeValue: false,
  },
})

z.config({ localeError: i18nErrorMap })

export default i18n
