-- HR Activities Table
-- Add this to your Supabase SQL Editor to track HR activities

CREATE TABLE IF NOT EXISTS hr_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('employee_added', 'review_completed', 'goal_added', 'goal_completed', 'recognition_given', 'interview_scheduled', 'employee_updated')),
  description TEXT NOT NULL,
  employee_id UUID REFERENCES hr_employees(id) ON DELETE CASCADE,
  employee_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_hr_activities_created_at ON hr_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hr_activities_employee_id ON hr_activities(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_activities_type ON hr_activities(type);

-- Enable Row Level Security (optional, if you want access control)
ALTER TABLE hr_activities ENABLE ROW LEVEL SECURITY;

-- Sample policy (adjust based on your auth setup)
CREATE POLICY "Enable read access for all users" ON hr_activities
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON hr_activities
  FOR INSERT WITH CHECK (true);










