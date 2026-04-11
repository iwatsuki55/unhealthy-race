alter table public.profiles
  add column if not exists comment_tone text not null default 'gentle'
  check (comment_tone in ('gentle', 'sarcastic'));
