-- Upgrade 2: bidder emails for outbid alerts. Run in Supabase SQL editor.

alter table listings add column if not exists email text;

-- Emails must never be publicly readable. Postgres column-level grants:
-- remove blanket select, then re-grant every column EXCEPT email.
revoke select on listings from anon;
revoke select on listings from authenticated;
grant select (id, url, domain, description, total_cents, bid_count, last_bid_at, created_at)
  on listings to anon;
grant select (id, url, domain, description, total_cents, bid_count, last_bid_at, created_at)
  on listings to authenticated;
