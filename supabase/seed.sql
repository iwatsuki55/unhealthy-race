insert into public.actions (name, type, category, point_value, is_active)
values
  ('深夜の食事', 'unhealthy', 'food', 10, true),
  ('飲みすぎ', 'unhealthy', 'drinking', 15, true),
  ('間食しすぎ', 'unhealthy', 'food', 8, true),
  ('睡眠不足', 'unhealthy', 'sleep', 10, true),
  ('運動しなかった', 'unhealthy', 'exercise', 8, true),
  ('歩かなかった', 'unhealthy', 'exercise', 6, true),
  ('長時間座りっぱなし', 'unhealthy', 'lifestyle', 5, true),
  ('夜更かし', 'unhealthy', 'sleep', 10, true),
  ('ジャンクフードを食べた', 'unhealthy', 'food', 7, true),
  ('午前中から飲んだ', 'unhealthy', 'drinking', 12, true),
  ('20分以上歩いた', 'healthy', 'exercise', -5, true),
  ('階段を使った', 'healthy', 'exercise', -3, true),
  ('飲酒を控えた', 'healthy', 'drinking', -8, true),
  ('夜食を我慢した', 'healthy', 'food', -8, true),
  ('7時間以上寝た', 'healthy', 'sleep', -10, true),
  ('運動した', 'healthy', 'exercise', -8, true),
  ('ストレッチした', 'healthy', 'exercise', -3, true),
  ('ヨガやサウナでリフレッシュした', 'healthy', 'lifestyle', -5, true),
  ('野菜をしっかり食べた', 'healthy', 'food', -4, true),
  ('早めに就寝した', 'healthy', 'sleep', -6, true)
on conflict (name) do update
set
  type = excluded.type,
  category = excluded.category,
  point_value = excluded.point_value,
  is_active = excluded.is_active;
