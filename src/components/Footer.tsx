import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { EXPERIENCE_LANGUAGES } from '@/lib/experienceLanguages';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  currentLang?: string;
  /**
   * Extra columns for pages that can build them from their own data — the
   * homepage passes destinations and experience countries it has just rendered,
   * so the links are guaranteed to resolve.
   */
  columns?: FooterColumn[];
}

/**
 * Site footer.
 *
 * Until now this was a logo, a language switcher and a copyright line: no links
 * at all, which left /experiences reachable only from the experiences pages
 * themselves. The default column set exists so that every page — not just the
 * homepage — links into both sections.
 */
export default function Footer({ currentLang, columns }: FooterProps) {
  const lang = currentLang || 'en';

  const defaults: FooterColumn[] = [
    {
      title: 'MondoExplora',
      links: [
        { label: 'Hotel deals', href: `/${lang}/` },
        ...(EXPERIENCE_LANGUAGES.includes(lang)
          ? [{ label: 'Guided experiences', href: `/${lang}/experiences/` }]
          : []),
        { label: 'Privacy & cookies', href: `/${lang}/privacy/` },
      ],
    },
  ];

  const shown = columns && columns.length > 0 ? columns : defaults;

  return (
    <footer>
      <div className="max-w-7xl mx-auto px-4">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="flex items-center gap-2">
              <span className="text-lg font-light">Mondo</span>
              <span className="text-lg font-bold bg-white/30 text-blue-900 px-2 py-1 rounded">
                Explora
              </span>
            </div>
            <p className="footer-blurb">
              Discounted stays and guided outdoor trips, in one place. We are paid
              a commission by our partners when you book — it never changes your
              price.
            </p>
          </div>

          {shown.map((column) => (
            <nav className="footer-column" key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="footer-legal">
          <p>
            © {new Date().getFullYear()} MondoExplora. All rights reserved.
          </p>
          {currentLang && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Idioma / Language:</span>
              <LanguageSwitcher currentLang={currentLang} />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
