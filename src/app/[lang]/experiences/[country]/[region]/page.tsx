import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import FilterableExperiences from '@/components/experiences/FilterableExperiences';
import {
  getActivities,
  getExperiencesInRegion,
  getRegion,
  getRegions,
} from '@/lib/experiences';
import {
  breadcrumbJsonLd,
  experiencesUrl,
  itemListJsonLd,
  regionMetadata,
} from '@/lib/experienceSeo';
import { EXPERIENCE_LANGUAGES } from '@/lib/experienceLanguages';
import '@/styles/experiences.css';

export const dynamic = 'force-static';

interface PageProps {
  params: Promise<{ lang: string; country: string; region: string }>;
}

export async function generateStaticParams() {
  const regions = await getRegions();
  return EXPERIENCE_LANGUAGES.flatMap((lang) =>
    regions.map((r) => ({ lang, country: r.countrySlug, region: r.slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, country, region } = await params;
  const data = await getRegion(country, region);
  if (!data) return { title: 'Region not found' };
  return regionMetadata(lang, data);
}

/**
 * Everything in a region renders on one page. Paginating would need either a
 * query string (invisible to a static export) or a page-2 route multiplying the
 * page count; a single page also gives search engines one strong URL per region
 * instead of a thin series.
 */
export default async function RegionExperiencesPage({ params }: PageProps) {
  const { lang, country, region } = await params;
  if (!EXPERIENCE_LANGUAGES.includes(lang)) notFound();

  const data = await getRegion(country, region);
  if (!data) notFound();

  const [experiences, activities] = await Promise.all([
    getExperiencesInRegion(country, region),
    getActivities({ countrySlug: country, regionSlug: region }),
  ]);

  // Nearest cities are a property of the region, so the first experience's list
  // is representative; each experience page carries its own.
  const gateways = experiences[0]?.gatewayCities.slice(0, 4) ?? [];

  return (
    <div className="exp-page">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Home', url: `https://mondoexplora.com/${lang}/` },
          { name: 'Experiences', url: experiencesUrl(lang) },
          { name: data.country, url: experiencesUrl(lang, data.countrySlug) },
          {
            name: data.name,
            url: experiencesUrl(lang, data.countrySlug, data.slug),
          },
        ])}
      />
      <StructuredData
        data={itemListJsonLd(
          `Experiences in ${data.name}`,
          experiences.slice(0, 50).map((e) => ({
            name: e.title,
            url: experiencesUrl(lang, e.countrySlug, e.regionSlug, e.slug),
          }))
        )}
      />

      <div
        className="exp-hero"
        style={{ backgroundImage: `url(${data.coverPhoto})` }}
      >
        <div className="exp-hero-tint" />
        <div className="exp-hero-inner">
          <div className="exp-wrap">
            <div className="exp-logo">
              <span className="a">Mondo</span>
              <span className="b">Explora</span>
            </div>
            <div className="exp-crumbs">
              <Link href={`/${lang}/`}>Home</Link>
              <span className="sep">/</span>
              <Link href={`/${lang}/experiences/`}>Experiences</Link>
              <span className="sep">/</span>
              <Link href={`/${lang}/experiences/${data.countrySlug}/`}>
                {data.country}
              </Link>
              <span className="sep">/</span>
              <span>{data.name}</span>
            </div>
            <h1>{data.name}</h1>
            <p className="exp-lede">
              {data.count} guided {data.count === 1 ? 'experience' : 'experiences'}{' '}
              in {data.name}, {data.country} — mostly{' '}
              {data.topActivities.join(', ').toLowerCase()}. From €
              {data.minPriceEur}.
            </p>
          </div>
        </div>
      </div>

      <div className="exp-wrap exp-sec">
        <FilterableExperiences
          experiences={experiences}
          activities={activities}
          lang={lang}
        />
      </div>

      {gateways.length > 0 && (
        <div className="exp-wrap exp-sec">
          <div className="exp-sec-head">
            <h2>Getting to {data.name}</h2>
            <p>
              Typical drive times from the nearest major cities. Every experience
              page lists its own distances.
            </p>
          </div>
          <div className="exp-tiles">
            {gateways.map((c) => (
              <div key={c.name} className="exp-tile" style={{ boxShadow: 'none' }}>
                <span className="stackable">
                  <h3>{c.name}</h3>
                  <span className="sub">{c.country}</span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  <strong style={{ color: '#28a745', fontSize: 15 }}>
                    {c.drive_time_estimate}
                  </strong>
                  <span
                    style={{ display: 'block', fontSize: 12, color: '#9ca3af' }}
                  >
                    {Math.round(c.distance_km)} km
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer currentLang={lang} />
    </div>
  );
}
