create extension if not exists pgcrypto;

create table if not exists categories (
  id serial primary key,
  parent_id integer references categories(id) on delete set null,
  name jsonb not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table if exists categories add column if not exists tags jsonb default '[]'::jsonb not null;

alter table products add column if not exists category_id integer references categories(id) on delete set null;

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  address text,
  coords text,
  phone text,
  card_number text,
  manager_user_id uuid,
  created_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value text not null
);

-- RLS policies (development-friendly). Review before production.
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  surname text not null,
  company text,
  position text,
  city text,
  phone text,
  created_at timestamptz default now()
);

alter table if exists users enable row level security;
do $$ begin
  create policy users_select_anon on users for select to anon using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy users_insert_anon on users for insert to anon with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy users_update_anon on users for update to anon using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy users_delete_anon on users for delete to anon using (true);
exception when duplicate_object then null; end $$;
