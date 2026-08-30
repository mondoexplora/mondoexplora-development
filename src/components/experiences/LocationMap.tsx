'use client';

import { useEffect, useState } from 'react';
import { Experience } from '@/lib/experiences';
import { readCookieConsentFlag, subscribeConsentChanges } from '@/lib/trackingBackend';

/**
 * Google Maps embed for the experience location.
 *
 * Queried BY NAME, never by the feed's lat/lng. Those coordinates are wrong far
 * more often than the country-bounds filter in `experiences.ts` can catch — it
 * only rejects a point outside the claimed country, so a Dolomites via ferrata
 * geocoded to Lago Maggiore (250km off) or a Glencoe ridge geocoded to Suffolk
 * (700km off) both pass and both publish. Handing Google the place name instead
 * lets its geocoder resolve it, and it gets all three of those right where the
 * feed got them wrong. See EXPERIENCES.md.
 *
 * The Maps *Embed* API is the free, unmetered one — unlike the Maps JavaScript
 * API, which bills per map load and would meter all 4,272 pages. Nothing here
 * runs at build time, so it is compatible with `output: 'export'`.
 *
 * Third-party iframe, so it is consent-gated: Google sets cookies the moment it
 * loads. Until consent is accepted the user gets a placeholder and loads the map
 * with an explicit click.
 */

interface LocationMapProps {
  experience: Experience;
}

/** `location, region, country`, minus the duplicates — many rows repeat them. */
export function mapQuery(e: Experience): string {
  const parts: string[] = [];
  for (const part of [e.locationName, e.region, e.country]) {
    const v = (part ?? '').trim();
    if (!v) continue;
    if (parts.some((p) => p.toLowerCase() === v.toLowerCase())) continue;
    parts.push(v);
  }
  return parts.join(', ');
}

const EMBED_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;

/**
 * Fixed zoom, because Google's default framing for a named place is far too
 * tight for most of this catalogue: a mountain, a ferrata or a glacier fills the
 * frame with unlabelled terrain and tells the reader nothing about *where* it
 * is. Pulling back to a regional view puts recognisable towns and coastline on
 * screen.
 *
 * Roughly: a ~900px-wide frame spans `40,075 · cos(lat) / 2^zoom · 3.5` km, so
 * at Alpine latitudes zoom 6 ≈ 1,500 km across. Each step down doubles the span,
 * each step up halves it. This is the one number to change.
 */
const MAP_ZOOM = 6;

export function mapEmbedSrc(query: string): string {
  const q = encodeURIComponent(query);
  // Documented, supported endpoint. Needs a key restricted to the Embed API.
  if (EMBED_KEY) {
    return `https://www.google.com/maps/embed/v1/place?key=${EMBED_KEY}&q=${q}&zoom=${MAP_ZOOM}`;
  }
  // No key configured yet: the legacy keyless embed still works, but it is
  // undocumented and Google can withdraw it. Set the env var.
  return `https://maps.google.com/maps?q=${q}&z=${MAP_ZOOM}&output=embed`;
}

// Height lives in experiences.css so the mobile override actually applies — an
// inline style used to beat the media query, leaving the map 340px tall on phones.
export default function LocationMap({ experience }: LocationMapProps) {
  const [allowed, setAllowed] = useState(false);
  const query = mapQuery(experience);

  useEffect(() => {
    const sync = () => setAllowed(readCookieConsentFlag() === 'accepted');
    sync();
    return subscribeConsentChanges(sync);
  }, []);

  if (!allowed) {
    return (
      <div className="exp-map exp-map-placeholder">
        <div className="exp-map-ask">
          <strong>{experience.locationName}</strong>
          <span>{[experience.region, experience.country].join(', ')}</span>
          <button type="button" onClick={() => setAllowed(true)}>
            Show map
          </button>
          <small>Loads from Google Maps, which sets its own cookies.</small>
        </div>
      </div>
    );
  }

  return (
    <div className="exp-map">
      {/* Google's own "Open in Maps" control sits inside the frame, so no link
          of ours here — it only collided with the attribution strip on mobile. */}
      <iframe
        src={mapEmbedSrc(query)}
        title={`Map of ${query}`}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
