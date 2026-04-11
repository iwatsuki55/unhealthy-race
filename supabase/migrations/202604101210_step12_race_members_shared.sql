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

drop policy if exists "race_members_select_race_members" on public.race_members;

create policy "race_members_select_race_members"
  on public.race_members
  for select
  to authenticated
  using (public.can_view_race(race_id));
