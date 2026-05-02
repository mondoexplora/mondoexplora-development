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
    return host || 'unknown';
  } catch {
    return 'unknown';
  }
}

function withSubIdParam(urlString, paramName, subId) {
  const u = new URL(urlString);
  u.searchParams.set(paramName, subId);
  return u.toString();
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
  withSubIdParam,
  stripAdsWhenDeclined,
};
