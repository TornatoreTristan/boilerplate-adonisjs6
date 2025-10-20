export interface TranslatableField {
  fr: string
  en: string
}

export type TranslatableFieldNullable = TranslatableField | null

export function getTranslation(
  field: TranslatableField | TranslatableFieldNullable | null | undefined,
  locale: 'fr' | 'en'
): string {
  if (!field) return ''

  const fallbackLocale = locale === 'fr' ? 'en' : 'fr'
  return field[locale] || field[fallbackLocale] || ''
}
