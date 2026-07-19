-- ============================================================
-- linkbio / likyoyo — Supabase bootstrap (run once in SQL Editor)
-- Creates: public_pages, admin_users, public_pages_deleted
-- Seeds:   first owner (username: owner)
-- ============================================================

begin;

create extension if not exists pgcrypto;

-- 1) Base public_pages table
create table if not exists public.public_pages (
  slug text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists public_pages_updated_at_idx
  on public.public_pages(updated_at desc);

-- 2) admin_users (owner control)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  display_name text not null,
  role text not null check (role in ('owner', 'admin')),
  slug_limit integer not null default 10 check (slug_limit >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_users_role_idx on public.admin_users(role);
create index if not exists admin_users_active_idx on public.admin_users(active);

-- 3) link public_pages -> admin_users
alter table public.public_pages
  add column if not exists owner_admin_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'public_pages_owner_admin_id_fkey'
  ) then
    alter table public.public_pages
      add constraint public_pages_owner_admin_id_fkey
      foreign key (owner_admin_id) references public.admin_users(id);
  end if;
end $$;

create index if not exists public_pages_owner_admin_id_idx
  on public.public_pages(owner_admin_id);

-- 4) updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

-- 5) deleted archive
create table if not exists public.public_pages_deleted (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  data jsonb not null,
  owner_admin_id uuid null,
  original_updated_at timestamptz null,
  deleted_at timestamptz not null default now(),
  deleted_by_admin_id uuid null,
  deleted_reason text null
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'public_pages_deleted_owner_admin_id_fkey') then
    alter table public.public_pages_deleted
      add constraint public_pages_deleted_owner_admin_id_fkey
      foreign key (owner_admin_id) references public.admin_users(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'public_pages_deleted_deleted_by_admin_id_fkey') then
    alter table public.public_pages_deleted
      add constraint public_pages_deleted_deleted_by_admin_id_fkey
      foreign key (deleted_by_admin_id) references public.admin_users(id) on delete set null;
  end if;
end $$;

create index if not exists public_pages_deleted_owner_admin_id_idx on public.public_pages_deleted(owner_admin_id);
create index if not exists public_pages_deleted_deleted_at_idx on public.public_pages_deleted(deleted_at desc);
create index if not exists public_pages_deleted_slug_idx on public.public_pages_deleted(slug);

-- 5b) per-page manager delegation (LINE-style page co-managers)
create table if not exists public.page_managers (
  id uuid primary key default gen_random_uuid(),
  slug text not null
    references public.public_pages(slug) on update cascade on delete cascade,
  admin_user_id uuid not null
    references public.admin_users(id) on delete cascade,
  can_manage_managers boolean not null default false,
  created_by_admin_id uuid null
    references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, admin_user_id)
);

create index if not exists page_managers_slug_idx on public.page_managers(slug);
create index if not exists page_managers_admin_user_id_idx on public.page_managers(admin_user_id);

drop trigger if exists page_managers_set_updated_at on public.page_managers;
create trigger page_managers_set_updated_at
before update on public.page_managers
for each row execute function public.set_updated_at();

-- 6) seed first owner (username: owner / password: Owner1234!)
insert into public.admin_users (username, password_hash, display_name, role, slug_limit, active)
values (
  'owner',
  'pbkdf2_sha256$210000$96b94330c90df3b65952743d982716db$ca9af80646a9d99f5b0cea5a50f3c6e43fa72b28d4945705b429b151b166c1e0',
  'Owner',
  'owner',
  10000,
  true
)
on conflict (username) do nothing;

commit;
