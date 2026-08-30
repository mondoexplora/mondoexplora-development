# MondoExplora — Project Guide

Travel affiliate site (https://mondoexplora.com). Revenue comes from outbound
clicks to partners (primarily Luxury Escapes). Content is pre-generated static
HTML; there is no runtime backend except a few Netlify Functions.

## Stack & deploy

- **Next.js 15 App Router**, TypeScript, Tailwind CSS **v3.4.0** (v4 broke the
  build via `lightningcss` — do not upgrade without a plan).
- `output: 'export'`, `distDir: 'out'`, `trailingSlash: true`. Everything is
  static export: **no middleware, no SSR, no route handlers.** Every dynamic
  segment needs `generateStaticParams()`.
- **Netlify** builds `npm run build` and publishes `out/`. Functions live in
  `netlify/functions/`.
- Repo: `mondoexplora/mondoexplora-development`. Production branch: **`main`**.
- Data refresh: GitHub Action (~9am Spain) pulls a Channable CSV →
  `scripts/data-processor.js` → writes `data/**` → commits → Netlify rebuilds.

## Layout

```
src/app/[lang]/          page.tsx, home, destination/[city], country/[country],
                         route/[origin]/[destination], travel_modes/... (stub),
                         article/[slug], privacy,
                         experiences/[country]/[region]/[experience]
src/lib/                 data.ts, i18n.ts, geo-seo.ts, regional-data.ts,
                         trackingManager.ts, trackingBackend.ts,
                         trackingSnapshot.ts, mxSession.ts,
                         experiences.ts, countryBounds.ts, experienceSeo.ts,
                         experienceLinks.ts, experienceLanguages.ts,
                         outboundWindow.ts,
                         homepage-content.ts, homepage-deals.ts,
                         homepage-faq.ts
src/components/          RegionalHomepage (the homepage), Hero, HotelCard,
                         HotelGrid, RouteCTA, Footer, ConsentInitializer,
                         PrivacyConsentBox, TrackingBootstrap,
                         StructuredData, ...
src/components/home/     HomeHero, HomeDeals, DealCard, HomeExperiences,
                         HomeRegions, HomeFaq
src/components/experiences/  ExperienceCard, ActivityChips, Filterable*,
                         GettingThere, LocationMap, PartnerLink, GatewayLink
netlify/functions/       tracking-{visit,outbound-click,health}.js,
                         _tracking-shared.js, {country,destination,route}.js
data/<lang>/{destination,country,route}/*.json
data/experiences/        explore-share.csv (21MB, source for /experiences)
config/routes.json       drives route + travel_modes generateStaticParams
scripts/generate-experiences-feed.mts   PMax feed, runs after next build
supabase/migrations/     20260503000000_tracking_mvp.sql
```

## Homepage — rebuilt 2026-08-30

Order is the design: search → discounted hotels → guided experiences → region
grid → FAQ. It used to open on the region grid and show no hotels at all.

**Three routes render it** — `/`, `/[lang]` and `/[lang]/home` — so all the
loading lives in `loadHomepageContent(lang)` (`src/lib/homepage-content.ts`) and
`RegionalHomepage` is a server component that only composes sections. Only the
search box, the activity chips, the region tabs and the deal clickout are client
components.

Deals come from `getHomepageDeals()`, which scans `data/<lang>/destination/*.json`
directly (~200ms for 1,142 files) — **`data/homepage-data.json` has counts only,
no hotel records.** Deals are capped at one per country, or a single partner
clearance sale fills the whole row. Deal clickouts use placement `home_deal` and
go through `appendOutboundTrackingUrl` + `openOutboundTab`, same contract as
`PartnerLink`.

Every number in the copy is derived at build time (hotels, countries, discount,
trip counts) — the old page hardcoded "over 9,835 luxury hotels" while the data
summed to 9,428. The FAQ is generated once in `homepage-faq.ts` and feeds both the
accordion and the FAQPage JSON-LD.

The experiences rail and the search box's Experiences mode are gated on
`EXPERIENCE_LANGUAGES`, so /es, /fr and /it get a hotels-only homepage. The chip
list is cut to the same number of activities the sample covers, or a chip filters
the grid down to nothing. **All UI copy is English on every language** — as it was
before; the new sections did not add translations.

## Experiences (`/en/experiences`) — added 2026-08-29

4,776 static pages built from `data/experiences/explore-share.csv`: a hub, 69
countries, 434 regions, 4,272 experiences. **English only** — gated by
`EXPERIENCE_LANGUAGES` in `src/lib/experienceLanguages.ts`, because the feed is
not translated.

Only 4,272 of the CSV's 6,379 rows are published. **The feed's `lat`/`lng`
column is unreliable** — a geocoder fell back to unrelated points, and one New
Delhi coordinate is shared by 46 experiences across Austria, Italy and
Switzerland. Since `gateway_cities_json` was generated *from* those coordinates,
a bad point also poisons every distance and drive time shown (one Swiss day trip
lists Dubai, 2,202km, as its nearest city). Two offline checks drop 670 such
rows. **Do not relax them** — re-geocoding from `location_name + region +
country` is the real fix and would recover ~14% of the catalogue.

**The checks only prove the point is in the right country, so plenty of wrong
coordinates still publish** (a Dolomites via ferrata pinned at Lago Maggiore, a
Glencoe ridge in Suffolk). So nothing user-facing uses `lat`/`lng` any more:
`LocationMap` is a Google Maps **Embed API** iframe queried by
`location_name, region, country`, and `experienceJsonLd()` emits no `geo` block.
The Embed API is the free unmetered SKU — the Maps *JavaScript* API bills per
load and would meter all 4,272 pages. Set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`
(restricted to Embed API + referrer); without it the component falls back to the
undocumented keyless embed. Zoom is pinned at `MAP_ZOOM = 6` (~1,500 km across) so the
frame shows surrounding cities rather than unlabelled terrain. The map is
consent-gated behind a "Show map" placeholder because the iframe sets Google's
cookies. **`GettingThere` still
shows distances/drive times derived from the bad point** — known and unfixed.

Outbound links carry the `sub_id` as **`utm_content`**, not a `gclid`:
Explore-share reports revenue keyed on UTMs, last-paid-click, and a unique
`sub_id` joins 1:1 back to `outbound_clicks`. All partner links are real anchors
with `rel="sponsored nofollow noopener noreferrer"` (the partner asked).

`window.open()` with `noopener` returns null per spec — see
`src/lib/outboundWindow.ts` before touching the clickout code.

Full detail: **`EXPERIENCES.md`** (current and accurate).

## Languages — known inconsistency

`SUPPORTED_LANGUAGES = ['en','de','fr','es','it','pt']` (`src/lib/i18n.ts:1`),
and `netlify.toml` redirects all six. But `data/` only contains **en, es, fr,
it**. `de` and `pt` are wired up with no content behind them. Check this before
assuming a language works end to end.

## Tracking & attribution (the active workstream)

Chain: **Ads/organic → visit → clickout → conversion → offline conversion upload.**

- One `visits` row per `session_id` (idempotent `POST`). Many `outbound_clicks`
  per visit — **one unique `sub_id` per clickout**, never reused.
- `sub_id` is appended to the partner URL as a query param
  (`withSubIdParam()` in `_tracking-shared.js:62`, name from
  `TRACKING_SUB_ID_PARAM`, e.g. `mx_sub`). Impact returns it on the conversion
  report → exact 1:1 match back to the clickout row → read `gclid` /
  `gbraid` / `wbraid` / `fbc` / `fbp` off *that row* → upload offline
  conversions to Google/Meta.
- Popunders are ordinary clickouts with `placement="popunder"`.
- **Consent-gated**: if consent is declined, ad identifiers are not persisted.
  `ConsentInitializer` / `PrivacyConsentBox` emit `mx-consent-changed` so the
  visit re-syncs. `sub_id` still links the commercial conversion, but there may
  be no usable `gclid`.
- Endpoints (via `netlify.toml` redirects, declared **before** the language
  splats so `/api/*` isn't swallowed):
  `POST /api/tracking/visit`, `POST /api/tracking/outbound-click`,
  `GET /api/tracking/health` → `{"ok":true,"supabase":"ok"}` when healthy.

Env vars — server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`TRACKING_ALLOW_ORIGIN`, `TRACKING_SUB_ID_PARAM`. Browser:
`NEXT_PUBLIC_TRACKING_API_BASE` (empty in prod = same origin),
`NEXT_PUBLIC_TRACKING_ENABLED` (`0` disables).

Full spec and ops runbook: `TRACKING_BACKEND_SPEC.md`.

### Supabase gotcha

`SUPABASE_SERVICE_ROLE_KEY` must be the **service_role JWT** (long `eyJ…` from
"Legacy anon / service_role API keys") — *not* the JWT signing secret, *not* the
anon key. The JWT's `ref` claim must match the `<project-ref>` in
`SUPABASE_URL`. On `permission denied for table visits`, check those two first,
redeploy, then fall back to explicit `GRANT`s (see the runbook §6).

## Open questions

- **Affiliate network mismatch (hotels).** Hotel links from the CSV are
  **ShareASale** (`luxuryescapes.sjv.io`, affiliate `1991376`), not Impact — but
  the tracking backend assumes Impact conversion reports return `sub_id`.
  Unresolved; see `AFFILIATE_TRACKING_AUDIT.md`. This decides whether `sub_id`
  ever comes back. **Resolved for Explore-share only:** no network, they report
  on UTMs directly (last paid click), which is why `utm_content` carries the
  `sub_id` there.
- **Re-geocoding the experience feed** — 670 publishable experiences are held
  back purely by bad coordinates. See `EXPERIENCES.md`.
- Google Search Console verification is placeholder text in
  `src/app/layout.tsx`; DNS TXT verification was in progress.

## Repo hygiene — read before running git

`.gitignore` was broken for a long time (every pattern was wrapped in literal
quotes, matching nothing). It is fixed now, **but the damage is already
committed**: `node_modules/` (~19k files), `.next/` (~3.6k) and `out/` are
tracked. `git status` and diffs are consequently full of build artifacts.

Untracking them (`git rm -r --cached`) is a ~23k-file commit and has not been
done — **ask before doing it.** Until then, ignore build-artifact churn in
`git status`; it is not part of any change you make.

## Documentation status

`TRACKING_BACKEND_SPEC.md` and `EXPERIENCES.md` are current and accurate —
trust them. `DAILY_WORK_LOG.md` records dated sessions, newest first.

These are **stale or aspirational** — do not treat as current:
- `Infraestructura.md` — describes Pages Router, BigQuery, Sentry, weather/
  currency APIs. None of that exists. It's a plan, not a description.
- `SEO_OPTIMIZATION_SUMMARY.md` — the "+40% traffic" figures are projections.
- `PAGES_DETAILS.md`, `ESTADO_PROYECTO.md` — name wrong deploy branches
  (`spa-experiment`, `development`) and only four languages.
- `README_BLOG.md`, `README_CONTENT_CREATOR_ADMIN.md`, `README_COUNTRY_PAGES.md`,
  `README_ROUTES.md`, `README_CSV_ROUTES.md`, `README_DETAILED_RESEARCH.md` —
  all describe the retired Flask prototype (`python3 server.py`, port 5000).
- `HOW_MONDOEXPLORA_WORKS.md` — empty (0 bytes).

**Secrets committed in docs** (both in git history, rotation not just deletion):
a live Google Maps API key at `README_GOOGLE_MAPS_INTEGRATION.md:46`, and
`admin`/`admin123` at `README_CONTENT_CREATOR_ADMIN.md:15`.

## Conventions

- Cast language params: `lang as SupportedLanguage`.
- Types live in `src/types/index.ts`. Hotel discount field is
  `original_price`, not `value`.
- Event handlers can't cross the server/client boundary — wrap in a client
  component (see `DestinationImage.tsx`, `RouteCTA.tsx`).
- Verify with `npm run build` before committing; static export fails loudly on
  a missing `generateStaticParams()`.
