'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface SearchEntry {
  name: string;
  href: string;
  /** Shown as a chip on the result row: destination, country, region… */
  kind: string;
}

export interface QuickLink {
  name: string;
  href: string;
}

interface HomeHeroProps {
  lang: string;
  /** Hotels and destinations. */
  stays: SearchEntry[];
  /** Experience countries and regions. Empty on languages without a catalogue. */
  experiences: SearchEntry[];
  quickLinks: QuickLink[];
  totalHotels: number;
  totalExperiences: number;
  heroImage: string;
}

type Mode = 'stays' | 'experiences';

const MAX_RESULTS = 8;

/**
 * Compact hero: one search box over two catalogues.
 *
 * The segmented control switches which list is being searched rather than
 * sending the visitor to a different page first — the two catalogues have
 * separate URL trees, and asking someone to pick a section before they have
 * typed anything is a decision they cannot yet make.
 *
 * The control is hidden entirely when there are no experiences to search, which
 * is every language except English (see lib/experienceLanguages).
 */
export default function HomeHero({
  lang,
  stays,
  experiences,
  quickLinks,
  totalHotels,
  totalExperiences,
  heroImage,
}: HomeHeroProps) {
  const [mode, setMode] = useState<Mode>('stays');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const hasExperiences = experiences.length > 0;
  const source = mode === 'experiences' ? experiences : stays;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const starts: SearchEntry[] = [];
    const contains: SearchEntry[] = [];
    for (const item of source) {
      const name = item.name.toLowerCase();
      if (name.startsWith(q)) starts.push(item);
      else if (name.includes(q)) contains.push(item);
      if (starts.length >= MAX_RESULTS) break;
    }
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [query, source]);

  // A click anywhere else closes the dropdown; without this it stays open over
  // the deals row and swallows the first click on a card.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const go = (href: string) => {
    window.location.href = href;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results[0]) go(results[0].href);
  };

  const placeholder =
    mode === 'experiences'
      ? 'Search a country or mountain region…'
      : `Search ${stays.length.toLocaleString('en-GB')} destinations…`;

  return (
    <>
      <nav className="mx-nav" aria-label="Main">
        <Link href={`/${lang}/`} className="mx-logo">
          <span className="a">Mondo</span>
          <span className="b">Explora</span>
        </Link>
        <div className="mx-nav-links">
          <a href="#deals" className="on">
            Hotel deals
          </a>
          {hasExperiences && <Link href={`/${lang}/experiences/`}>Experiences</Link>}
          <a href="#regions">Destinations</a>
        </div>
        <div className="mx-nav-right">{lang.toUpperCase()}</div>
      </nav>

      <header
        className="mx-hero"
        style={{ ['--mx-hero-image' as string]: `url('${heroImage}')` }}
      >
        <div className="mx-wrap">
          <h1>Where do you want to go?</h1>
          <p className="mx-sub">
            {totalHotels.toLocaleString('en-GB')} hotel deals
            {hasExperiences
              ? ` · ${totalExperiences.toLocaleString('en-GB')} guided trips`
              : ''}{' '}
            · refreshed every morning
          </p>

          {hasExperiences && (
            <div className="mx-seg" role="tablist" aria-label="What to search">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'stays'}
                className={mode === 'stays' ? 'on' : undefined}
                onClick={() => setMode('stays')}
              >
                Stays
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'experiences'}
                className={mode === 'experiences' ? 'on' : undefined}
                onClick={() => setMode('experiences')}
              >
                Experiences
              </button>
            </div>
          )}

          <div className="mx-searchbox" ref={boxRef}>
            <form className="mx-search" onSubmit={submit} role="search">
              <div className="mx-search-field">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-4.4-4.4" />
                </svg>
                <input
                  type="search"
                  value={query}
                  placeholder={placeholder}
                  aria-label={placeholder}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                  }}
                  onFocus={() => setOpen(true)}
                />
              </div>
              <button type="submit" className="mx-search-go">
                Search
              </button>
            </form>

            {open && results.length > 0 && (
              <div className="mx-results">
                {results.map((item) => (
                  <button
                    key={`${item.kind}-${item.href}`}
                    type="button"
                    onClick={() => go(item.href)}
                  >
                    <span>{item.name}</span>
                    <span className="kind">{item.kind}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {quickLinks.length > 0 && (
            <p className="mx-quick">
              Popular right now:{' '}
              {quickLinks.map((q, i) => (
                <span key={q.href}>
                  {i > 0 && ' · '}
                  <Link href={q.href}>{q.name}</Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </header>
    </>
  );
}
