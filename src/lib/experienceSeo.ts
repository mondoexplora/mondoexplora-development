/**
 * Metadata and JSON-LD for the /experiences section.
 *
 * Two audiences: organic search, and Google's paid systems (PMax reads the page
 * as well as the feed). Both want the same things — an honest title, a
 * description with the concrete numbers, a canonical, and structured data whose
 * type actually matches what the page is about.
 */

import type { Metadata } from 'next';
import type {
  CountrySummary,
  Experience,
  RegionSummary,
} from '@/lib/experiences';

export const SITE = 'https://mondoexplora.com';

export function experiencesUrl(
  lang: string,
  ...segments: string[]
): string {
  const path = ['', lang, 'experiences', ...segments].join('/');
  return `${SITE}${path}/`.replace(/\/+$/, '/');
}

function ogImage(url: string) {
  return [{ url, width: 1200, height: 630 }];
}

/* ------------------------------------------------------------------- hub */

export function hubMetadata(
  lang: string,
  totals: { experiences: number; countries: number; regions: number },
  coverPhoto?: string
): Metadata {
  // The root layout applies a "%s | MondoExplora" template, so titles here must
  // not repeat the brand.
  const title = `Guided Outdoor Experiences Worldwide | ${totals.experiences.toLocaleString(
    'en-GB'
  )} Trips in ${totals.countries} Countries`;
  const description = `Browse ${totals.experiences.toLocaleString(
    'en-GB'
  )} guided hiking, climbing, ski touring and canyoning trips across ${
    totals.countries
  } countries and ${totals.regions} regions. Certified guides, real prices, and how far each trip is from the nearest city.`;
  const url = experiencesUrl(lang);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'MondoExplora',
      images: coverPhoto ? ogImage(coverPhoto) : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: coverPhoto ? [coverPhoto] : undefined,
    },
  };
}

/* --------------------------------------------------------------- country */

export function countryMetadata(lang: string, country: CountrySummary): Metadata {
  const title = `${country.count} Guided Outdoor Experiences in ${country.name} | From €${country.minPriceEur}`;
  const description = `Compare ${country.count} guided trips across ${
    country.regionCount
  } regions of ${country.name} — ${country.topRegions
    .slice(0, 3)
    .join(', ')}. ${
    country.activityCount
  } activity types, certified guides, prices from €${country.minPriceEur}.`;
  const url = experiencesUrl(lang, country.slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'MondoExplora',
      images: ogImage(country.coverPhoto),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [country.coverPhoto],
    },
  };
}

/* ---------------------------------------------------------------- region */

export function regionMetadata(lang: string, region: RegionSummary): Metadata {
  const title = `${region.count} Guided Experiences in ${region.name}, ${region.country} | From €${region.minPriceEur}`;
  const description = `${region.count} guided trips in ${region.name}, ${
    region.country
  } — mostly ${region.topActivities
    .slice(0, 3)
    .join(', ')}. Certified guides, prices from €${
    region.minPriceEur
  }, and drive times from the nearest cities.`;
  const url = experiencesUrl(lang, region.countrySlug, region.slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'MondoExplora',
      images: ogImage(region.coverPhoto),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [region.coverPhoto],
    },
  };
}

/* ------------------------------------------------------------ experience */

export function experienceMetadata(lang: string, e: Experience): Metadata {
  // The feed ships its own SEO copy for most rows; fall back to a generated one
  // built from the same facts rather than leaving it empty.
  const title = e.metaHeadline
    ? e.metaHeadline
    : `${e.title} | ${e.activity} in ${e.region}, ${e.country}`;

  const description =
    e.metaDescription ||
    `${e.title}. Guided ${e.activity.toLowerCase()} in ${e.locationName}, ${
      e.region
    }, ${e.country}. From €${e.priceEur}, ${durationText(
      e.durationDays
    )}, with a certified guide.`;

  const url = experiencesUrl(lang, e.countrySlug, e.regionSlug, e.slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'MondoExplora',
      images: ogImage(e.mainPhoto),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [e.mainPhoto],
    },
    other: {
      // Read by PMax and Merchant Center alongside the feed. Keeping them on the
      // page means the two sources cannot silently disagree on price.
      'product:price:amount': String(e.priceEur),
      'product:price:currency': 'EUR',
    },
  };
}

export function durationText(days: number): string {
  if (days < 1) return 'half a day';
  if (days === 1) return '1 day';
  return `${days} days`;
}

/* ---------------------------------------------------------------- JSON-LD */

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * The feed ships a `json_ld` column typed as LocalBusiness, which is wrong: these
 * are guided trips at a place, not businesses at an address. TouristAttraction
 * with an Offer describes what the page is actually about and gives Google the
 * price it needs for shopping and PMax surfaces.
 */
export function experienceJsonLd(
  lang: string,
  e: Experience
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: e.title,
    description: e.shortDescription,
    url: experiencesUrl(lang, e.countrySlug, e.regionSlug, e.slug),
    image: e.photos.length > 0 ? [e.mainPhoto, ...e.photos.slice(0, 5)] : [e.mainPhoto],
    touristType: e.activity,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: e.lat,
      longitude: e.lng,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: e.locationName,
      addressRegion: e.region,
      addressCountry: e.country,
    },
    isAccessibleForFree: false,
    offers: {
      '@type': 'Offer',
      price: e.priceEur,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: experiencesUrl(lang, e.countrySlug, e.regionSlug, e.slug),
    },
  };
}

export function itemListJsonLd(
  name: string,
  urls: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: urls.length,
    itemListElement: urls.map((u, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: u.name,
      url: u.url,
    })),
  };
}
