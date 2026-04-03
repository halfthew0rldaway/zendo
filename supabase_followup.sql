-- =============================================================================
-- FOLLOW-UP SQL SCRIPT FOR ZENDO
-- =============================================================================

-- 1. Add Sprint Goal to Projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sprint_goal text;

-- 2. Add Functional Task Columns
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS checklist jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS testing_status text DEFAULT 'not_tested',
ADD COLUMN IF NOT EXISTS testing_notes text,
ADD COLUMN IF NOT EXISTS assignee_name text,
ADD COLUMN IF NOT EXISTS assignee_initials text;

-- 3. Ensure Notifications Table exists
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  type text,
  content text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Enable Realtime updates
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE projects, tasks, notifications;
