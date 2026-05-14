# Owner Control setup

Do not run these SQL files blindly in production. Review them, then run them manually in Supabase SQL editor.

## Required environment

- `ADMIN_SESSION_SECRET`: long random secret for signing admin sessions.
- Existing Supabase env values must remain configured:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `LINKBIO_IMAGES_BUCKET`

`ADMIN_PASSWORD` is no longer used for new session signing.

## First owner setup

1. Generate a password hash locally:

```bash
node scripts/hash-admin-password.mjs "replace-with-first-owner-password"
```

2. Run `supabase/migrations/202605140001_owner_control_schema.sql` in Supabase.

3. Insert the first owner with the generated hash:

```sql
insert into public.admin_users (
  username,
  password_hash,
  display_name,
  role,
  slug_limit,
  active
) values (
  'owner',
  'paste-generated-password-hash-here',
  'Owner',
  'owner',
  10000,
  true
);
```

4. Run `supabase/migrations/202605140002_owner_control_backfill.sql`.

5. Deploy the `feature/owner-control` app with `ADMIN_SESSION_SECRET` set.

6. Verify the owner/admin flow:
   - Log in at `/admin/login` with the first owner username and password.
   - Confirm the owner can see and manage existing public pages.
   - Confirm creating or updating an admin-owned page works.

7. Run `supabase/migrations/202605140003_owner_control_enforce_not_null.sql`.

## Verification queries

```sql
select id, username, display_name, role, slug_limit, active
from public.admin_users
order by created_at;

select slug, owner_admin_id
from public.public_pages
where slug = '110';

select count(*) as unowned_pages
from public.public_pages
where owner_admin_id is null;
```
