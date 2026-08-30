# The `/experiences` section

Reference for the guided-experiences funnel added on 2026-08-29. Trust this
document — it describes what is in the repo, not what is planned.

Live at `/en/experiences/…`. Source data is a single CSV from Explore-share.

## URLs

```
/en/experiences/                                     hub
/en/experiences/{country}/                           regions in a country
/en/experiences/{country}/{region}/                  experiences in a region
/en/experiences/{country}/{region}/{experience}/     one experience
```

Language-prefixed on purpose. The existing `/en/*` rule in `netlify.toml`
already covers these, so **no new redirects were needed** — and, importantly, a
root-level `/experiences/…` would have been swallowed by the final catch-all
(`/* → /index.html  200`), returning 200 with the homepage's content.

**English only.** `EXPERIENCE_LANGUAGES` in `src/lib/experienceLanguages.ts`
gates `generateStaticParams`. The CSV has one set of English titles and
descriptions; building the other five languages would ship ~21,000
duplicate-content pages. Add a language to that array once its copy exists.

## What gets published, and what does not

`src/lib/experiences.ts` reads `data/experiences/explore-share.csv` once per
build and filters it. As of 2026-08-29:

| | rows |
|---|---|
| In the CSV | 6,379 |
| Dropped — missing a required field | 1,432 |
| Dropped — implausible coordinates | 670 |
| Dropped — placeholder price | 3 |
| Dropped — duplicate country+region+title | 2 |
| **Published** | **4,272** |

Totals: 4,272 experiences, 434 regions, 69 countries → **4,776 pages**.

### Required fields

`title, url, country, region, activity, minPriceEur, mainPhoto,
short_description, lat, lng, gateway_cities_json`. Anything missing one cannot
render a complete page.

### The coordinate problem — read this before touching the map

**The feed's `lat`/`lng` column is not reliable.** A geocoder failed on a large
minority of rows and fell back to unrelated points. One New Delhi coordinate
(`28.596682, 77.186540`) is shared by 46 experiences across Austria, Italy and
Switzerland.

This is worse than a misplaced pin, because **`gateway_cities_json` was
generated FROM those coordinates.** A bad point poisons every distance and drive
time on the page. The canonical example: *"1-day ascent on the Wetterhorn,
Switzerland"* is stored at the New Delhi point, and the feed therefore lists its
nearest cities as Dubai (2,202 km, 22h), Bangkok, Hong Kong and Singapore. That
distance recomputes exactly from the stored coordinate — proof the two columns
are linked.

Two offline checks in `coordinateIsPlausible()` drop 670 such rows:

1. a coordinate claimed by rows in **two different countries** — one point
   cannot be in two countries, so every row on it is wrong;
2. a coordinate outside its own country's bounds (`src/lib/countryBounds.ts`;
   a country absent from that table is not bounds-checked).

**The real fix is re-geocoding** from `location_name + region + country`, then
recomputing the gateway cities and distances (pure arithmetic once the point is
right). That would recover roughly 670 experiences — about 14% of the otherwise
publishable catalogue. Until then, do not relax these checks: publishing
"nearest city: Dubai, 22h" on a page you pay Google to send traffic to burns ad
spend and the partner relationship at once.

Related: a Google Maps API key is committed at
`README_GOOGLE_MAPS_INTEGRATION.md:46` and needs rotating regardless.

### Prices

`priceIsPlausible()` rejects `<= 0` and anything under €5/day. That removes three
€0 rows and a €1 six-day freeride week, while keeping a genuine €9 half-day hike
in Madeira (€18/day).

## Layout

```
src/app/[lang]/experiences/            page.tsx (hub)
  [country]/                           page.tsx
  [country]/[region]/                  page.tsx
  [country]/[region]/[experience]/     page.tsx

src/lib/experiences.ts           CSV parse, filters, queries (server-only, uses fs)
src/lib/countryBounds.ts         bounding boxes for the coordinate check
src/lib/experienceLanguages.ts   which languages to build
src/lib/experienceLinks.ts       rel value, static UTMs, campaign label
src/lib/experienceSeo.ts         metadata + JSON-LD
src/lib/outboundWindow.ts        new-tab clickout mechanics

src/components/experiences/
  ExperienceCard.tsx             card used by every listing
  ActivityChips.tsx              the filter row (client)
  FilterableExperiences.tsx      region page: filters cards (client)
  FilterableTiles.tsx            hub + country: filters tiles (client)
  GettingThere.tsx               the how-to-get-there module
  LocationMap.tsx                relative-position SVG map
  PartnerLink.tsx                booking clickout (client)
  GatewayLink.tsx                Rome2Rio clickout (client)

src/styles/experiences.css       all section styles
scripts/generate-experiences-feed.mts   PMax / Merchant Center feed
```

Styles reuse the site's existing vocabulary from `hotel-boxes.css` and
`globals.css` — navy `#2a3f59`, the `135deg` hero gradient, green `#28a745`
prices, coral `#ff5a5f` tertiary links, 1200px content, cards with
`0 4px 20px rgba(0,0,0,.08)`.

## Activity filters

The chips filter client-side; there is no page per activity. The whole region is
already in the HTML, so filtering is instant and adds nothing to the build.

- **Region page** — filters the experience cards.
- **Hub and country pages** — filter the tiles to those that actually offer the
  activity, **and each tile's count switches to that activity's own number.**
  This is why `CountrySummary` and `RegionSummary` carry `activityCounts`:
  leaving "515 experiences" on the France tile while filtering by canyoning
  would state something false about the catalogue.

Selection is mirrored to the URL hash (`#Via%20Ferrata`) via `replaceState`, so a
filtered view is linkable and survives a reload without stacking history entries.
The hash is applied **after mount**, never during render — the server-rendered
HTML is the unfiltered view, and applying it during render would mis-hydrate.

## Outbound links and tracking

Two monetised surfaces: the booking CTA and the how-to-get-there module.

### The URL the partner receives

```
https://www.explore-share.com/trip/<slug>
  ?utm_source=mondoexplora
  &utm_medium=affiliate
  &utm_campaign=experiences_{country}_{region}
  &utm_content=mx_20260829_<16 hex>
```

**`utm_content` carries the `sub_id`, not a `gclid`.** Explore-share is not on
Impact or ShareASale; they report revenue back keyed on the UTM values they
receive, last-paid-click. The `sub_id` is unique per clickout, so their revenue
line joins 1:1 back to the `outbound_clicks` row, and the `gclid` / `gbraid` /
`fbc` needed for an offline-conversion upload is read off **that row**.

A `gclid` in the URL would be wrong three ways: it is one-to-many (one ad click,
many clickouts, so you cannot tell which experience earned the revenue), absent
for organic and direct traffic, and would forward an ad identifier past the
consent gate that `stripAdsWhenDeclined()` exists to enforce.

`utm_campaign` is a readable grouping label so the partner's own report is
legible. It is deliberately **separate** from the inbound `utm_campaign` that
brought the visitor here, which is stored on the row unchanged.

Per-partner rules live in `PARTNER_PROFILES` in
`netlify/functions/_tracking-shared.js`. LuxuryEscapes is untouched and still
gets `mx_sub`; Rome2Rio has no profile, so it gets `mx_sub` too.

### nofollow

Every partner link is a real anchor:

```html
rel="sponsored nofollow noopener noreferrer"
```

Explore-share asked for nofollow given the link volume a 4,000-page section
creates. `sponsored` is Google's current guidance for affiliate links;
`nofollow` covers older crawlers. This needs a real `<a href>` — the
`window.open()` pattern `HotelCard.tsx` uses gives a crawler nothing to read.

### New-tab mechanics — do not "simplify" this

`window.open()` with `noopener` in the feature string **returns null**, per the
HTML spec. Passing `'noopener,noreferrer'` therefore leaves no handle to
redirect, and the obvious fallback ends up running `window.location.href` on the
**current** tab — replacing the page the visitor is reading. That bug shipped
briefly and was fixed in `src/lib/outboundWindow.ts`.

The working sequence:

1. open a tab synchronously inside the click (Safari blocks a `window.open`
   after an `await`), with **no feature string**, and sever `opener` on the
   handle manually;
2. register the clickout, which mints the `sub_id` server-side;
3. point that tab at the tracked URL.

If the popup is blocked there is no handle, so the handler bails **without**
`preventDefault` and the anchor's own `target="_blank"` opens the untracked
fallback href. The visitor's tab is never redirected either way. A hanging
tracking call is capped at 2.5s, falling back to the plain href — losing the
`sub_id` on that click, not the click.

### Placements

`experience_book` and `gateway_city` were added to `OutboundPlacement`.

## PMax / Merchant Center feed

`https://mondoexplora.com/experiences-feed.xml` — RSS 2.0 with the `g:`
namespace, 4,272 products.

Written to **two** places by `scripts/generate-experiences-feed.mts`, which runs
after `next build`:

- `out/experiences-feed.xml` — the published copy. **Only `out/` is deployed**,
  so this is the one Google fetches.
- `data/experiences/experiences-feed.xml` — a readable copy next to the CSV.
  Gitignored: it is 7.5 MB and regenerates on every build, so committing it on
  each daily data refresh would bloat history.

Regenerate alone with `npm run experiences-feed`.

It imports the same loader the pages use, so the feed can never advertise a page
that was filtered out of the build. Every item links to **our** page, never
straight to the partner, so the click is tracked.

Custom labels for bidding: `0` activity, `1` country, `2` region, `3` duration
bucket, `4` price bucket.

## SEO

Per-page `generateMetadata` with canonical, OG and Twitter tags, plus
`product:price:amount` / `:currency` so the page and the feed cannot disagree.

JSON-LD is **`TouristAttraction` + `Offer`** with `BreadcrumbList` on every
level, and `ItemList` on the listing pages. The CSV ships a `json_ld` column
typed `LocalBusiness` — that is wrong for a guided trip at a place, and it is
not used.

Titles use the feed's `meta_headline` where present and a generated fallback
where not. Note the root layout applies a `"%s | MondoExplora"` template, so
titles built here must **not** repeat the brand.

`sitemap.ts` gained all 4,776 URLs. The 50,000-URL cap is the sitemap protocol's
(sitemaps.org), not Netlify's — English-only leaves plenty of headroom, but six
languages would reach ~29,000 and want splitting via `generateSitemaps()`.

## Build

~59 seconds locally for the whole site. `npm run build` now also generates the
feed. `tsx` was added as a devDependency to run the `.mts` feed script.

`next.config.js` gained `assets.explore-share.com` in `images.remotePatterns`.

## Open items

- **Re-geocode** the 670 dropped rows (above). Biggest single win available.
- Confirm Explore-share can export at `utm_content` granularity — they said yes;
  worth verifying on the first real report, since one row per clickout means
  thousands of distinct values.
- The conversion side of the chain is unbuilt: revenue report →
  `outbound_clicks` join → offline-conversion upload to Google/Meta. See
  `TRACKING_BACKEND_SPEC.md`.
