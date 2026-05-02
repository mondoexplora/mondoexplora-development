'use strict';

const {
  json,
  getSupabase,
  makeSubId,
  partnerFromUrl,
  withSubIdParam,
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
  const destination_url = body.destination_url;
  const placement = body.placement;

  if (!session_id || typeof session_id !== 'string') {
    return json(400, { error: 'session_id required' }, origin);
  }
  if (!destination_url || typeof destination_url !== 'string') {
    return json(400, { error: 'destination_url required' }, origin);
  }
  if (!placement || typeof placement !== 'string') {
    return json(400, { error: 'placement required' }, origin);
  }

  let destUrl;
  try {
    // eslint-disable-next-line no-new
    new URL(destination_url);
    destUrl = destination_url;
  } catch {
    return json(400, { error: 'destination_url must be absolute URL' }, origin);
  }

  const consent_status = body.consent_status || 'unknown';
  const paramName =
    process.env.TRACKING_SUB_ID_PARAM ||
    body.parameter_name ||
    'mx_sub';

  const sub_id = makeSubId();
  const final_url = withSubIdParam(destUrl, paramName, sub_id);
  const partner = body.partner || partnerFromUrl(destUrl);

  let visit_id = body.visit_id || null;
  if (visit_id && typeof visit_id !== 'string') {
    visit_id = String(visit_id);
  }
  const uuidOk =
    visit_id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      visit_id
    );
  if (!uuidOk) {
    visit_id = null;
  }

  if (!visit_id) {
    const { data: visitRow } = await supabase
      .from('visits')
      .select('id')
      .eq('session_id', session_id)
      .maybeSingle();
    if (visitRow?.id) visit_id = visitRow.id;
  }

  const ads = stripAdsWhenDeclined(consent_status, {
    gclid: body.gclid || null,
    gbraid: body.gbraid || null,
    wbraid: body.wbraid || null,
    fbclid: body.fbclid || null,
    fbc: body.fbc || null,
    fbp: body.fbp || null,
  });

  const insertRow = {
    visit_id,
    session_id,
    anon_user_id: body.anon_user_id || null,
    partner,
    destination_url: destUrl,
    final_url,
    sub_id,
    parameter_name: paramName,
    placement,
    page_url: body.page_url || null,
    utm_source: body.utm_source || null,
    utm_medium: body.utm_medium || null,
    utm_campaign: body.utm_campaign || null,
    ...ads,
  };

  const { data, error } = await supabase
    .from('outbound_clicks')
    .insert(insertRow)
    .select('id, sub_id, final_url')
    .single();

  if (error) {
    console.error('outbound_clicks insert error', error);
    return json(500, { error: 'Database error' }, origin);
  }

  return json(
    200,
    {
      ok: true,
      outbound_click_id: data.id,
      sub_id: data.sub_id,
      final_url: data.final_url,
    },
    origin
  );
};
