drop policy if exists "action_logs_select_race_members" on public.action_logs;

create policy "action_logs_select_race_members"
  on public.action_logs
  for select
  to authenticated
  using (public.can_view_race(race_id));
