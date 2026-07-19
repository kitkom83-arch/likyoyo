-- Per-page manager delegation (LINE-style page co-managers).
-- Adds page_managers: which admin_users may co-manage a given public page slug,
-- and whether they may add further managers to that same page.
-- Safe to run multiple times.

begin;

create extension if not exists pgcrypto;

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

create index if not exists page_managers_slug_idx
  on public.page_managers(slug);
create index if not exists page_managers_admin_user_id_idx
  on public.page_managers(admin_user_id);

drop trigger if exists page_managers_set_updated_at on public.page_managers;
create trigger page_managers_set_updated_at
before update on public.page_managers
for each row
execute function public.set_updated_at();

commit;
