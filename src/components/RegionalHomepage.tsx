import Footer, { type FooterColumn } from './Footer';
import HomeHero, { type QuickLink, type SearchEntry } from './home/HomeHero';
import HomeDeals from './home/HomeDeals';
import HomeExperiences from './home/HomeExperiences';
import HomeRegions, { type RegionalData } from './home/HomeRegions';
import HomeFaq from './home/HomeFaq';
import type { HomepageContent } from '@/lib/homepage-content';

/** Everything the page loads, plus the language it is being rendered for. */
interface RegionalHomepageProps extends HomepageContent {
  lang?: string;
}

/**
 * The hero normally uses the top deal's own photograph — a hotel we are actually
 * selling. This stock plate is only reached when the feed has no deal at all.
 */
const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

/** The five busiest destinations, as the hero's shortcut row. */
function quickLinks(regionalData: RegionalData, lang: string): QuickLink[] {
  const destinations: { name: string; slug: string; count: number }[] = [];

  for (const region of Object.values(regionalData)) {
    for (const country of Object.values(region.countries)) {
      for (const [name, info] of Object.entries(country.destinations)) {
        destinations.push({
          name: name
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          slug: name
            .toLowerCase()
            .replace(/_/g, '-')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, ''),
          count: info.hotelCount,
        });
      }
    }
  }

  return destinations
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((d) => ({ name: d.name, href: `/${lang}/destination/${d.slug}/` }));
}

/**
 * The homepage.
 *
 * Order is deliberate and is the whole design: search, then hotels you can book,
 * then trips you can book, then the region grid that links the rest of the site,
 * then the FAQ. The page used to open on the region grid and never showed a
 * single hotel.
 *
 * A server component — only the three interactive pieces (search, activity
 * chips, region tabs) and the deal cards' clickout ship JavaScript.
 */
export default function RegionalHomepage({
  regionalData,
  searchData,
  lang = 'en',
  totalHotels,
  deals,
  discountedCount,
  experiences,
  activities,
  totalExperiences,
  experienceSearch,
  faq,
}: RegionalHomepageProps) {
  // Built from what this page just rendered, so every link is known to resolve:
  // deal.citySlug is a destination filename, and the experience countries come
  // from the same list the /experiences hub is built from.
  const footerColumns: FooterColumn[] = [
    {
      title: 'Stays',
      links: deals.slice(0, 4).map((deal) => ({
        label: deal.city,
        href: `/${lang}/destination/${deal.citySlug}/`,
      })),
    },
  ];

  const experienceCountries = experienceSearch
    .filter((entry) => entry.kind === 'country')
    .slice(0, 4);

  if (experienceCountries.length > 0) {
    footerColumns.push({
      title: 'Experiences',
      links: [
        { label: `All ${totalExperiences.toLocaleString('en-GB')} trips`, href: `/${lang}/experiences/` },
        ...experienceCountries.map((c) => ({ label: c.name, href: c.href })),
      ],
    });
  }

  footerColumns.push({
    title: 'Company',
    links: [{ label: 'Privacy & cookies', href: `/${lang}/privacy/` }],
  });

  const stays: SearchEntry[] = searchData.map((item) => ({
    name: item.name,
    href:
      item.type === 'country'
        ? `/${lang}/country/${item.slug}/`
        : `/${lang}/destination/${item.slug}/`,
    kind: item.type,
  }));

  return (
    <main className="min-h-screen">
      <HomeHero
        lang={lang}
        stays={stays}
        experiences={experienceSearch}
        quickLinks={quickLinks(regionalData, lang)}
        totalHotels={totalHotels}
        totalExperiences={totalExperiences}
        heroImage={deals[0]?.image ?? FALLBACK_HERO}
      />

      <HomeDeals deals={deals} discountedCount={discountedCount} lang={lang} />

      {experiences.length > 0 && (
        <HomeExperiences
          experiences={experiences}
          activities={activities}
          totalExperiences={totalExperiences}
          lang={lang}
        />
      )}

      <HomeRegions
        regionalData={regionalData}
        lang={lang}
        totalHotels={totalHotels}
      />

      <HomeFaq entries={faq} />

      <Footer currentLang={lang} columns={footerColumns} />
    </main>
  );
}
