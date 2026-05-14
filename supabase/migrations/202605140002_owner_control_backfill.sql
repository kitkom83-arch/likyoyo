-- Owner Control backfill.
-- Run this after:
-- 1. 202605140001_owner_control_schema.sql has succeeded.
-- 2. You inserted the first owner into public.admin_users.
--
-- This assigns every existing public_pages row, including /110, to the first owner.
-- It never deletes public_pages data.
-- It intentionally leaves owner_admin_id nullable until the app deploy is verified.

begin;

do $$
declare
  first_owner_id uuid;
begin
  select id
  into first_owner_id
  from public.admin_users
  where role = 'owner'
  order by created_at asc
  limit 1;

  if first_owner_id is null then
    raise exception 'Create at least one owner admin before running owner_control_backfill.';
  end if;

  update public.public_pages
  set owner_admin_id = first_owner_id
  where owner_admin_id is null;
end $$;

commit;
