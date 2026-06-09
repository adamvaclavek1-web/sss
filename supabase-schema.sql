-- ============================================================
-- COIN FLIP APP - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  current_streak integer default 0 not null,
  best_streak integer default 0 not null,
  total_flips integer default 0 not null,
  total_wins integer default 0 not null,
  reroll_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- LEADERBOARD TABLE (snapshot refreshed every 3 hours)
-- ============================================================
create table if not exists public.leaderboard_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  username text not null,
  avatar_url text,
  streak integer not null,
  rank integer not null,
  snapshot_time timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.leaderboard_snapshots enable row level security;

create policy "Leaderboard snapshots are viewable by everyone"
  on public.leaderboard_snapshots for select using (true);

create policy "Service role can manage leaderboard"
  on public.leaderboard_snapshots for all using (true);

-- ============================================================
-- FLIP HISTORY TABLE
-- ============================================================
create table if not exists public.flip_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  choice text not null check (choice in ('heads', 'tails')),
  result text not null check (result in ('heads', 'tails')),
  won boolean not null,
  streak_before integer not null,
  streak_after integer not null,
  rerolled boolean default false,
  reroll_cost numeric(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.flip_history enable row level security;

create policy "Users can view their own flip history"
  on public.flip_history for select using (auth.uid() = user_id);

create policy "Service role can insert flip history"
  on public.flip_history for insert with check (true);

-- ============================================================
-- REROLL PURCHASES TABLE
-- ============================================================
create table if not exists public.reroll_purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  stripe_session_id text unique not null,
  amount numeric(10,2) not null,
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  streak_saved_at integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reroll_purchases enable row level security;

create policy "Users can view their own purchases"
  on public.reroll_purchases for select using (auth.uid() = user_id);

create policy "Service role can manage purchases"
  on public.reroll_purchases for all using (true);

-- ============================================================
-- LEADERBOARD REFRESH TRACKING
-- ============================================================
create table if not exists public.leaderboard_meta (
  id integer primary key default 1,
  last_refresh timestamp with time zone default timezone('utc'::text, now()),
  next_refresh timestamp with time zone default (timezone('utc'::text, now()) + interval '3 hours')
);

insert into public.leaderboard_meta (id, last_refresh, next_refresh)
values (1, now(), now() + interval '3 hours')
on conflict (id) do nothing;

alter table public.leaderboard_meta enable row level security;

create policy "Leaderboard meta is viewable by everyone"
  on public.leaderboard_meta for select using (true);

-- ============================================================
-- FUNCTION: Refresh leaderboard snapshot
-- ============================================================
create or replace function public.refresh_leaderboard()
returns void as $$
begin
  -- Delete old snapshot
  delete from public.leaderboard_snapshots;

  -- Insert new snapshot from current profiles
  insert into public.leaderboard_snapshots (user_id, username, avatar_url, streak, rank)
  select
    id,
    username,
    avatar_url,
    best_streak,
    row_number() over (order by best_streak desc, updated_at asc)
  from public.profiles
  where best_streak > 0
  order by best_streak desc
  limit 100;

  -- Update meta
  update public.leaderboard_meta
  set last_refresh = now(),
      next_refresh = now() + interval '3 hours'
  where id = 1;
end;
$$ language plpgsql security definer;
