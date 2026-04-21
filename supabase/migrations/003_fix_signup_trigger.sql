-- Migration 003: Fix the handle_new_user trigger
-- Run this in Supabase SQL Editor to replace the broken trigger

-- Drop the old trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- Recreate with better error handling
create or replace function handle_new_user()
returns trigger as $$
declare
  new_workspace_id uuid;
  user_slug text;
begin
  -- Step 1: Create user profile
  insert into public.users (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Step 2: Create default workspace
  user_slug := lower(
    regexp_replace(
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      '[^a-zA-Z0-9]',
      '-',
      'g'
    )
  ) || '-' || substring(md5(new.id::text || clock_timestamp()::text) from 1 for 6);

  insert into public.workspaces (owner_id, name, slug, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Workspace',
    user_slug,
    'free'
  ) returning id into new_workspace_id;

  -- Step 3: Add user as owner of workspace
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
exception when others then
  -- Log the error and let the auth.users insert still succeed
  raise warning 'handle_new_user trigger failed: % %', SQLSTATE, SQLERRM;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();
