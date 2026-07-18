-- Base public_pages table.
-- This is the foundational table the later owner-control migrations ALTER.
-- Run this first on a fresh Supabase project, before any owner-control migration.

begin;

create extension if not exists pgcrypto;

create table if not exists public.public_pages (
  slug text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists public_pages_updated_at_idx
  on public.public_pages(updated_at desc);

commit;
