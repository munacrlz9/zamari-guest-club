-- Zamari Guest Club starter schema.
-- Run this in Supabase SQL Editor after creating a new project.
-- RLS is enabled. Do not expose a service-role key in browser code.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  credits integer not null default 0 check (credits >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('stay','wine','dine','enjoy')),
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.guest_posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1200),
  media_url text,
  status text not null default 'pending' check (status in ('pending','approved','hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_code text not null,
  status text not null default 'requested' check (status in ('requested','approved','redeemed','rejected')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.feedback enable row level security;
alter table public.guest_posts enable row level security;
alter table public.reward_redemptions enable row level security;

-- Guests can read and update only their own profile.
create policy "Guests read own profile" on public.profiles
for select to authenticated using (auth.uid() = id);
-- No guest UPDATE policy yet: this prevents guests from changing their own
-- credits or membership data from the browser. Add a narrowly scoped profile
-- editing workflow later if needed.

-- A guest can submit and read only their own feedback.
create policy "Guests submit own feedback" on public.feedback
for insert to authenticated with check (auth.uid() = user_id);
create policy "Guests read own feedback" on public.feedback
for select to authenticated using (auth.uid() = user_id);

-- Guests can submit posts; public wall will show approved posts in a later phase.
create policy "Guests submit own posts" on public.guest_posts
for insert to authenticated with check (auth.uid() = user_id);
create policy "Guests read own posts" on public.guest_posts
for select to authenticated using (auth.uid() = user_id);

-- Guests can request redemptions; approval/redemption will be managed securely later.
create policy "Guests request own rewards" on public.reward_redemptions
for insert to authenticated with check (auth.uid() = user_id);
create policy "Guests read own reward requests" on public.reward_redemptions
for select to authenticated using (auth.uid() = user_id);

-- Create a profile automatically when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
