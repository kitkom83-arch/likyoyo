-- Public pages deleted archive.
-- Keeps deleted slug data recoverable without blocking slug reuse in public.public_pages.

begin;

create extension if not exists pgcrypto;

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
  if not exists (
    select 1
    from pg_constraint
    where conname = 'public_pages_deleted_owner_admin_id_fkey'
  ) then
    alter table public.public_pages_deleted
      add constraint public_pages_deleted_owner_admin_id_fkey
      foreign key (owner_admin_id)
      references public.admin_users(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'public_pages_deleted_deleted_by_admin_id_fkey'
  ) then
    alter table public.public_pages_deleted
      add constraint public_pages_deleted_deleted_by_admin_id_fkey
      foreign key (deleted_by_admin_id)
      references public.admin_users(id)
      on delete set null;
  end if;
end $$;

create index if not exists public_pages_deleted_owner_admin_id_idx
  on public.public_pages_deleted(owner_admin_id);

create index if not exists public_pages_deleted_deleted_at_idx
  on public.public_pages_deleted(deleted_at desc);

create index if not exists public_pages_deleted_slug_idx
  on public.public_pages_deleted(slug);

commit;
