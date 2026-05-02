-- MondoExplora tracking MVP (Postgres / Supabase)
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "pgcrypto";

-- Visits: one logical row per session_id (upsert from API)
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  session_id text not null unique,
  anon_user_id text,
  landing_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  gbraid text,
  wbraid text,
  fbclid text,
  fbc text,
  fbp text,
  device_type text,
  browser text,
  os text,
  country text,
  consent_status text not null default 'unknown',
  consent_updated_at timestamptz
);

create index if not exists idx_visits_created_at on public.visits (created_at);

-- Outbound partner clicks (one sub_id per click)
create table if not exists public.outbound_clicks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  visit_id uuid references public.visits (id) on delete set null,
  session_id text not null,
  anon_user_id text,
  partner text not null,
  destination_url text not null,
  final_url text not null,
  sub_id text not null unique,
  parameter_name text not null default 'mx_sub',
  placement text not null,
  page_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  gclid text,
  gbraid text,
  wbraid text,
  fbclid text,
  fbc text,
  fbp text
);

create index if not exists idx_outbound_session_created on public.outbound_clicks (session_id, created_at);
create index if not exists idx_outbound_partner_created on public.outbound_clicks (partner, created_at);

-- Conversions (import / manual match later)
create table if not exists public.conversions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  conversion_at timestamptz,
  partner text,
  impact_action_id text,
  sub_id text,
  outbound_click_id uuid references public.outbound_clicks (id) on delete set null,
  revenue numeric,
  commission numeric,
  currency text,
  status text,
  matched boolean not null default false,
  uploaded_to_google boolean not null default false,
  uploaded_to_meta boolean not null default false
);

create index if not exists idx_conversions_sub_id on public.conversions (sub_id);
create index if not exists idx_conversions_conversion_at on public.conversions (conversion_at);
create index if not exists idx_conversions_matched on public.conversions (matched, conversion_at);

-- Optional: keep updated_at in sync on visits
create or replace function public.touch_visits_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_visits_updated_at on public.visits;
create trigger trg_visits_updated_at
before update on public.visits
for each row execute procedure public.touch_visits_updated_at();

-- Lock down direct client DB access (API uses service role only)
alter table public.visits enable row level security;
alter table public.outbound_clicks enable row level security;
alter table public.conversions enable row level security;
