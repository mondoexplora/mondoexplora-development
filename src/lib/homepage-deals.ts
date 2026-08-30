/**
 * Build-time deal picker for the homepage.
 *
 * data/homepage-data.json carries counts only — hotel counts per destination and
 * a minimum price — so the homepage had no hotel records to show. The actual
 * hotels live one file per destination in data/<lang>/destination/*.json, which
 * is 7MB and ~1,100 files. Scanning the lot takes ~200ms, so this reads them
 * directly rather than adding a generated file that the daily data refresh would
 * have to remember to rebuild.
 *
 * Server-only: uses fs. Never import this from a client component.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface HomepageDeal {
  /** Hotel name — the headline on the card. */
  vendor: string;
  /** The offer's own title, which is where the perks are described. */
  title: string;
  city: string;
  country: string;
  /** Slug of the destination page this hotel belongs to. */
  citySlug: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  /** Partner URL, untracked. The card appends the sub_id at click time. */
  link: string;
}

export interface DealsSummary {
  deals: HomepageDeal[];
  /** Every hotel discounted at least MIN_DISCOUNT, for the "all deals" link. */
  discountedCount: number;
}

/** Below this a "deal" is not worth a card — the row is "biggest price drops". */
const MIN_DISCOUNT = 15;

/** Languages with their own destination data; everything else reads English. */
const DEAL_LANGUAGES = new Set(['en', 'es', 'fr', 'it']);

interface RawHotel {
  vendor_name?: string;
  title?: string;
  description?: string;
  price?: number;
  original_price?: number;
  discount_percentage?: number;
  hero_image?: string;
  link?: string;
  location_heading?: string;
  offer_country_name?: string;
  location_subheading?: string;
}

const cache = new Map<string, Promise<DealsSummary>>();

function dealsDir(lang: string): string {
  const dir = DEAL_LANGUAGES.has(lang) ? lang : 'en';
  return path.join(process.cwd(), 'data', dir, 'destination');
}

/** Discount as stated by the feed, or derived when the field is missing. */
function discountOf(h: RawHotel): number {
  if (typeof h.discount_percentage === 'number' && h.discount_percentage > 0) {
    return Math.round(h.discount_percentage);
  }
  if (h.original_price && h.price && h.original_price > h.price) {
    return Math.round(((h.original_price - h.price) / h.original_price) * 100);
  }
  return 0;
}

function isUsable(h: RawHotel): boolean {
  return Boolean(
    h.hero_image &&
      h.link &&
      /^https?:\/\//i.test(h.link) &&
      h.price &&
      h.price > 0 &&
      (h.vendor_name || h.title) &&
      h.location_heading
  );
}

async function scan(lang: string): Promise<DealsSummary> {
  const dir = dealsDir(lang);

  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
  } catch {
    return { deals: [], discountedCount: 0 };
  }

  const found: HomepageDeal[] = [];

  await Promise.all(
    files.map(async (file) => {
      let parsed: { hotels?: RawHotel[] };
      try {
        parsed = JSON.parse(await fs.readFile(path.join(dir, file), 'utf8'));
      } catch {
        return; // A single malformed destination file must not fail the build.
      }

      const citySlug = file.replace(/\.json$/, '');
      for (const h of parsed.hotels ?? []) {
        if (!isUsable(h)) continue;
        const discount = discountOf(h);
        if (discount < MIN_DISCOUNT) continue;

        found.push({
          vendor: h.vendor_name || h.title!,
          title: h.title || h.vendor_name!,
          city: h.location_heading!,
          country: h.offer_country_name || h.location_subheading || '',
          citySlug,
          price: Math.round(h.price!),
          originalPrice: Math.round(h.original_price ?? h.price!),
          discount,
          image: h.hero_image!,
          link: h.link!,
        });
      }
    })
  );

  found.sort((a, b) => b.discount - a.discount || a.price - b.price);

  return { deals: found, discountedCount: found.length };
}

/**
 * The homepage row: the steepest discounts, one per country.
 *
 * Without the per-country cap the top of the list is four Thai resorts, because
 * one partner's clearance sale dominates the whole feed on any given day.
 */
export async function getHomepageDeals(
  lang: string,
  limit = 4
): Promise<DealsSummary> {
  if (!cache.has(lang)) cache.set(lang, scan(lang));
  const { deals, discountedCount } = await cache.get(lang)!;

  const seenCountries = new Set<string>();
  const picked: HomepageDeal[] = [];
  for (const deal of deals) {
    const key = deal.country || deal.city;
    if (seenCountries.has(key)) continue;
    seenCountries.add(key);
    picked.push(deal);
    if (picked.length === limit) break;
  }

  return { deals: picked, discountedCount };
}
