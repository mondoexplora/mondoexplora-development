/**
 * Build-time data layer for /[lang]/experiences.
 *
 * Reads data/experiences/explore-share.csv once per build, filters out rows that
 * are too incomplete or too obviously wrong to publish, and exposes the hub /
 * country / region / experience views the routes need.
 *
 * Server-only: uses fs. Never import this from a client component.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { isInsideCountry } from '@/lib/countryBounds';

export interface GatewayCity {
  name: string;
  country: string;
  distance_km: number;
  drive_time_estimate: string;
  rome2rio_url: string;
  latitude: number;
  longitude: number;
}

export interface Experience {
  id: string;
  slug: string;
  title: string;
  partnerUrl: string;
  activity: string;
  country: string;
  countrySlug: string;
  region: string;
  regionSlug: string;
  priceEur: number;
  priceLocal: number | null;
  currency: string;
  durationDays: number;
  mainPhoto: string;
  photos: string[];
  lat: number;
  lng: number;
  locationName: string;
  gatewayCities: GatewayCity[];
  metaHeadline: string;
  metaDescription: string;
  shortDescription: string;
}

export interface RegionSummary {
  name: string;
  slug: string;
  country: string;
  countrySlug: string;
  count: number;
  minPriceEur: number;
  topActivities: string[];
  coverPhoto: string;
}

export interface CountrySummary {
  name: string;
  slug: string;
  count: number;
  regionCount: number;
  activityCount: number;
  minPriceEur: number;
  topRegions: string[];
  coverPhoto: string;
}

export interface ActivitySummary {
  name: string;
  count: number;
}

const CSV_PATH = path.join(process.cwd(), 'data', 'experiences', 'explore-share.csv');

/* ------------------------------------------------------------------ slugs */

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining accents
    .replace(/[\u2018\u2019'`]/g, '') // drop apostrophes rather than hyphenating them
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}


/* -------------------------------------------------------------- csv parse */

/** Minimal RFC-4180 parser: handles quoted fields, escaped quotes, newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/* ------------------------------------------------------------ validation */

/**
 * Rows missing any of these cannot render a complete page, so they are not built.
 * Counts at the time of writing: 904 have no price, 406 no description,
 * 199 no activity, 109 no region.
 */
const REQUIRED_FIELDS = [
  'title',
  'url',
  'country',
  'region',
  'activity',
  'minPriceEur',
  'mainPhoto',
  'short_description',
  'lat',
  'lng',
  'gateway_cities_json',
] as const;

function isComplete(row: Record<string, string>): boolean {
  return REQUIRED_FIELDS.every((f) => (row[f] ?? '').trim() !== '');
}

/**
 * The feed's lat/lng column is unreliable — a geocoder failed on some rows and
 * fell back to an unrelated point (one New Delhi coordinate is shared by 46
 * experiences across Austria, Italy and Switzerland). Because gateway_cities_json
 * was generated FROM these coordinates, a bad point also poisons every distance
 * and drive time on the page.
 *
 * Two checks, both cheap and offline:
 *   1. the coordinate must sit inside the country the row claims
 *   2. the coordinate must not be shared with a row in a different country —
 *      one point cannot be in two countries, so every such row is wrong
 *
 * Rows failing either are dropped rather than published with a wrong map pin and
 * wrong "how to get there" distances. The real fix is re-geocoding from
 * location_name + region + country; until then this is the safe filter.
 */
function coordinateIsPlausible(
  row: Record<string, string>,
  sharedAcrossCountries: Set<string>
): boolean {
  const lat = Number(row.lat);
  const lng = Number(row.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;

  if (sharedAcrossCountries.has(coordKey(lat, lng))) return false;

  const inside = isInsideCountry(row.country, lat, lng);
  if (inside === false) return false; // null = country not in the table, allow

  return true;
}

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

/**
 * A handful of rows carry a placeholder price: three at EUR 0, and a few at EUR 1
 * for multi-day trips (a 6-day freeride week, a 3-day Gran Paradiso ascent).
 * "From EUR 0" on a page we pay to advertise reads as broken, so those are dropped.
 *
 * The test is per-day rather than absolute, so genuinely cheap short trips survive
 * (a EUR 9 half-day hike in Madeira is EUR 18/day and stays).
 */
function priceIsPlausible(row: Record<string, string>): boolean {
  const price = Number(row.minPriceEur);
  if (!Number.isFinite(price) || price <= 0) return false;
  const days = Number(row.durationDays) || 1;
  return price / days >= 5;
}

/* ------------------------------------------------------------------ load */

export interface LoadReport {
  totalRows: number;
  dropped: {
    incomplete: number;
    badCoordinates: number;
    badPrice: number;
    duplicateSlug: number;
  };
  published: number;
}

let cache: { experiences: Experience[]; report: LoadReport } | null = null;

async function load(): Promise<{ experiences: Experience[]; report: LoadReport }> {
  if (cache) return cache;

  const text = await fs.readFile(CSV_PATH, 'utf8');
  const table = parseCsv(text);
  const header = table[0];
  const rows: Record<string, string>[] = table.slice(1).map((cells) => {
    const o: Record<string, string> = {};
    header.forEach((h, i) => (o[h] = cells[i] ?? ''));
    return o;
  });

  const report: LoadReport = {
    totalRows: rows.length,
    dropped: { incomplete: 0, badCoordinates: 0, badPrice: 0, duplicateSlug: 0 },
    published: 0,
  };

  const complete = rows.filter((r) => {
    if (isComplete(r)) return true;
    report.dropped.incomplete++;
    return false;
  });

  // A coordinate claimed by two different countries is wrong for every row on it.
  const countriesByCoord = new Map<string, Set<string>>();
  for (const r of complete) {
    const key = coordKey(Number(r.lat), Number(r.lng));
    if (!countriesByCoord.has(key)) countriesByCoord.set(key, new Set());
    countriesByCoord.get(key)!.add(r.country);
  }
  const sharedAcrossCountries = new Set<string>();
  for (const [key, countries] of countriesByCoord) {
    if (countries.size > 1) sharedAcrossCountries.add(key);
  }

  const plausible = complete.filter((r) => {
    if (coordinateIsPlausible(r, sharedAcrossCountries)) return true;
    report.dropped.badCoordinates++;
    return false;
  });

  const priced = plausible.filter((r) => {
    if (priceIsPlausible(r)) return true;
    report.dropped.badPrice++;
    return false;
  });

  const seenSlugs = new Set<string>();
  const experiences: Experience[] = [];

  for (const r of priced) {
    const countrySlug = slugify(r.country);
    const regionSlug = slugify(r.region);
    const slug = slugify(r.title);
    const key = `${countrySlug}/${regionSlug}/${slug}`;

    // 6 rows in the feed share an identical country + region + title. Only the
    // first is published; a suffix would create a page nobody can distinguish.
    if (seenSlugs.has(key)) {
      report.dropped.duplicateSlug++;
      continue;
    }
    seenSlugs.add(key);

    let gatewayCities: GatewayCity[] = [];
    try {
      const parsed = JSON.parse(r.gateway_cities_json);
      if (Array.isArray(parsed)) gatewayCities = parsed as GatewayCity[];
    } catch {
      gatewayCities = [];
    }

    experiences.push({
      id: r.id,
      slug,
      title: r.title,
      partnerUrl: r.url,
      activity: r.activity,
      country: r.country,
      countrySlug,
      region: r.region,
      regionSlug,
      priceEur: Number(r.minPriceEur),
      priceLocal: r.minPriceLocal ? Number(r.minPriceLocal) : null,
      currency: r.priceCurrency || 'EUR',
      durationDays: Number(r.durationDays) || 1,
      mainPhoto: r.mainPhoto,
      photos: r.photos
        ? r.photos.split('|').map((p) => p.trim()).filter(Boolean)
        : [],
      lat: Number(r.lat),
      lng: Number(r.lng),
      locationName: r.location_name || r.region,
      gatewayCities: gatewayCities
        .map((c) => ({
          // The feed writes these unencoded ("…/Aiguille d'Entrèves-France"),
          // which browsers tolerate but proxies and analytics often mangle.
          ...c,
          rome2rio_url: encodeURI(c.rome2rio_url),
        }))
        .sort((a, b) => a.distance_km - b.distance_km),
      metaHeadline: r.meta_headline || '',
      metaDescription: r.meta_description || '',
      shortDescription: r.short_description,
    });
  }

  report.published = experiences.length;
  cache = { experiences, report };
  return cache;
}

/* --------------------------------------------------------------- queries */

export async function getAllExperiences(): Promise<Experience[]> {
  return (await load()).experiences;
}

export async function getLoadReport(): Promise<LoadReport> {
  return (await load()).report;
}

export async function getExperience(
  countrySlug: string,
  regionSlug: string,
  slug: string
): Promise<Experience | null> {
  const all = await getAllExperiences();
  return (
    all.find(
      (e) =>
        e.countrySlug === countrySlug &&
        e.regionSlug === regionSlug &&
        e.slug === slug
    ) ?? null
  );
}

function topCounted(values: string[], n: number): string[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

export async function getCountries(): Promise<CountrySummary[]> {
  const all = await getAllExperiences();
  const byCountry = new Map<string, Experience[]>();
  for (const e of all) {
    if (!byCountry.has(e.countrySlug)) byCountry.set(e.countrySlug, []);
    byCountry.get(e.countrySlug)!.push(e);
  }

  return [...byCountry.values()]
    .map((list) => ({
      name: list[0].country,
      slug: list[0].countrySlug,
      count: list.length,
      regionCount: new Set(list.map((e) => e.regionSlug)).size,
      activityCount: new Set(list.map((e) => e.activity)).size,
      minPriceEur: Math.min(...list.map((e) => e.priceEur)),
      topRegions: topCounted(
        list.map((e) => e.region),
        3
      ),
      coverPhoto: list[0].mainPhoto,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getCountry(
  countrySlug: string
): Promise<CountrySummary | null> {
  return (await getCountries()).find((c) => c.slug === countrySlug) ?? null;
}

export async function getRegions(countrySlug?: string): Promise<RegionSummary[]> {
  const all = await getAllExperiences();
  const scoped = countrySlug
    ? all.filter((e) => e.countrySlug === countrySlug)
    : all;

  const byRegion = new Map<string, Experience[]>();
  for (const e of scoped) {
    const key = `${e.countrySlug}/${e.regionSlug}`;
    if (!byRegion.has(key)) byRegion.set(key, []);
    byRegion.get(key)!.push(e);
  }

  return [...byRegion.values()]
    .map((list) => ({
      name: list[0].region,
      slug: list[0].regionSlug,
      country: list[0].country,
      countrySlug: list[0].countrySlug,
      count: list.length,
      minPriceEur: Math.min(...list.map((e) => e.priceEur)),
      topActivities: topCounted(
        list.map((e) => e.activity),
        3
      ),
      coverPhoto: list[0].mainPhoto,
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getRegion(
  countrySlug: string,
  regionSlug: string
): Promise<RegionSummary | null> {
  const regions = await getRegions(countrySlug);
  return regions.find((r) => r.slug === regionSlug) ?? null;
}

export async function getExperiencesInRegion(
  countrySlug: string,
  regionSlug: string
): Promise<Experience[]> {
  const all = await getAllExperiences();
  return all
    .filter((e) => e.countrySlug === countrySlug && e.regionSlug === regionSlug)
    .sort((a, b) => a.priceEur - b.priceEur);
}

export async function getActivities(
  scope?: { countrySlug?: string; regionSlug?: string }
): Promise<ActivitySummary[]> {
  const all = await getAllExperiences();
  const scoped = all.filter(
    (e) =>
      (!scope?.countrySlug || e.countrySlug === scope.countrySlug) &&
      (!scope?.regionSlug || e.regionSlug === scope.regionSlug)
  );
  const counts = new Map<string, number>();
  for (const e of scoped) counts.set(e.activity, (counts.get(e.activity) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/** Cheapest sibling experiences in the same region, for the "more like this" rail. */
export async function getRelatedExperiences(
  experience: Experience,
  limit = 3
): Promise<Experience[]> {
  const siblings = await getExperiencesInRegion(
    experience.countrySlug,
    experience.regionSlug
  );
  const sameActivity = siblings.filter(
    (e) => e.slug !== experience.slug && e.activity === experience.activity
  );
  const rest = siblings.filter(
    (e) => e.slug !== experience.slug && e.activity !== experience.activity
  );
  return [...sameActivity, ...rest].slice(0, limit);
}

/** Regions with the deepest catalogue, for the hub page. */
export async function getTopRegions(limit = 3): Promise<RegionSummary[]> {
  return (await getRegions()).slice(0, limit);
}

export async function getTotals(): Promise<{
  experiences: number;
  countries: number;
  regions: number;
  activities: number;
  minPriceEur: number;
}> {
  const all = await getAllExperiences();
  return {
    experiences: all.length,
    countries: new Set(all.map((e) => e.countrySlug)).size,
    regions: new Set(all.map((e) => `${e.countrySlug}/${e.regionSlug}`)).size,
    activities: new Set(all.map((e) => e.activity)).size,
    minPriceEur: Math.min(...all.map((e) => e.priceEur)),
  };
}
