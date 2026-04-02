-- 1. DROP EVERYTHING FIRST to start clean
DROP TABLE IF EXISTS notifications, tasks, project_members, projects, profiles CASCADE;

-- 2. ENABLE EXTENSION
create extension if not exists "uuid-ossp";

-- 3. CREATE TABLES (ORDER MATTERS)
-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Projects
create table projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text default 'assignment',
  icon_bg text default 'blue',
  pin_hash text,
  due_date timestamp with time zone,
  owner_id uuid references auth.users not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Project Members
create table project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text default 'member' check (role in ('owner', 'member', 'viewer')),
  joined_at timestamp with time zone default now(),
  unique(project_id, user_id)
);

-- Tasks
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  labels jsonb default '[]',
  checklist jsonb default '[]',
  attachments jsonb default '[]',
  github_link text,
  testing_status text default 'not_tested',
  testing_notes text,
  due_date timestamp with time zone,
  assignee_id uuid references auth.users,
  assignee_name text,
  assignee_initials text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Notifications
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  actor_id uuid references auth.users,
  project_id uuid references projects(id),
  type text,
  content text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- 4. ENABLE RLS
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;
alter table notifications enable row level security;

-- 5. CREATE POLICIES (Simplified for small team - no recursion possible)
-- Profiles
create policy "Allow all for authenticated users" on profiles for all using (auth.uid() is not null);

-- Project Members
create policy "Allow all for authenticated users" on project_members for all using (auth.uid() is not null);

-- Projects
create policy "Allow all for authenticated users" on projects for all using (auth.uid() is not null);

-- Tasks
create policy "Allow all for authenticated users" on tasks for all using (auth.uid() is not null);

-- Notifications
create policy "Allow all for authenticated users" on notifications for all using (auth.uid() is not null);

-- 6. ENABLE REALTIME
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE projects, tasks, notifications;

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION: Run these if tables already exist (adds due_date columns)
-- ─────────────────────────────────────────────────────────────────────────────
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS due_date timestamp with time zone;
-- ALTER TABLE tasks    ADD COLUMN IF NOT EXISTS due_date timestamp with time zone;

-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION: Update check constraint for roles on project_members table
-- ─────────────────────────────────────────────────────────────────────────────
-- ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_role_check;
-- ALTER TABLE project_members ADD CONSTRAINT project_members_role_check CHECK (role IN ('owner', 'member', 'viewer'));