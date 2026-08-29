-- Run this in the Supabase SQL editor to set up the database

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Children
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  school_year int not null check (school_year between 1 and 6),
  created_at timestamptz default now() not null
);

alter table public.children enable row level security;
create policy "Parents can manage own children" on public.children
  for all using (auth.uid() = parent_id);

-- Log entries
create table if not exists public.log_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.children(id) on delete cascade not null,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  question_id text not null,
  question_text text not null,
  dimension text not null,
  response text not null,
  created_at timestamptz default now() not null
);

alter table public.log_entries enable row level security;
create policy "Parents can manage own log entries" on public.log_entries
  for all using (auth.uid() = parent_id);
