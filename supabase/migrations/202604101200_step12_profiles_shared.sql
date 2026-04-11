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

drop policy if exists "profiles_select_race_members" on public.profiles;

create policy "profiles_select_race_members"
  on public.profiles
  for select
  to authenticated
  using (public.shared_race_with_user(id));
