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
  owner_id uuid references auth.users not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Project Members
create table project_members (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text default 'member' check (role in ('owner', 'member')),
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

-- 5. CREATE POLICIES
-- Profiles
create policy "Profiles viewable by everyone" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- Projects
create policy "Auth users create projects" on projects for insert with check (auth.uid() is not null);
create policy "Owners do everything on projects" on projects for all using (auth.uid() = owner_id);
create policy "Members view projects" on projects for select using (
  exists (select 1 from project_members where project_id = projects.id and user_id = auth.uid())
);

-- Members
create policy "Users see memberships" on project_members for select using (user_id = auth.uid() or exists (
  select 1 from projects where id = project_id and owner_id = auth.uid()
));
create policy "Owners add members" on project_members for insert with check (exists (
  select 1 from projects where id = project_id and owner_id = auth.uid()
) or auth.uid() = user_id);

-- Tasks
create policy "Members see tasks" on tasks for select using (exists (
  select 1 from project_members where project_id = tasks.project_id and user_id = auth.uid()
));
create policy "Members modify tasks" on tasks for all using (exists (
  select 1 from project_members where project_id = tasks.project_id and user_id = auth.uid()
));

-- Notifications
create policy "Users view notifications" on notifications for select using (user_id = auth.uid());

-- 6. ENABLE REALTIME
create publication supabase_realtime for table projects, tasks, notifications;