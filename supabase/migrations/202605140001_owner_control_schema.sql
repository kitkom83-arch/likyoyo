-- Owner Control schema.
-- Run this first in Supabase SQL editor. It does not mutate existing public_pages data.

begin;

create extension if not exists pgcrypto;

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

alter table public.public_pages
  add column if not exists owner_admin_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'public_pages_owner_admin_id_fkey'
  ) then
    alter table public.public_pages
      add constraint public_pages_owner_admin_id_fkey
      foreign key (owner_admin_id)
      references public.admin_users(id);
  end if;
end $$;

create index if not exists public_pages_owner_admin_id_idx
  on public.public_pages(owner_admin_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row
execute function public.set_updated_at();

commit;
