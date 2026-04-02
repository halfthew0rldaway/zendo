-- Enable extension
create extension if not exists "uuid-ossp";

-- =========================
-- PROFILES (User Public Data)
-- =========================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
on profiles for select using (true);

create policy "Users can insert own profile"
on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update using (auth.uid() = id);


-- =========================
-- PROJECTS
-- =========================
create table projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  pin_hash text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table projects enable row level security;


-- =========================
-- PROJECT MEMBERS (JOIN TABLE)
-- =========================
create table project_members (
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member',
  joined_at timestamp with time zone default now(),
  primary key (project_id, user_id)
);

alter table project_members enable row level security;

create policy "Users can see their memberships"
on project_members for select
using (user_id = auth.uid());


-- =========================
-- PROJECT RLS (BASED ON MEMBERSHIP)
-- =========================
create policy "Members can view projects"
on projects for select
using (
  exists (
    select 1 from project_members
    where project_members.project_id = projects.id
    and project_members.user_id = auth.uid()
  )
);

create policy "Members can update projects"
on projects for update
using (
  exists (
    select 1 from project_members
    where project_members.project_id = projects.id
    and project_members.user_id = auth.uid()
  )
);

create policy "Authenticated users can create projects"
on projects for insert
with check (auth.uid() is not null);


-- =========================
-- TASKS
-- =========================
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
  assignee_id uuid references profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table tasks enable row level security;

create policy "Members can view tasks"
on tasks for select
using (
  exists (
    select 1 from project_members
    where project_members.project_id = tasks.project_id
    and project_members.user_id = auth.uid()
  )
);

create policy "Members can modify tasks"
on tasks for all
using (
  exists (
    select 1 from project_members
    where project_members.project_id = tasks.project_id
    and project_members.user_id = auth.uid()
  )
);


-- =========================
-- NOTIFICATIONS
-- =========================
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  actor_id uuid references profiles(id),
  project_id uuid references projects(id),
  type text,
  content text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

alter table notifications enable row level security;

create policy "Users can view their notifications"
on notifications for select
using (user_id = auth.uid());

create policy "System can insert notifications"
on notifications for insert
with check (true);


-- =========================
-- TRIGGER FUNCTION (TASK UPDATE NOTIFICATION)
-- =========================
create or replace function notify_task_update()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into notifications (user_id, actor_id, project_id, type, content)
    select user_id, auth.uid(), new.project_id, 'task_moved',
           'Task "' || new.title || '" updated'
    from project_members
    where project_id = new.project_id
    and user_id != auth.uid();
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_task_update
after update on tasks
for each row
execute function notify_task_update();