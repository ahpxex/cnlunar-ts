/**
 * i18n module for cnlunar-bun
 * Provides translation utilities for multi-language support
 */

export type { Locale, TranslationData, TranslationLabels } from "./types";
import type { Locale, TranslationData } from "./types";
import { zh } from "./locales/zh";
import { en } from "./locales/en";

const locales: Record<Locale, TranslationData> = {
  zh,
  en,
};

let defaultLocale: Locale = "zh";

/**
 * Get translations for a specific locale
 * @param locale - The locale to get translations for (defaults to 'zh')
 * @returns TranslationData for the specified locale
 */
export function getTranslations(locale: Locale = defaultLocale): TranslationData {
  const translations = locales[locale];
  if (!translations) {
    throw new Error(`Unsupported locale: ${locale}. Supported locales: ${Object.keys(locales).join(", ")}`);
  }
  return translations;
}

/**
 * Set the default locale for all new Lunar instances
 * @param locale - The locale to set as default
 */
export function setDefaultLocale(locale: Locale): void {
  if (!locales[locale]) {
    throw new Error(`Unsupported locale: ${locale}. Supported locales: ${Object.keys(locales).join(", ")}`);
  }
  defaultLocale = locale;
}

/**
 * Get the current default locale
 * @returns The current default locale
 */
export function getDefaultLocale(): Locale {
  return defaultLocale;
}

/**
 * Get list of supported locales
 * @returns Array of supported locale codes
 */
export function getSupportedLocales(): Locale[] {
  return Object.keys(locales) as Locale[];
}
