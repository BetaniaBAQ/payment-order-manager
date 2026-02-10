import i18n from 'i18next'
import type { ZodErrorMap } from 'zod'

export const i18nErrorMap: ZodErrorMap = (issue) => {
  const t = i18n.t.bind(i18n)

  if (
    issue.code === 'too_small' &&
    'minimum' in issue &&
    issue.minimum === 1 &&
    'origin' in issue &&
    issue.origin === 'string'
  ) {
    return { message: t('errors:validation.required') }
  }

  if (issue.code === 'invalid_type' && 'expected' in issue) {
    return {
      message: t('errors:validation.invalidType', {
        expected: issue.expected,
      }),
    }
  }

  if (issue.code === 'too_small' && 'minimum' in issue) {
    const key =
      'origin' in issue && issue.origin === 'string'
        ? 'errors:validation.tooSmall'
        : 'errors:validation.tooSmallNumber'
    return { message: t(key, { minimum: issue.minimum }) }
  }

  if (issue.code === 'too_big' && 'maximum' in issue) {
    const key =
      'origin' in issue && issue.origin === 'string'
        ? 'errors:validation.tooBig'
        : 'errors:validation.tooBigNumber'
    return { message: t(key, { maximum: issue.maximum }) }
  }

  if (
    issue.code === 'invalid_format' &&
    'format' in issue &&
    issue.format === 'email'
  ) {
    return { message: t('errors:validation.invalidEmail') }
  }

  if (issue.code === 'invalid_format') {
    return { message: t('errors:validation.invalidFormat') }
  }

  return { message: t('errors:validation.invalidString') }
}
