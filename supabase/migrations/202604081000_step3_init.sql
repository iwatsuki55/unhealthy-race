create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 30),
  age_group text,
  gender text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('healthy', 'unhealthy')),
  category text not null,
  point_value integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique (name)
);

create table if not exists public.action_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action_id uuid not null references public.actions (id) on delete restrict,
  point_value integer not null,
  memo text,
  action_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.actions enable row level security;
alter table public.action_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "actions_select_authenticated" on public.actions;
drop policy if exists "action_logs_select_own" on public.action_logs;
drop policy if exists "action_logs_insert_own" on public.action_logs;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "actions_select_authenticated"
  on public.actions
  for select
  to authenticated
  using (is_active = true);

create policy "action_logs_select_own"
  on public.action_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "action_logs_insert_own"
  on public.action_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create index if not exists action_logs_user_id_action_at_idx
  on public.action_logs (user_id, action_at desc);

create index if not exists actions_type_idx
  on public.actions (type);
