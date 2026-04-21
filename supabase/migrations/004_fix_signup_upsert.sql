-- Migration 004: Robust signup trigger with upsert logic
-- Run this in Supabase SQL Editor to completely fix signup

-- Drop old trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

create or replace function handle_new_user()
returns trigger as $$
declare
  new_workspace_id uuid;
  user_slug text;
  ws_name text;
begin
  -- Step 1: Upsert user profile (handles duplicate safely)
  insert into public.users (id, full_name, avatar_url, credits_balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    50
  )
  on conflict (id) do update
    set
      full_name = coalesce(excluded.full_name, public.users.full_name),
      avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
      updated_at = now();

  -- Step 2: Create default workspace (only if doesn't exist)
  if not exists (select 1 from public.workspaces where owner_id = new.id limit 1) then
    user_slug := lower(
      regexp_replace(
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        '[^a-zA-Z0-9]',
        '-',
        'g'
      )
    ) || '-' || substring(md5(new.id::text || clock_timestamp()::text) from 1 for 6);

    ws_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Workspace';

    insert into public.workspaces (owner_id, name, slug, plan)
    values (new.id, ws_name, user_slug, 'free')
    returning id into new_workspace_id;

    -- Step 3: Add user as owner of workspace
    insert into public.workspace_members (workspace_id, user_id, role)
    values (new_workspace_id, new.id, 'owner');
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();
