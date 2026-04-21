-- CreateFlow Database Schema
-- Run in Supabase SQL Editor or via CLI

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. USERS (extends auth.users)
-- ==========================================
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'creator', 'agency', 'enterprise')),
  credits_balance integer not null default 50,
  total_credits_used integer not null default 0,
  trial_end_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================
-- 2. WORKSPACES
-- ==========================================
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  plan text not null default 'free' check (plan in ('free', 'creator', 'agency', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================
-- 3. WORKSPACE MEMBERS
-- ==========================================
create table workspace_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

-- ==========================================
-- 4. FOLDERS
-- ==========================================
create table folders (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  parent_folder_id uuid references folders(id) on delete set null,
  color text,
  icon text,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 5. BRAND PROFILES
-- ==========================================
create table brand_profiles (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text,
  voice_tone jsonb,
  visual_style jsonb,
  logo_url text,
  brand_colors text[],
  brand_fonts text[],
  brand_examples text[],
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================
-- 6. CONTENT ITEMS
-- ==========================================
create table content_items (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('image', 'video', 'music', 'copy', 'upload')),
  title text,
  description text,
  file_url text,
  thumbnail_url text,
  file_size bigint,
  mime_type text,
  width integer,
  height integer,
  duration integer,
  tags text[] not null default '{}',
  folder_id uuid references folders(id) on delete set null,
  brand_profile_id uuid references brand_profiles(id) on delete set null,
  is_favorite boolean not null default false,
  ai_model_used text,
  original_prompt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================
-- 7. GENERATION TASKS
-- ==========================================
create table generation_tasks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('image', 'video', 'music', 'copy')),
  prompt text not null,
  enhanced_prompt text,
  negative_prompt text,
  parameters jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  progress integer not null default 0,
  result_url text,
  error_message text,
  model_used text,
  credits_used integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 8. CREDIT TRANSACTIONS
-- ==========================================
create table credit_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  type text not null check (type in ('purchase', 'usage', 'refund', 'bonus', 'trial')),
  amount integer not null,
  description text,
  related_generation_id uuid references generation_tasks(id) on delete set null,
  stripe_payment_id text,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 9. SCHEDULED POSTS
-- ==========================================
create table scheduled_posts (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  content_ids uuid[] not null default '{}',
  caption text,
  platforms jsonb,
  scheduled_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),
  publish_log jsonb,
  published_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================
-- 10. SOCIAL CONNECTIONS
-- ==========================================
create table social_connections (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube', 'linkedin', 'twitter', 'facebook', 'pinterest')),
  platform_user_id text,
  platform_username text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================
-- 11. ANALYTICS EVENTS
-- ==========================================
create table analytics_events (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  post_id uuid references scheduled_posts(id) on delete set null,
  platform text,
  event_type text not null check (event_type in ('impression', 'engagement', 'click', 'share', 'comment', 'like', 'save', 'follow', 'view')),
  event_value integer not null default 0,
  event_metadata jsonb,
  recorded_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 12. SUBSCRIPTIONS
-- ==========================================
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null check (plan in ('creator', 'agency', 'enterprise')),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================
-- INDEXES (for query performance)
-- ==========================================
create index idx_content_items_workspace on content_items(workspace_id);
create index idx_content_items_type on content_items(type);
create index idx_content_items_folder on content_items(folder_id);
create index idx_content_items_created on content_items(created_at desc);
create index idx_content_items_favorite on content_items(is_favorite);

create index idx_generation_tasks_workspace on generation_tasks(workspace_id);
create index idx_generation_tasks_status on generation_tasks(status);
create index idx_generation_tasks_created on generation_tasks(created_at desc);

create index idx_folders_workspace on folders(workspace_id);

create index idx_brand_profiles_workspace on brand_profiles(workspace_id);

create index idx_scheduled_posts_workspace on scheduled_posts(workspace_id);
create index idx_scheduled_posts_scheduled on scheduled_posts(scheduled_at);
create index idx_scheduled_posts_status on scheduled_posts(status);

create index idx_credit_transactions_user on credit_transactions(user_id);
create index idx_credit_transactions_workspace on credit_transactions(workspace_id);

create index idx_workspace_members_workspace on workspace_members(workspace_id);
create index idx_workspace_members_user on workspace_members(user_id);

create index idx_social_connections_workspace on social_connections(workspace_id);

create index idx_analytics_events_workspace on analytics_events(workspace_id);
create index idx_analytics_events_recorded on analytics_events(recorded_at desc);

-- ==========================================
-- RLS (Row Level Security) POLICIES
-- ==========================================
alter table users enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table content_items enable row level security;
alter table folders enable row level security;
alter table brand_profiles enable row level security;
alter table generation_tasks enable row level security;
alter table credit_transactions enable row level security;
alter table scheduled_posts enable row level security;
alter table social_connections enable row level security;
alter table analytics_events enable row level security;
alter table subscriptions enable row level security;

-- Users: can only see their own profile
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

-- Workspaces: users can access workspaces they own or are members of
create policy "Workspace access" on workspaces
  for select using (
    owner_id = auth.uid() or
    id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

-- Workspace members: can see members of accessible workspaces
create policy "Workspace members access" on workspace_members
  for select using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
      union
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );

-- Content items: workspace-scoped access
create policy "Content items access" on content_items
  for all using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
      union
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );

-- Folders: workspace-scoped access
create policy "Folders access" on folders
  for all using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
      union
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );

-- Brand profiles: workspace-scoped access
create policy "Brand profiles access" on brand_profiles
  for all using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
      union
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );

-- Generation tasks: workspace-scoped access
create policy "Generation tasks access" on generation_tasks
  for all using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
      union
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );

-- Credit transactions: user can see their own
create policy "Credit transactions access" on credit_transactions
  for select using (user_id = auth.uid());

-- Scheduled posts: workspace-scoped access
create policy "Scheduled posts access" on scheduled_posts
  for all using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
      union
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );

-- Social connections: workspace-scoped access
create policy "Social connections access" on social_connections
  for all using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
      union
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );

-- Analytics events: workspace-scoped access
create policy "Analytics events access" on analytics_events
  for select using (
    workspace_id in (
      select id from workspaces where owner_id = auth.uid()
      union
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );

-- Subscriptions: user can see their own
create policy "Subscriptions access" on subscriptions
  for all using (user_id = auth.uid());

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update updated_at on users
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_updated_at
  before update on users
  for each row
  execute function update_updated_at_column();

create trigger update_workspaces_updated_at
  before update on workspaces
  for each row
  execute function update_updated_at_column();

create trigger update_content_items_updated_at
  before update on content_items
  for each row
  execute function update_updated_at_column();

create trigger update_brand_profiles_updated_at
  before update on brand_profiles
  for each row
  execute function update_updated_at_column();

create trigger update_scheduled_posts_updated_at
  before update on scheduled_posts
  for each row
  execute function update_updated_at_column();

create trigger update_social_connections_updated_at
  before update on social_connections
  for each row
  execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at_column();

-- Auto-create user profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into users (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();
