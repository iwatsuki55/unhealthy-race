create table if not exists public.medical_english_practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  lesson_slug text not null,
  lesson_title text not null,
  mode text not null check (mode in ('speaking', 'reading', 'roleplay')),
  average_score integer not null check (average_score >= 0 and average_score <= 100),
  completed_count integer not null default 0,
  total_count integer not null default 0,
  review_item_count integer not null default 0,
  summary text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.medical_english_practice_sessions enable row level security;

drop policy if exists "medical_english_practice_sessions_select_own" on public.medical_english_practice_sessions;
create policy "medical_english_practice_sessions_select_own"
  on public.medical_english_practice_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "medical_english_practice_sessions_insert_own" on public.medical_english_practice_sessions;
create policy "medical_english_practice_sessions_insert_own"
  on public.medical_english_practice_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);
