import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import ExperienceCard from '@/components/experiences/ExperienceCard';
import GettingThere from '@/components/experiences/GettingThere';
import LocationMap from '@/components/experiences/LocationMap';
import PartnerLink from '@/components/experiences/PartnerLink';
import {
  getAllExperiences,
  getExperience,
  getRelatedExperiences,
} from '@/lib/experiences';
import {
  breadcrumbJsonLd,
  durationText,
  experienceJsonLd,
  experienceMetadata,
  experiencesUrl,
} from '@/lib/experienceSeo';
import { EXPERIENCE_LANGUAGES } from '@/lib/experienceLanguages';
import '@/styles/experiences.css';

export const dynamic = 'force-static';

interface PageProps {
  params: Promise<{
    lang: string;
    country: string;
    region: string;
    experience: string;
  }>;
}

export async function generateStaticParams() {
  const all = await getAllExperiences();
  return EXPERIENCE_LANGUAGES.flatMap((lang) =>
    all.map((e) => ({
      lang,
      country: e.countrySlug,
      region: e.regionSlug,
      experience: e.slug,
    }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, country, region, experience } = await params;
  const e = await getExperience(country, region, experience);
  if (!e) return { title: 'Experience not found' };
  return experienceMetadata(lang, e);
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { lang, country, region, experience } = await params;
  if (!EXPERIENCE_LANGUAGES.includes(lang)) notFound();

  const e = await getExperience(country, region, experience);
  if (!e) notFound();

  const related = await getRelatedExperiences(e, 3);
  const galleryThumbs = e.photos.slice(0, 3);
  const remaining = Math.max(0, e.photos.length - galleryThumbs.length);
  const nearest = e.gatewayCities[0];

  return (
    <div className="exp-page">
      <StructuredData data={experienceJsonLd(lang, e)} />
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Home', url: `https://mondoexplora.com/${lang}/` },
          { name: 'Experiences', url: experiencesUrl(lang) },
          { name: e.country, url: experiencesUrl(lang, e.countrySlug) },
          {
            name: e.region,
            url: experiencesUrl(lang, e.countrySlug, e.regionSlug),
          },
          {
            name: e.title,
            url: experiencesUrl(lang, e.countrySlug, e.regionSlug, e.slug),
          },
        ])}
      />

      <div className="exp-hero" style={{ background: '#2a3f59' }}>
        <div className="exp-hero-inner">
          <div className="exp-wrap">
            <div className="exp-logo">
              <span className="a">Mondo</span>
              <span className="b">Explora</span>
            </div>
            <div className="exp-crumbs">
              <Link href={`/${lang}/experiences/`}>Experiences</Link>
              <span className="sep">/</span>
              <Link href={`/${lang}/experiences/${e.countrySlug}/`}>
                {e.country}
              </Link>
              <span className="sep">/</span>
              <Link
                href={`/${lang}/experiences/${e.countrySlug}/${e.regionSlug}/`}
              >
                {e.region}
              </Link>
            </div>
            <h1>{e.title}</h1>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.6rem',
                marginTop: '1rem',
              }}
            >
              <span
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  borderRadius: 20,
                  padding: '0.35rem 0.8rem',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {e.activity}
              </span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 20,
                  padding: '0.35rem 0.8rem',
                  fontSize: 13,
                }}
              >
                {durationText(e.durationDays)}
              </span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 20,
                  padding: '0.35rem 0.8rem',
                  fontSize: 13,
                }}
              >
                {e.region}, {e.country}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="exp-wrap" style={{ paddingTop: '1.5rem' }}>
        <div className="exp-gallery">
          <img className="lead" src={e.mainPhoto} alt={e.title} />
          {/* display:contents on desktop, so these stay direct grid children;
              a horizontal strip below the hero on mobile. */}
          <div className="exp-gallery-thumbs">
            {galleryThumbs.map((p) => (
              <img key={p} className="thumb" src={p} alt="" loading="lazy" />
            ))}
            {remaining > 0 && <div className="more">+{remaining} photos</div>}
          </div>
        </div>
      </div>

      <div className="exp-wrap exp-sec" style={{ paddingTop: '2rem' }}>
        <div className="exp-detail">
          <div className="exp-detail-main">
            <div>
              <h2
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#2a3f59',
                  marginBottom: '0.75rem',
                }}
              >
                About this experience
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, margin: 0 }}>
                {e.shortDescription}
              </p>
            </div>

            <div>
              <h2
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#2a3f59',
                  marginBottom: '1rem',
                }}
              >
                At a glance
              </h2>
              <div className="exp-facts">
                <div className="exp-fact">
                  <div className="exp-fact-label">ACTIVITY</div>
                  <div className="exp-fact-value">{e.activity}</div>
                </div>
                <div className="exp-fact">
                  <div className="exp-fact-label">DURATION</div>
                  <div className="exp-fact-value">
                    {durationText(e.durationDays)}
                  </div>
                </div>
                <div className="exp-fact">
                  <div className="exp-fact-label">PRICE FROM</div>
                  <div className="exp-fact-value" style={{ color: '#28a745' }}>
                    €{e.priceEur}{' '}
                    <span
                      style={{ color: '#9ca3af', fontWeight: 500, fontSize: 13 }}
                    >
                      EUR
                    </span>
                  </div>
                </div>
                <div className="exp-fact">
                  <div className="exp-fact-label">MEETING POINT</div>
                  <div className="exp-fact-value">{e.locationName}</div>
                </div>
                <div className="exp-fact">
                  <div className="exp-fact-label">REGION</div>
                  <div className="exp-fact-value">{e.region}</div>
                </div>
                {nearest && (
                  <div className="exp-fact">
                    <div className="exp-fact-label">NEAREST CITY</div>
                    <div className="exp-fact-value">
                      {nearest.name} · {nearest.drive_time_estimate}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#2a3f59',
                  marginBottom: '0.5rem',
                }}
              >
                Where it happens
              </h2>
              <p style={{ fontSize: '1rem', color: '#6c757d', margin: '0 0 1rem' }}>
                {e.locationName}, {e.region}, {e.country}
              </p>
              <LocationMap experience={e} />
            </div>

            <GettingThere
              cities={e.gatewayCities}
              locationName={e.locationName}
            />
          </div>

          <div className="exp-detail-side">
            <div className="exp-booking">
              <div className="exp-booking-price">
                <strong>€{e.priceEur}</strong>
                <span>from · per person</span>
              </div>
              <div className="exp-booking-rows">
                <div className="exp-booking-row">
                  <span>Duration</span>
                  <span>{durationText(e.durationDays)}</span>
                </div>
                <div className="exp-booking-row">
                  <span>Activity</span>
                  <span>{e.activity}</span>
                </div>
                <div className="exp-booking-row">
                  <span>Guide</span>
                  <span>Certified</span>
                </div>
              </div>
              <PartnerLink
                partnerUrl={e.partnerUrl}
                countrySlug={e.countrySlug}
                regionSlug={e.regionSlug}
                placement="experience_book"
                className="exp-btn-primary"
                style={{ width: '100%' }}
              >
                Check dates &amp; book →
              </PartnerLink>
              <p className="exp-booking-note">
                Booking is handled by the operator on Explore-share. The price
                shown is their starting price for this trip.
              </p>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="exp-wrap exp-sec">
          <div className="exp-sec-head">
            <h2>More in {e.region}</h2>
          </div>
          <div className="exp-grid">
            {related.map((r) => (
              <ExperienceCard
                key={r.id}
                experience={r}
                lang={lang}
                showRegion={false}
              />
            ))}
          </div>
        </div>
      )}

      <Footer currentLang={lang} />

      {/* Mobile only: the CTA stays reachable on a page this long. */}
      <div className="exp-sticky-bar">
        <span className="price">
          <strong>€{e.priceEur}</strong>
          <span>from · {durationText(e.durationDays)}</span>
        </span>
        <PartnerLink
          partnerUrl={e.partnerUrl}
          countrySlug={e.countrySlug}
          regionSlug={e.regionSlug}
          placement="experience_book"
          className="exp-btn-primary"
        >
          Check dates &amp; book →
        </PartnerLink>
      </div>
    </div>
  );
}
