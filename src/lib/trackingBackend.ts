'use client';

import {
  getOrCreateMxAnonUserId,
  getOrCreateMxSessionId,
  getStoredVisitId,
  setStoredVisitId,
} from '@/lib/mxSession';
import {
  getSessionLandingSnapshot,
  type SessionLandingSnapshot,
} from '@/lib/trackingSnapshot';

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_TRACKING_API_BASE || '').replace(/\/$/, '');
}

function apiUrl(path: string): string {
  const base = apiBase();
  return base ? `${base}${path}` : path;
}

export function isTrackingBackendEnabled(): boolean {
  return process.env.NEXT_PUBLIC_TRACKING_ENABLED !== '0';
}

export function emitConsentChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('mx-consent-changed'));
}

export function subscribeConsentChanges(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('mx-consent-changed', cb);
  return () => window.removeEventListener('mx-consent-changed', cb);
}

export type CookieConsentFlag = 'accepted' | 'declined' | 'partial' | 'unknown';

export function readCookieConsentFlag(): CookieConsentFlag {
  if (typeof window === 'undefined') return 'unknown';
  const v = localStorage.getItem('cookie-consent');
  if (v === 'accepted') return 'accepted';
  if (v === 'declined') return 'declined';
  if (v === 'partial') return 'partial';
  return 'unknown';
}

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function simpleDeviceHints(): {
  device_type: string;
  browser: string;
  os: string;
} {
  if (typeof navigator === 'undefined') {
    return { device_type: 'unknown', browser: 'unknown', os: 'unknown' };
  }
  const ua = navigator.userAgent;
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  return {
    device_type: mobile ? 'mobile' : 'desktop',
    browser: 'unknown',
    os: 'unknown',
  };
}

function adFieldsFromSnapshot(
  consent: CookieConsentFlag,
  snap: SessionLandingSnapshot
) {
  if (consent !== 'accepted') {
    return {
      gclid: null,
      gbraid: null,
      wbraid: null,
      fbclid: null,
      fbc: null,
      fbp: null,
    };
  }
  return {
    gclid: snap.gclid,
    gbraid: snap.gbraid,
    wbraid: snap.wbraid,
    fbclid: snap.fbclid,
    fbc: getCookieValue('_fbc'),
    fbp: getCookieValue('_fbp'),
  };
}

/** Upsert visit row (one per mx session). Safe to call on navigation / consent changes. */
export async function syncVisitWithBackend(): Promise<void> {
  if (!isTrackingBackendEnabled() || typeof window === 'undefined') return;

  const sessionId = getOrCreateMxSessionId();
  if (!sessionId) return;

  const consent = readCookieConsentFlag();
  const snap = getSessionLandingSnapshot(sessionId);
  const ads = adFieldsFromSnapshot(consent, snap);
  const dev = simpleDeviceHints();

  const payload = {
    session_id: sessionId,
    anon_user_id: getOrCreateMxAnonUserId(),
    landing_url: snap.landing_url,
    referrer: snap.referrer,
    utm_source: snap.utm_source,
    utm_medium: snap.utm_medium,
    utm_campaign: snap.utm_campaign,
    utm_content: snap.utm_content,
    utm_term: snap.utm_term,
    ...ads,
    device_type: dev.device_type,
    browser: dev.browser,
    os: dev.os,
    country: null,
    consent_status: consent,
    consent_updated_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(apiUrl('/api/tracking/visit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { visit?: { id?: string } };
    if (data.visit?.id) {
      setStoredVisitId(sessionId, data.visit.id);
    }
  } catch {
    /* fail open */
  }
}

export type OutboundPlacement =
  | 'hotel_card'
  | 'route_cta_affiliate'
  | 'popunder'
  | 'other';

/** Register outbound click; returns URL with tracking param (or original on failure). */
export async function appendOutboundTrackingUrl(
  destinationUrl: string,
  opts: { placement: OutboundPlacement; partner?: string }
): Promise<string> {
  if (!isTrackingBackendEnabled() || typeof window === 'undefined') {
    return destinationUrl;
  }

  if (!destinationUrl || !/^https?:\/\//i.test(destinationUrl)) {
    return destinationUrl;
  }

  const sessionId = getOrCreateMxSessionId();
  const consent = readCookieConsentFlag();
  const snap = getSessionLandingSnapshot(sessionId);
  const ads = adFieldsFromSnapshot(consent, snap);
  const visitId = getStoredVisitId(sessionId);

  const payload = {
    session_id: sessionId,
    visit_id: visitId,
    anon_user_id: getOrCreateMxAnonUserId(),
    destination_url: destinationUrl,
    placement: opts.placement,
    partner: opts.partner,
    page_url: window.location.href,
    consent_status: consent,
    utm_source: snap.utm_source,
    utm_medium: snap.utm_medium,
    utm_campaign: snap.utm_campaign,
    ...ads,
  };

  try {
    const res = await fetch(apiUrl('/api/tracking/outbound-click'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return destinationUrl;
    const data = (await res.json()) as { final_url?: string };
    return data.final_url || destinationUrl;
  } catch {
    return destinationUrl;
  }
}
