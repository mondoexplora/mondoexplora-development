'use strict';

const { json, getSupabase } = require('./_tracking-shared');

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin;

  if (event.httpMethod === 'OPTIONS') {
    return json(204, {}, origin);
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' }, origin);
  }

  const supabase = getSupabase();
  const configured = Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!supabase) {
    return json(200, { ok: true, supabase: 'missing_env' }, origin);
  }

  const { error } = await supabase.from('visits').select('id').limit(1);
  if (error) {
    return json(200, {
      ok: false,
      supabase: configured ? 'misconfigured_or_no_table' : 'missing_env',
      detail: error.message,
    }, origin);
  }

  return json(200, { ok: true, supabase: 'ok' }, origin);
};
