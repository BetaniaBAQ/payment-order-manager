import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

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

export const SUPPORTED_LANGUAGES = ['es', 'en'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
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
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

export default i18n
