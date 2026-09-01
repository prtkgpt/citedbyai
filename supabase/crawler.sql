-- Crawler visit log. Run in the Supabase SQL editor.

create table if not exists crawler_visits (
  id bigint generated always as identity primary key,
  bot text not null,
  path text,
  visited_at timestamptz not null default now()
);

alter table crawler_visits enable row level security;

create policy "public read visits" on crawler_visits for select using (true);
