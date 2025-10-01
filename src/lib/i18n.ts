export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'it'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
};

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  it: '🇮🇹',
};

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

export function getDefaultLanguage(): SupportedLanguage {
  return 'en';
}

export function getLanguageFromPath(pathname: string): string {
  const langMatch = pathname.match(/^\/([a-z]{2})/);
  return langMatch ? langMatch[1] : getDefaultLanguage();
}

export function removeLanguageFromPath(pathname: string): string {
  return pathname.replace(/^\/[a-z]{2}/, '') || '/';
} 