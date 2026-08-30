import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import ExperienceCard from '@/components/experiences/ExperienceCard';
import {
  getActivities,
  getCountries,
  getCountry,
  getRegions,
  getAllExperiences,
} from '@/lib/experiences';
import {
  breadcrumbJsonLd,
  countryMetadata,
  experiencesUrl,
  itemListJsonLd,
} from '@/lib/experienceSeo';
import { EXPERIENCE_LANGUAGES } from '@/lib/experienceLanguages';
import '@/styles/experiences.css';

export const dynamic = 'force-static';

interface PageProps {
  params: Promise<{ lang: string; country: string }>;
}

export async function generateStaticParams() {
  const countries = await getCountries();
  return EXPERIENCE_LANGUAGES.flatMap((lang) =>
    countries.map((c) => ({ lang, country: c.slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, country } = await params;
  const data = await getCountry(country);
  if (!data) return { title: 'Country not found' };
  return countryMetadata(lang, data);
}

const REGIONS_SHOWN = 12;

export default async function CountryExperiencesPage({ params }: PageProps) {
  const { lang, country } = await params;
  if (!EXPERIENCE_LANGUAGES.includes(lang)) notFound();

  const data = await getCountry(country);
  if (!data) notFound();

  const [regions, activities, all] = await Promise.all([
    getRegions(country),
    getActivities({ countrySlug: country }),
    getAllExperiences(),
  ]);

  const shownRegions = regions.slice(0, REGIONS_SHOWN);
  const popular = all
    .filter((e) => e.countrySlug === country)
    .slice(0, 3);

  return (
    <div className="exp-page">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Home', url: `https://mondoexplora.com/${lang}/` },
          { name: 'Experiences', url: experiencesUrl(lang) },
          { name: data.name, url: experiencesUrl(lang, data.slug) },
        ])}
      />
      <StructuredData
        data={itemListJsonLd(
          `Regions in ${data.name}`,
          shownRegions.map((r) => ({
            name: r.name,
            url: experiencesUrl(lang, r.countrySlug, r.slug),
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
              <span>{data.name}</span>
            </div>
            <h1>Guided outdoor experiences in {data.name}</h1>
            <p className="exp-lede">
              {data.count} guided trips across {data.regionCount} regions, from €
              {data.minPriceEur}. Choose a region to see what runs there.
            </p>
          </div>
        </div>
      </div>

      <div className="exp-wrap exp-sec">
        <div className="exp-sec-head">
          <h2>Regions</h2>
          <p>
            Ordered by how many guided trips run there. Region names come from the
            operator feed.
          </p>
        </div>
        <div className="exp-tiles">
          {shownRegions.map((r) => (
            <Link
              key={r.slug}
              href={`/${lang}/experiences/${r.countrySlug}/${r.slug}/`}
              className="exp-tile"
            >
              <span className="stackable">
                <h3>{r.name}</h3>
                <span className="count">
                  <strong>{r.count}</strong> experiences · from €{r.minPriceEur}
                </span>
                <span className="sub">{r.topActivities.join(' · ')}</span>
              </span>
            </Link>
          ))}
        </div>
        {regions.length > REGIONS_SHOWN && (
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: '1.5rem' }}>
            Showing the {REGIONS_SHOWN} largest of {regions.length} regions in{' '}
            {data.name}.
          </p>
        )}
      </div>

      <div className="exp-wrap exp-sec">
        <div className="exp-sec-head">
          <h2>What people do in {data.name}</h2>
          <p>Jump straight to an activity across every region.</p>
        </div>
        <div className="exp-chips">
          {activities.slice(0, 12).map((a) => (
            <span key={a.name} className="exp-chip">
              {a.name} <span className="n">{a.count}</span>
            </span>
          ))}
        </div>
      </div>

      {popular.length > 0 && (
        <div className="exp-wrap exp-sec">
          <div className="exp-sec-head">
            <h2>Popular right now in {data.name}</h2>
          </div>
          <div className="exp-grid">
            {popular.map((e) => (
              <ExperienceCard key={e.id} experience={e} lang={lang} />
            ))}
          </div>
        </div>
      )}

      <Footer currentLang={lang} />
    </div>
  );
}
