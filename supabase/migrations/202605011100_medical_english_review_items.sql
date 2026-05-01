create table if not exists public.medical_english_review_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  lesson_slug text not null,
  lesson_title text not null,
  mode text not null check (mode in ('speaking', 'reading', 'roleplay')),
  reason text not null,
  recommended_action text not null,
  next_review_window text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists medical_english_review_items_user_key
  on public.medical_english_review_items (user_id, lesson_slug, mode, reason);

create or replace function public.set_medical_english_review_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_medical_english_review_items_updated_at
  on public.medical_english_review_items;

create trigger set_medical_english_review_items_updated_at
before update on public.medical_english_review_items
for each row
execute function public.set_medical_english_review_items_updated_at();

alter table public.medical_english_review_items enable row level security;

drop policy if exists "medical_english_review_items_select_own" on public.medical_english_review_items;
create policy "medical_english_review_items_select_own"
  on public.medical_english_review_items
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "medical_english_review_items_insert_own" on public.medical_english_review_items;
create policy "medical_english_review_items_insert_own"
  on public.medical_english_review_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "medical_english_review_items_update_own" on public.medical_english_review_items;
create policy "medical_english_review_items_update_own"
  on public.medical_english_review_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "medical_english_review_items_delete_own" on public.medical_english_review_items;
create policy "medical_english_review_items_delete_own"
  on public.medical_english_review_items
  for delete
  to authenticated
  using (auth.uid() = user_id);
