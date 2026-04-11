create table if not exists public.races (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid not null references auth.users (id) on delete cascade,
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.race_members (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references public.races (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  relationship_type text not null default 'self' check (relationship_type in ('self', 'friend', 'rival')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (race_id, user_id)
);

alter table public.action_logs
  add column if not exists race_id uuid references public.races (id) on delete cascade;

alter table public.races enable row level security;
alter table public.race_members enable row level security;

create or replace function public.can_view_race(target_race_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.race_members
    where race_members.race_id = target_race_id
      and race_members.user_id = auth.uid()
  );
$$;

grant execute on function public.can_view_race(uuid) to authenticated;

grant select, insert, update on public.races to authenticated;
grant select, insert on public.race_members to authenticated;

drop policy if exists "races_select_member" on public.races;
drop policy if exists "races_insert_own" on public.races;
drop policy if exists "races_update_owner" on public.races;
drop policy if exists "race_members_select_own" on public.race_members;
drop policy if exists "race_members_select_race_members" on public.race_members;
drop policy if exists "race_members_insert_own" on public.race_members;
drop policy if exists "action_logs_select_own" on public.action_logs;
drop policy if exists "action_logs_select_race_members" on public.action_logs;
drop policy if exists "action_logs_insert_own" on public.action_logs;

create policy "races_select_member"
  on public.races
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.race_members
      where race_members.race_id = races.id
        and race_members.user_id = auth.uid()
    )
  );

create policy "races_insert_own"
  on public.races
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "races_update_owner"
  on public.races
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "race_members_select_own"
  on public.race_members
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "race_members_select_race_members"
  on public.race_members
  for select
  to authenticated
  using (public.can_view_race(race_id));

create policy "race_members_insert_own"
  on public.race_members
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "action_logs_select_own"
  on public.action_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "action_logs_select_race_members"
  on public.action_logs
  for select
  to authenticated
  using (public.can_view_race(race_id));

create policy "action_logs_insert_own"
  on public.action_logs
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.race_members
      where race_members.race_id = action_logs.race_id
        and race_members.user_id = auth.uid()
    )
  );

insert into public.races (name, status, created_by, start_at)
select
  '個人レース',
  'active',
  users.user_id,
  timezone('utc', now())
from (
  select id as user_id from public.profiles
  union
  select user_id from public.action_logs
) as users
where not exists (
  select 1
  from public.race_members
  join public.races on races.id = race_members.race_id
  where race_members.user_id = users.user_id
    and races.status = 'active'
);

insert into public.race_members (race_id, user_id, role, relationship_type)
select
  races.id,
  races.created_by,
  'owner',
  'self'
from public.races
where races.status = 'active'
  and not exists (
    select 1
    from public.race_members
    where race_members.race_id = races.id
      and race_members.user_id = races.created_by
  );

update public.action_logs
set race_id = race_members.race_id
from public.race_members
join public.races on races.id = race_members.race_id
where action_logs.user_id = race_members.user_id
  and races.status = 'active'
  and action_logs.race_id is null;

create index if not exists race_members_user_id_created_at_idx
  on public.race_members (user_id, created_at desc);

create index if not exists action_logs_race_id_action_at_idx
  on public.action_logs (race_id, action_at desc);
