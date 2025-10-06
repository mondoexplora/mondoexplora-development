'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, LANGUAGE_FLAGS } from '@/lib/i18n';

const languages = SUPPORTED_LANGUAGES.map(code => ({
  code,
  name: LANGUAGE_NAMES[code],
  flag: LANGUAGE_FLAGS[code],
}));

interface LanguageSwitcherProps {
  currentLang: string;
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const pathname = usePathname();
  
  // Extract the path without language prefix
  const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '') || '/';
  
  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <Link
          key={lang.code}
          href={`/${lang.code}${pathWithoutLang}`}
          className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
            currentLang === lang.code
              ? 'bg-blue-600 text-white'
              : 'text-white hover:text-blue-300 hover:bg-gray-700'
          }`}
        >
          <span>{lang.flag}</span>
          <span className="hidden sm:inline">{lang.name}</span>
        </Link>
      ))}
    </div>
  );
} 