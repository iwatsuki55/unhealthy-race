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

create or replace function public.shared_race_with_user(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.race_members as viewer_membership
    join public.race_members as target_membership
      on viewer_membership.race_id = target_membership.race_id
    where viewer_membership.user_id = auth.uid()
      and target_membership.user_id = target_user_id
  );
$$;

grant execute on function public.shared_race_with_user(uuid) to authenticated;

drop policy if exists "race_members_select_race_members" on public.race_members;
create policy "race_members_select_race_members"
  on public.race_members
  for select
  to authenticated
  using (public.can_view_race(race_id));

drop policy if exists "profiles_select_race_members" on public.profiles;
create policy "profiles_select_race_members"
  on public.profiles
  for select
  to authenticated
  using (public.shared_race_with_user(id));
