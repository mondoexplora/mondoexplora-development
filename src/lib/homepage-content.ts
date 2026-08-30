/**
 * Everything the homepage renders, loaded once at build time.
 *
 * Three routes render the same homepage — /, /[lang] and /[lang]/home — so the
 * loading lives here rather than being copied into each of them and drifting.
 *
 * Server-only: reaches the filesystem through lib/regional-data,
 * lib/homepage-deals and lib/experiences.
 */

import { loadRegionalData, loadSearchData } from '@/lib/regional-data';
import { getHomepageDeals, type HomepageDeal } from '@/lib/homepage-deals';
import {
  getActivities,
  getCountries,
  getFeaturedExperiences,
  getRegions,
  getTotals,
  type ActivitySummary,
  type Experience,
} from '@/lib/experiences';
import { EXPERIENCE_LANGUAGES } from '@/lib/experienceLanguages';
import { buildHomepageFaq, type FaqEntry } from '@/lib/homepage-faq';
import type { SearchEntry } from '@/components/home/HomeHero';

interface SearchItem {
  name: string;
  slug: string;
  type: 'country' | 'destination';
}

interface RegionalData {
  [region: string]: {
    totalHotels: number;
    countries: {
      [country: string]: {
        hotelCount: number;
        destinations: { [key: string]: { hotelCount: number; minPrice?: number } };
      };
    };
  };
}

export interface HomepageContent {
  regionalData: RegionalData;
  searchData: SearchItem[];
  totalHotels: number;
  /** Cheapest nightly rate anywhere in the catalogue, for conversion tracking. */
  minPrice: number;
  deals: HomepageDeal[];
  discountedCount: number;
  experiences: Experience[];
  activities: ActivitySummary[];
  totalExperiences: number;
  experienceSearch: SearchEntry[];
  faq: FaqEntry[];
}

/** Fallback when no destination in the feed carries a price. */
const DEFAULT_MIN_PRICE = 30;

/**
 * How many activities the homepage rail covers, and how many trips it samples
 * from each. The chip list is cut to the same number: a chip for an activity the
 * sample does not contain would filter the grid down to nothing.
 */
const HOME_ACTIVITIES = 6;
const TRIPS_PER_ACTIVITY = 4;

export async function loadHomepageContent(
  lang: string
): Promise<HomepageContent> {
  // English-only: the experience feed is not translated. See lib/experienceLanguages.
  const showExperiences = EXPERIENCE_LANGUAGES.includes(lang);

  const [regionalData, searchData, { deals, discountedCount }] =
    await Promise.all([
      loadRegionalData(),
      loadSearchData(),
      getHomepageDeals(lang, 4),
    ]);

  let experiences: Experience[] = [];
  let activities: ActivitySummary[] = [];
  let experienceSearch: SearchEntry[] = [];
  let totalExperiences = 0;

  if (showExperiences) {
    const [sample, allActivities, totals, expCountries, expRegions] =
      await Promise.all([
        getFeaturedExperiences(TRIPS_PER_ACTIVITY, HOME_ACTIVITIES),
        getActivities(),
        getTotals(),
        getCountries(),
        getRegions(),
      ]);

    experiences = sample;
    activities = allActivities.slice(0, HOME_ACTIVITIES);
    totalExperiences = totals.experiences;
    experienceSearch = [
      ...expCountries.map((c) => ({
        name: c.name,
        href: `/${lang}/experiences/${c.slug}/`,
        kind: 'country',
      })),
      ...expRegions.map((r) => ({
        name: `${r.name}, ${r.country}`,
        href: `/${lang}/experiences/${r.countrySlug}/${r.slug}/`,
        kind: 'region',
      })),
    ];
  }

  // Every number the copy states is derived here, so the page cannot drift from
  // the data the way the old hardcoded "9,835 hotels" did.
  const regions = Object.values(regionalData);
  const totalHotels = regions.reduce((sum, region) => sum + region.totalHotels, 0);
  const countryCount = new Set(
    regions.flatMap((region) => Object.keys(region.countries))
  ).size;

  const prices = regions.flatMap((region) =>
    Object.values(region.countries).flatMap((country) =>
      Object.values(country.destinations)
        .map((d) => d.minPrice)
        .filter((p): p is number => typeof p === 'number' && p > 0)
    )
  );

  return {
    regionalData,
    searchData,
    totalHotels,
    minPrice: prices.length > 0 ? Math.min(...prices) : DEFAULT_MIN_PRICE,
    deals,
    discountedCount,
    experiences,
    activities,
    totalExperiences,
    experienceSearch,
    faq: buildHomepageFaq({
      totalHotels,
      countries: countryCount,
      maxDiscount: deals[0]?.discount ?? 0,
      discountedCount,
      experiences: totalExperiences,
    }),
  };
}
