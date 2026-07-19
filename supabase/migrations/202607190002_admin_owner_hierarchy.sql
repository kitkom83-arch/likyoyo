-- Owner tenancy hierarchy.
-- Each admin_user remembers who created it. Owners can only see/manage the
-- accounts and pages within their own subtree (the accounts they created,
-- recursively). The original root owner (created_by = null) still governs
-- everyone because every account descends from it.
-- Safe to run multiple times.

begin;

alter table public.admin_users
  add column if not exists created_by_admin_id uuid null
    references public.admin_users(id) on delete set null;

create index if not exists admin_users_created_by_admin_id_idx
  on public.admin_users(created_by_admin_id);

-- Backfill: attach every pre-existing account to the earliest owner (the root),
-- so the root keeps full visibility. The root itself stays unparented (null).
with root as (
  select id
  from public.admin_users
  where role = 'owner'
  order by created_at asc
  limit 1
)
update public.admin_users u
  set created_by_admin_id = (select id from root)
where (select id from root) is not null
  and u.created_by_admin_id is null
  and u.id <> (select id from root);

commit;
