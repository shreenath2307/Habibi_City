-- Habibi City — schema, RLS, moderation trigger, seed data.
-- Paste this whole file into the Supabase SQL editor and run it once.
-- Safe to re-run: tables use IF NOT EXISTS, policies are dropped first,
-- and the seed only inserts when a table is still empty.

/* ---------------------------------------------------------------
   1. Tables
   --------------------------------------------------------------- */

create table if not exists public.routes (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.stations (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique,
  lat  double precision not null,
  lng  double precision not null
);

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  body         text not null check (char_length(body) between 1 and 2000),
  route_id     uuid references public.routes (id) on delete set null,
  station_id   uuid references public.stations (id) on delete set null,
  category     text not null check (category in ('practical', 'observation')),
  emotion      text,
  city         text,
  kind         text not null default 'route' check (kind in ('route', 'letter')),
  hidden       boolean not null default false,
  report_count integer not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.reactions (
  id        uuid primary key default gen_random_uuid(),
  post_id   uuid not null references public.posts (id) on delete cascade,
  device_id text not null,
  type      text not null default 'like',
  unique (post_id, device_id, type)
);

create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts (id) on delete cascade,
  body         text not null check (char_length(body) between 1 and 280),
  hidden       boolean not null default false,
  report_count integer not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.reports (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  device_id  text not null,
  created_at timestamptz not null default now(),
  check (post_id is not null or comment_id is not null)
);

create index if not exists posts_feed_idx on public.posts (kind, hidden, created_at desc);
create index if not exists comments_post_idx on public.comments (post_id);
create index if not exists reactions_post_idx on public.reactions (post_id);

/* ---------------------------------------------------------------
   2. Moderation trigger: 3 reports hide the target
   --------------------------------------------------------------- */

create or replace function public.handle_report()
returns trigger
language plpgsql
security definer           -- runs as the owner, so it can update past RLS
set search_path = public
as $$
begin
  if new.post_id is not null then
    update public.posts
       set report_count = report_count + 1
     where id = new.post_id;

    update public.posts
       set hidden = true
     where id = new.post_id
       and report_count >= 3;

  elsif new.comment_id is not null then
    update public.comments
       set report_count = report_count + 1
     where id = new.comment_id;

    update public.comments
       set hidden = true
     where id = new.comment_id
       and report_count >= 3;
  end if;

  return new;
end;
$$;

drop trigger if exists on_report_insert on public.reports;

create trigger on_report_insert
  after insert on public.reports
  for each row execute function public.handle_report();

/* ---------------------------------------------------------------
   3. Row level security
   Anyone may read visible rows and insert. Nobody may update or
   delete — only the trigger above changes rows, and it runs as owner.
   --------------------------------------------------------------- */

alter table public.routes    enable row level security;
alter table public.stations  enable row level security;
alter table public.posts     enable row level security;
alter table public.reactions enable row level security;
alter table public.comments  enable row level security;
alter table public.reports   enable row level security;

drop policy if exists routes_read     on public.routes;
drop policy if exists stations_read   on public.stations;
drop policy if exists posts_read      on public.posts;
drop policy if exists posts_insert    on public.posts;
drop policy if exists reactions_read  on public.reactions;
drop policy if exists reactions_insert on public.reactions;
drop policy if exists comments_read   on public.comments;
drop policy if exists comments_insert on public.comments;
drop policy if exists reports_insert  on public.reports;

create policy routes_read      on public.routes     for select using (true);
create policy stations_read    on public.stations   for select using (true);

create policy posts_read       on public.posts      for select using (hidden = false);
create policy posts_insert     on public.posts      for insert with check (true);

create policy reactions_read   on public.reactions  for select using (true);
create policy reactions_insert on public.reactions  for insert with check (true);

create policy comments_read    on public.comments   for select using (hidden = false);
create policy comments_insert  on public.comments   for insert with check (true);

-- Reports are write-only: they can be filed but not read back by the app.
create policy reports_insert   on public.reports    for insert with check (true);

-- Privileges. No update or delete is granted to the public roles at all.
grant usage on schema public to anon, authenticated;
grant select         on public.routes, public.stations to anon, authenticated;
grant select, insert on public.posts, public.reactions, public.comments to anon, authenticated;
grant insert         on public.reports to anon, authenticated;

/* ---------------------------------------------------------------
   4. Seed data
   --------------------------------------------------------------- */

insert into public.routes (name) values
  ('Bus 7'), ('Line 2'), ('Bus 33')
on conflict (name) do nothing;

insert into public.stations (name, lat, lng) values
  ('Churchgate',    18.9322, 72.8264),
  ('Marine Lines',  18.9456, 72.8234),
  ('Grant Road',    18.9630, 72.8150),
  ('Dadar',         19.0186, 72.8441),
  ('Bandra',        19.0545, 72.8402),
  ('Andheri',       19.1197, 72.8468)
on conflict (name) do nothing;

-- 10 route posts. The practical ones are timestamped inside the last hour so
-- the status board has something to show straight away.
insert into public.posts (body, route_id, station_id, category, emotion, kind, created_at)
select *
from (
  values
    ('Packed solid, could not get on the first one.',
     (select id from public.routes   where name = 'Bus 7'),
     (select id from public.stations where name = 'Dadar'),
     'practical', 'crowding', 'route', now() - interval '8 minutes'),

    ('Standing room only past Bandra.',
     (select id from public.routes   where name = 'Bus 7'),
     (select id from public.stations where name = 'Bandra'),
     'practical', 'crowding', 'route', now() - interval '21 minutes'),

    ('Still crowded but moving.',
     (select id from public.routes   where name = 'Bus 7'),
     null,
     'practical', 'crowding', 'route', now() - interval '44 minutes'),

    ('Signal failure, about fifteen minutes behind.',
     (select id from public.routes   where name = 'Line 2'),
     (select id from public.stations where name = 'Marine Lines'),
     'practical', 'delay', 'route', now() - interval '12 minutes'),

    ('Held outside Churchgate for a while.',
     (select id from public.routes   where name = 'Line 2'),
     (select id from public.stations where name = 'Churchgate'),
     'practical', 'delay', 'route', now() - interval '35 minutes'),

    ('Running clean, no waiting at all this morning.',
     (select id from public.routes   where name = 'Bus 33'),
     (select id from public.stations where name = 'Andheri'),
     'practical', 'clear', 'route', now() - interval '18 minutes'),

    ('Someone gave up their seat for a man with a cast. He tried to refuse twice.',
     (select id from public.routes   where name = 'Bus 7'),
     (select id from public.stations where name = 'Grant Road'),
     'observation', 'kindness', 'route', now() - interval '2 hours'),

    ('A heron on the wires outside Dadar, completely unbothered by all of us.',
     (select id from public.routes   where name = 'Line 2'),
     (select id from public.stations where name = 'Dadar'),
     'observation', 'sightings', 'route', now() - interval '5 hours'),

    ('Two strangers found out they grew up on the same street. They swapped numbers before Andheri.',
     (select id from public.routes   where name = 'Bus 33'),
     (select id from public.stations where name = 'Andheri'),
     'observation', 'small moments', 'route', now() - interval '1 day'),

    ('Everyone quiet, everyone warm, rain on every window. Best ride in weeks.',
     (select id from public.routes   where name = 'Bus 33'),
     null,
     'observation', 'vibes', 'route', now() - interval '2 days')
) as seed
where not exists (select 1 from public.posts where kind = 'route');

-- 5 unsent letters across 2 cities.
insert into public.posts (body, category, city, kind, created_at)
select *
from (
  values
    ('Dear Mumbai, I have lived here four years and I still look up at the same building every morning. I have never found out who lives there.',
     'observation', 'Mumbai', 'letter', now() - interval '3 hours'),

    ('Dear Mumbai, thank you for the man at the tea stall who remembers I take no sugar. You have no idea what that does for a person.',
     'observation', 'Mumbai', 'letter', now() - interval '1 day'),

    ('Dear Mumbai, I am leaving in March and I have not told anyone yet. I wanted to tell you first.',
     'observation', 'Mumbai', 'letter', now() - interval '3 days'),

    ('Dear Delhi, your winters made me miserable and I miss them anyway.',
     'observation', 'Delhi', 'letter', now() - interval '6 hours'),

    ('Dear Delhi, I rehearsed an apology on the Blue Line for six stops and then said nothing. Keeping it here instead.',
     'observation', 'Delhi', 'letter', now() - interval '2 days')
) as seed
where not exists (select 1 from public.posts where kind = 'letter');
