-- Owner Control not-null enforcement.
-- Run this only after the Owner Control app deploy and owner/admin flow are verified.

begin;

do $$
declare
  unowned_pages integer;
begin
  select count(*)
  into unowned_pages
  from public.public_pages
  where owner_admin_id is null;

  if unowned_pages > 0 then
    raise exception 'Cannot enforce public_pages.owner_admin_id not null: % public_pages rows are still unowned.', unowned_pages;
  end if;
end $$;

alter table public.public_pages
  alter column owner_admin_id set not null;

commit;
