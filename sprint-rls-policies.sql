-- RLS Policies for Sprints
-- Run this in your Supabase SQL Editor to enable sprint functionality

-- First, ensure RLS is enabled
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enable all operations for sprints" ON sprints;
DROP POLICY IF EXISTS "Enable all operations for sprint_tasks" ON sprint_tasks;

-- Create permissive policies for sprints table (allows all operations)
CREATE POLICY "Enable all operations for sprints" ON sprints
FOR ALL
USING (true)
WITH CHECK (true);

-- Create permissive policies for sprint_tasks table (allows all operations)
CREATE POLICY "Enable all operations for sprint_tasks" ON sprint_tasks
FOR ALL
USING (true)
WITH CHECK (true);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('sprints', 'sprint_tasks');



















