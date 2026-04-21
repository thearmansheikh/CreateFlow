-- Migration 002: Add auto-workspace creation to signup trigger
-- Run after init.sql to enhance the handle_new_user function

-- Drop old trigger, recreate with workspace creation
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

create or replace function handle_new_user()
returns trigger as $$
declare
  new_workspace_id uuid;
  user_slug text;
begin
  -- Create user profile
  insert into users (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Create default workspace
  user_slug := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    '[^a-zA-Z0-9]',
    '-',
    'g'
  )) || '-' || substring(md5(random()::text) from 1 for 4);

  insert into workspaces (owner_id, name, slug, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name' || '''s Workspace', split_part(new.email, '@', 1) || '''s Workspace'),
    user_slug,
    'free'
  ) returning id into new_workspace_id;

  -- Add user as owner of workspace
  insert into workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();
