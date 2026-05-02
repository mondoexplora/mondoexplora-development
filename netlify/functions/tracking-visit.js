'use strict';

const {
  json,
  getSupabase,
  stripAdsWhenDeclined,
} = require('./_tracking-shared');

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;

  if (event.httpMethod === 'OPTIONS') {
    return json(204, {}, origin);
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' }, origin);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return json(503, { error: 'Tracking backend not configured (missing Supabase env)' }, origin);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON' }, origin);
  }

  const session_id = body.session_id;
  if (!session_id || typeof session_id !== 'string') {
    return json(400, { error: 'session_id required' }, origin);
  }

  const consent_status = body.consent_status || 'unknown';
  if (!['accepted', 'declined', 'partial', 'unknown'].includes(consent_status)) {
    return json(400, { error: 'invalid consent_status' }, origin);
  }

  const row = stripAdsWhenDeclined(consent_status, {
    session_id,
    anon_user_id: body.anon_user_id || null,
    landing_url: body.landing_url || null,
    referrer: body.referrer || null,
    utm_source: body.utm_source || null,
    utm_medium: body.utm_medium || null,
    utm_campaign: body.utm_campaign || null,
    utm_content: body.utm_content || null,
    utm_term: body.utm_term || null,
    gclid: body.gclid || null,
    gbraid: body.gbraid || null,
    wbraid: body.wbraid || null,
    fbclid: body.fbclid || null,
    fbc: body.fbc || null,
    fbp: body.fbp || null,
    device_type: body.device_type || null,
    browser: body.browser || null,
    os: body.os || null,
    country: body.country || null,
    consent_status,
    consent_updated_at: body.consent_updated_at || null,
  });

  const { data, error } = await supabase
    .from('visits')
    .upsert(row, { onConflict: 'session_id' })
    .select('id, session_id, consent_status')
    .single();

  if (error) {
    console.error('visits upsert error', error);
    return json(500, { error: 'Database error' }, origin);
  }

  return json(200, { ok: true, visit: data }, origin);
};
