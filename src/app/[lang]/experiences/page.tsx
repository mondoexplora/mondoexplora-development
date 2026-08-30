import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import FilterableTiles from '@/components/experiences/FilterableTiles';
import {
  getActivities,
  getCountries,
  getTopRegions,
  getTotals,
} from '@/lib/experiences';
import {
  breadcrumbJsonLd,
  experiencesUrl,
  hubMetadata,
  itemListJsonLd,
} from '@/lib/experienceSeo';
import { EXPERIENCE_LANGUAGES } from '@/lib/experienceLanguages';
import '@/styles/experiences.css';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return EXPERIENCE_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const totals = await getTotals();
  const countries = await getCountries();
  return hubMetadata(lang, totals, countries[0]?.coverPhoto);
}

export default async function ExperiencesHubPage({ params }: PageProps) {
  const { lang } = await params;
  if (!EXPERIENCE_LANGUAGES.includes(lang)) notFound();

  const [totals, countries, activities, topRegions] = await Promise.all([
    getTotals(),
    getCountries(),
    getActivities(),
    getTopRegions(3),
  ]);

  const featuredCountries = countries.slice(0, 8);
  const featuredActivities = activities.slice(0, 12);
  const heroPhoto = topRegions[0]?.coverPhoto ?? countries[0]?.coverPhoto;

  return (
    <div className="exp-page">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Home', url: `https://mondoexplora.com/${lang}/` },
          { name: 'Experiences', url: experiencesUrl(lang) },
        ])}
      />
      <StructuredData
        data={itemListJsonLd(
          'Experiences by country',
          featuredCountries.map((c) => ({
            name: c.name,
            url: experiencesUrl(lang, c.slug),
          }))
        )}
      />

      <div
        className="exp-hero"
        style={heroPhoto ? { backgroundImage: `url(${heroPhoto})` } : undefined}
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
              <span>Experiences</span>
            </div>
            <h1>Guided outdoor experiences, run by certified guides</h1>
            <p className="exp-lede">
              {totals.experiences.toLocaleString('en-GB')} hiking, climbing, ski
              touring and canyoning trips across {totals.countries} countries —
              each with a real guide, a real price, and how far it is from the
              nearest city.
            </p>
          </div>
        </div>
      </div>

      <div className="exp-wrap exp-sec">
        <div className="exp-sec-head">
          <h2>Experiences by country</h2>
          <p>
            {totals.activities} activity types across {totals.countries}{' '}
            countries. Filter by activity, then pick a country to see its regions.
          </p>
        </div>
        <FilterableTiles
          tiles={featuredCountries.map((c) => ({
            key: c.slug,
            href: `/${lang}/experiences/${c.slug}/`,
            title: c.name,
            metaCount: c.count,
            metaSuffix: `experiences · ${c.regionCount} regions`,
            sub: c.topRegions.join(' · '),
            activityCounts: c.activityCounts,
          }))}
          activities={featuredActivities}
          allLabel="All countries"
          allCount={featuredCountries.length}
        />
        {countries.length > featuredCountries.length && (
          <div style={{ marginTop: '1.5rem' }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>
              Showing the 8 largest of {countries.length} countries.
            </span>
          </div>
        )}
      </div>

      <div className="exp-wrap exp-sec">
        <div className="exp-sec-head">
          <h2>Popular regions right now</h2>
          <p>The regions with the deepest catalogue of guided trips.</p>
        </div>
        <div className="exp-grid">
          {topRegions.map((r) => (
            <Link
              key={`${r.countrySlug}-${r.slug}`}
              href={`/${lang}/experiences/${r.countrySlug}/${r.slug}/`}
              className="exp-card"
            >
              <div className="exp-card-img">
                <img src={r.coverPhoto} alt={r.name} loading="lazy" />
                <span className="exp-price">
                  {r.count}
                  <small>trips</small>
                </span>
              </div>
              <div className="exp-card-body">
                <h3>{r.name}</h3>
                <div className="exp-card-loc">{r.country}</div>
                <p>Mostly {r.topActivities.join(', ').toLowerCase()}.</p>
                <div className="exp-card-foot">
                  <span className="exp-card-meta">From €{r.minPriceEur}</span>
                  <span className="exp-card-cta">Explore →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer currentLang={lang} />
    </div>
  );
}

export const dynamic = 'force-static';
