'use client';

export interface SessionLandingSnapshot {
  landing_url: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  fbclid: string | null;
}

function captureFromWindow(): SessionLandingSnapshot {
  const u = new URL(window.location.href);
  const p = u.searchParams;
  return {
    landing_url: window.location.href,
    referrer: document.referrer || null,
    utm_source: p.get('utm_source'),
    utm_medium: p.get('utm_medium'),
    utm_campaign: p.get('utm_campaign'),
    utm_content: p.get('utm_content'),
    utm_term: p.get('utm_term'),
    gclid: p.get('gclid'),
    gbraid: p.get('gbraid'),
    wbraid: p.get('wbraid'),
    fbclid: p.get('fbclid'),
  };
}

/** First page in this mx session: fixed landing + original ad params for attribution. */
export function getSessionLandingSnapshot(
  sessionId: string
): SessionLandingSnapshot {
  if (typeof window === 'undefined') {
    return {
      landing_url: '',
      referrer: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      gclid: null,
      gbraid: null,
      wbraid: null,
      fbclid: null,
    };
  }
  const key = `mx_snap_${sessionId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw) as SessionLandingSnapshot;
    } catch {
      /* fall through */
    }
  }
  const snap = captureFromWindow();
  localStorage.setItem(key, JSON.stringify(snap));
  return snap;
}
