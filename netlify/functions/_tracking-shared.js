'use strict';

const { createClient } = require('@supabase/supabase-js');
const { randomBytes } = require('crypto');

const ALLOW_HEADERS = 'Content-Type, Idempotency-Key';

function getCorsHeaders(origin) {
  const allowed =
    process.env.TRACKING_ALLOW_ORIGIN ||
    'https://mondoexplora.com,http://localhost:8888,http://localhost:3000';
  const list = allowed.split(',').map((s) => s.trim()).filter(Boolean);
  const allow =
    origin && list.includes(origin) ? origin : list[0] || '*';

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': ALLOW_HEADERS,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function json(statusCode, body, origin) {
  return {
    statusCode,
    headers: getCorsHeaders(origin),
    body: JSON.stringify(body),
  };
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function makeSubId() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const rand = randomBytes(8).toString('hex');
  return `mx_${y}${m}${day}_${rand}`;
}

function partnerFromUrl(urlString) {
  try {
    const host = new URL(urlString).hostname.replace(/^www\./, '');
    if (host.includes('luxuryescapes')) return 'luxuryescapes';
    if (host.includes('explore-share')) return 'exploreshare';
    return host || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Per-partner outbound URL rules.
 *
 * Explore-share reports revenue back to us keyed on the UTM values they receive,
 * on a last-paid-click basis — they are not on Impact or ShareASale. So the
 * sub_id has to travel as `utm_content` rather than our usual `mx_sub`, and the
 * static source/medium have to be present for their report to attribute at all.
 *
 * `utm_content` carries the sub_id (not a gclid) deliberately: it is unique per
 * clickout, so their revenue line joins 1:1 back to the outbound_clicks row, and
 * the gclid / fbc needed for an offline-conversion upload is read off THAT row.
 * A gclid in the URL would be one-to-many (one ad click, many clickouts), absent
 * for organic traffic, and would leak an ad identifier past our consent gate.
 */
const PARTNER_PROFILES = [
  {
    partner: 'exploreshare',
    test: (host) => host.includes('explore-share'),
    subIdParam: 'utm_content',
    staticParams: {
      utm_source: 'mondoexplora',
      utm_medium: 'affiliate',
    },
  },
];

function partnerProfileFor(urlString) {
  try {
    const host = new URL(urlString).hostname.replace(/^www\./, '');
    return PARTNER_PROFILES.find((p) => p.test(host)) || null;
  } catch {
    return null;
  }
}

function withSubIdParam(urlString, paramName, subId) {
  const u = new URL(urlString);
  u.searchParams.set(paramName, subId);
  return u.toString();
}

/**
 * Build the outbound URL for a clickout: sub_id under the partner's expected
 * parameter, plus any static UTMs and a human-readable campaign so the partner's
 * own report groups sensibly.
 *
 * Returns the parameter the sub_id actually landed under, which is stored on the
 * row so a later revenue reconciliation knows where to look.
 */
function buildOutboundUrl(urlString, subId, opts) {
  const options = opts || {};
  const profile = partnerProfileFor(urlString);
  const paramName =
    (profile && profile.subIdParam) || options.defaultParam || 'mx_sub';

  const u = new URL(urlString);

  if (profile && profile.staticParams) {
    for (const [k, v] of Object.entries(profile.staticParams)) {
      u.searchParams.set(k, v);
    }
  }
  if (profile && options.campaign) {
    u.searchParams.set('utm_campaign', options.campaign);
  }
  u.searchParams.set(paramName, subId);

  return { final_url: u.toString(), parameter_name: paramName };
}

function stripAdsWhenDeclined(consentStatus, row) {
  if (consentStatus === 'accepted') return row;
  const copy = { ...row };
  copy.gclid = null;
  copy.gbraid = null;
  copy.wbraid = null;
  copy.fbclid = null;
  copy.fbc = null;
  copy.fbp = null;
  return copy;
}

module.exports = {
  getCorsHeaders,
  json,
  getSupabase,
  makeSubId,
  partnerFromUrl,
  partnerProfileFor,
  withSubIdParam,
  buildOutboundUrl,
  stripAdsWhenDeclined,
};
