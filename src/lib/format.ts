import { enUS } from 'date-fns/locale/en-US'
import { es } from 'date-fns/locale/es'
import type { Language } from '@/i18n'
import type { Locale } from 'date-fns/locale'

import { useLanguage } from '@/stores/preferencesStore'

const LOCALE_MAP: Record<Language, string> = {
  es: 'es-CO',
  en: 'en-US',
}

export const DATE_FNS_LOCALES: Record<Language, Locale> = {
  es,
  en: enUS,
}

export function useLocale(): string {
  const language = useLanguage()
  return LOCALE_MAP[language]
}

export function formatCurrency(
  amount: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(
  timestamp: number,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(
    locale,
    options ?? { month: 'short', day: 'numeric', year: 'numeric' },
  ).format(timestamp)
}

export function formatDateTime(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp)
}

export function formatFileSize(bytes: number, locale: string): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(kb)} KB`
  }
  const mb = bytes / (1024 * 1024)
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(mb)} MB`
}
