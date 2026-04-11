create table if not exists public.race_invites (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references public.races (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  code text not null unique,
  relationship_type text not null check (relationship_type in ('friend', 'rival')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.race_invites enable row level security;

grant select, insert on public.race_invites to authenticated;

drop policy if exists "race_invites_select_authenticated" on public.race_invites;
drop policy if exists "race_invites_insert_own" on public.race_invites;

create policy "race_invites_select_authenticated"
  on public.race_invites
  for select
  to authenticated
  using (status = 'active' or created_by = auth.uid());

create policy "race_invites_insert_own"
  on public.race_invites
  for insert
  to authenticated
  with check (created_by = auth.uid());

create index if not exists race_invites_race_id_created_at_idx
  on public.race_invites (race_id, created_at desc);

