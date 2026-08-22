-- Run this in the Supabase SQL editor.

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  domain text not null,
  description text,
  total_cents bigint not null default 0,
  bid_count int not null default 0,
  last_bid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table listings enable row level security;

-- Public read. Writes happen only through the service role key (Stripe webhook).
create policy "public read" on listings for select using (true);

-- Atomic increment used by the webhook.
create or replace function apply_bid(p_url text, p_domain text, p_description text, p_cents bigint)
returns void as $$
begin
  insert into listings (url, domain, description, total_cents, bid_count, last_bid_at)
  values (p_url, p_domain, p_description, p_cents, 1, now())
  on conflict (url) do update set
    total_cents = listings.total_cents + p_cents,
    bid_count = listings.bid_count + 1,
    description = coalesce(nullif(excluded.description, ''), listings.description),
    last_bid_at = now();
end;
$$ language plpgsql security definer;
