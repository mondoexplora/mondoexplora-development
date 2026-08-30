#!/usr/bin/env tsx
/**
 * Generates the Merchant Center / Performance Max product feed for /experiences.
 *
 * PMax bids far better from a structured feed than from crawling pages, so the
 * same filtered catalogue that builds the pages is emitted as RSS 2.0 with the
 * `g:` namespace Merchant Center expects.
 *
 * Runs after `next build` (wired into the build script) and writes two copies:
 *
 *   data/experiences/experiences-feed.xml  — the readable copy, next to the CSV
 *                                            it is generated from
 *   out/experiences-feed.xml               — the published copy; only out/ is
 *                                            deployed, so this is the one
 *                                            Merchant Center actually fetches at
 *                                            https://mondoexplora.com/experiences-feed.xml
 *
 * Keep both. data/ is never served, so a feed that lives only there is invisible
 * to Google.
 *
 * Two rules this file exists to keep:
 *   - every item links to OUR page, never straight to the partner, so the click
 *     is tracked and the visitor sees our content
 *   - it imports the same loader the pages use, so the feed can never advertise
 *     an experience that was filtered out of the build
 */

import fs from 'fs';
import path from 'path';
import { getAllExperiences, getLoadReport, type Experience } from '../src/lib/experiences';

const SITE = 'https://mondoexplora.com';
const LANG = 'en';
const OUT_DIR = path.join(process.cwd(), 'out');
const PUBLISHED_FILE = path.join(OUT_DIR, 'experiences-feed.xml');
const DATA_DIR = path.join(process.cwd(), 'data', 'experiences');
const DATA_FILE = path.join(DATA_DIR, 'experiences-feed.xml');

function escapeXml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Merchant Center caps title at 150 characters and description at 5000. */
function clamp(value: string, max: number): string {
  const s = value.trim();
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

/** Bidding dimensions PMax can segment on via custom labels. */
function durationBucket(days: number): string {
  if (days < 1) return 'half-day';
  if (days === 1) return '1-day';
  if (days <= 3) return '2-3-days';
  if (days <= 7) return '4-7-days';
  return '8-plus-days';
}

function priceBucket(price: number): string {
  if (price < 100) return 'under-100';
  if (price < 250) return '100-250';
  if (price < 500) return '250-500';
  if (price < 1000) return '500-1000';
  return '1000-plus';
}

function renderItem(e: Experience): string {
  const url = `${SITE}/${LANG}/experiences/${e.countrySlug}/${e.regionSlug}/${e.slug}/`;
  const title = clamp(`${e.title} — ${e.region}, ${e.country}`, 150);
  const description = clamp(e.metaDescription || e.shortDescription, 5000);

  const extraImages = e.photos
    .slice(0, 10)
    .filter((p) => p !== e.mainPhoto)
    .map(
      (p) =>
        `      <g:additional_image_link>${escapeXml(p)}</g:additional_image_link>`
    )
    .join('\n');

  return `    <item>
      <g:id>${escapeXml(e.id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(url)}</g:link>
      <g:image_link>${escapeXml(e.mainPhoto)}</g:image_link>
${extraImages}
      <g:availability>in_stock</g:availability>
      <g:price>${e.priceEur} EUR</g:price>
      <g:brand>MondoExplora</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>Experiences &gt; ${escapeXml(e.activity)} &gt; ${escapeXml(e.country)} &gt; ${escapeXml(e.region)}</g:product_type>
      <g:custom_label_0>${escapeXml(e.activity)}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(e.country)}</g:custom_label_1>
      <g:custom_label_2>${escapeXml(e.region)}</g:custom_label_2>
      <g:custom_label_3>${escapeXml(durationBucket(e.durationDays))}</g:custom_label_3>
      <g:custom_label_4>${escapeXml(priceBucket(e.priceEur))}</g:custom_label_4>
    </item>`;
}

async function main(): Promise<void> {
  const experiences = await getAllExperiences();
  const report = await getLoadReport();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>MondoExplora Guided Experiences</title>
    <link>${SITE}/${LANG}/experiences/</link>
    <description>Guided outdoor experiences with certified guides worldwide.</description>
${experiences.map(renderItem).join('\n')}
  </channel>
</rss>
`;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, xml, 'utf8');

  // out/ only exists after next build. Writing the data copy regardless means the
  // feed can be regenerated and inspected without a full build.
  if (fs.existsSync(OUT_DIR)) {
    fs.writeFileSync(PUBLISHED_FILE, xml, 'utf8');
  } else {
    console.warn(
      `out/ not found — wrote data copy only. Run next build to publish the feed.`
    );
  }

  const d = report.dropped;
  console.log(
    `experiences-feed.xml: ${experiences.length} products from ${report.totalRows} rows ` +
      `(dropped ${d.incomplete} incomplete, ${d.badCoordinates} bad coordinates, ` +
      `${d.badPrice} bad price, ${d.duplicateSlug} duplicate slugs)`
  );
}

main().catch((err) => {
  console.error('Feed generation failed:', err);
  process.exit(1);
});
