-- HR Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Employees table
CREATE TABLE IF NOT EXISTS hr_employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Onboarding', 'Inactive', 'On Leave')),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  manager_id UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
  photo_url TEXT, -- URL to employee photo (JPEG) from employee portal
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_review_date DATE,
  last_review_date DATE,
  performance_score NUMERIC(3, 1) CHECK (performance_score >= 0 AND performance_score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Performance Reviews table
CREATE TABLE IF NOT EXISTS hr_performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  review_period TEXT NOT NULL, -- e.g., "Q4 2024", "Annual 2024"
  review_type TEXT NOT NULL DEFAULT 'quarterly' CHECK (review_type IN ('quarterly', 'annual', 'probation', 'promotion')),
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  collaboration INTEGER NOT NULL CHECK (collaboration >= 1 AND collaboration <= 5),
  accountability INTEGER NOT NULL CHECK (accountability >= 1 AND accountability <= 5),
  trustworthy INTEGER NOT NULL CHECK (trustworthy >= 1 AND trustworthy <= 5),
  leadership INTEGER NOT NULL CHECK (leadership >= 1 AND leadership <= 5),
  strengths TEXT,
  improvements TEXT,
  goals TEXT,
  reviewer_id UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  status TEXT NOT NULL DEFAULT 'on-time' CHECK (status IN ('on-time', 'overdue', 'upcoming')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Employee Goals table
CREATE TABLE IF NOT EXISTS hr_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  category TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'On Track' CHECK (status IN ('On Track', 'Behind', 'Complete', 'Cancelled')),
  due_date DATE NOT NULL,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Goal Comments table
CREATE TABLE IF NOT EXISTS hr_goal_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES hr_goals(id) ON DELETE CASCADE,
  author_id UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'general' CHECK (comment_type IN ('general', 'feedback', 'milestone', 'concern')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 360 Feedback table
CREATE TABLE IF NOT EXISTS hr_360_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  self_rating NUMERIC(3, 2),
  manager_rating NUMERIC(3, 2),
  peer_rating NUMERIC(3, 2),
  direct_report_rating NUMERIC(3, 2),
  overall_score NUMERIC(3, 2),
  feedback_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'complete')),
  period TEXT NOT NULL, -- e.g., "Q4 2024"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Mentorships table
CREATE TABLE IF NOT EXISTS hr_mentorships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  focus TEXT NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CHECK (mentor_id != mentee_id)
);

-- Recognitions table
CREATE TABLE IF NOT EXISTS hr_recognitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_id UUID REFERENCES hr_employees(id) ON DELETE SET NULL,
  from_name TEXT NOT NULL,
  to_id UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  to_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Peer Recognition', 'Manager Recognition')),
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  recognition_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Learning Paths table
CREATE TABLE IF NOT EXISTS hr_learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  course TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'not-started')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Career Paths table
CREATE TABLE IF NOT EXISTS hr_career_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  current_role_name TEXT NOT NULL,
  next_role TEXT NOT NULL,
  time_to_promotion TEXT NOT NULL,
  readiness INTEGER NOT NULL CHECK (readiness >= 0 AND readiness <= 100),
  required_skills TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hr_employees_department ON hr_employees(department);
CREATE INDEX IF NOT EXISTS idx_hr_employees_status ON hr_employees(status);
CREATE INDEX IF NOT EXISTS idx_hr_employees_manager_id ON hr_employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_hr_performance_reviews_employee_id ON hr_performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_performance_reviews_review_date ON hr_performance_reviews(review_date);
CREATE INDEX IF NOT EXISTS idx_hr_goals_employee_id ON hr_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_goals_status ON hr_goals(status);
CREATE INDEX IF NOT EXISTS idx_hr_goals_due_date ON hr_goals(due_date);
CREATE INDEX IF NOT EXISTS idx_hr_goal_comments_goal_id ON hr_goal_comments(goal_id);
CREATE INDEX IF NOT EXISTS idx_hr_360_feedback_employee_id ON hr_360_feedback(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_mentorships_mentor_id ON hr_mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_hr_mentorships_mentee_id ON hr_mentorships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_hr_recognitions_to_id ON hr_recognitions(to_id);
CREATE INDEX IF NOT EXISTS idx_hr_learning_paths_employee_id ON hr_learning_paths(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_career_paths_employee_id ON hr_career_paths(employee_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hr_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_hr_employees_updated_at
  BEFORE UPDATE ON hr_employees
  FOR EACH ROW
  EXECUTE FUNCTION update_hr_updated_at_column();

CREATE TRIGGER update_hr_performance_reviews_updated_at
  BEFORE UPDATE ON hr_performance_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_hr_updated_at_column();

CREATE TRIGGER update_hr_goals_updated_at
  BEFORE UPDATE ON hr_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_hr_updated_at_column();

CREATE TRIGGER update_hr_360_feedback_updated_at
  BEFORE UPDATE ON hr_360_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_hr_updated_at_column();

CREATE TRIGGER update_hr_mentorships_updated_at
  BEFORE UPDATE ON hr_mentorships
  FOR EACH ROW
  EXECUTE FUNCTION update_hr_updated_at_column();

CREATE TRIGGER update_hr_learning_paths_updated_at
  BEFORE UPDATE ON hr_learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_hr_updated_at_column();

CREATE TRIGGER update_hr_career_paths_updated_at
  BEFORE UPDATE ON hr_career_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_hr_updated_at_column();

-- Function to automatically update employee's last_review_date and next_review_date
CREATE OR REPLACE FUNCTION update_employee_review_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.review_date != NEW.review_date) THEN
    -- Update employee's last_review_date
    UPDATE hr_employees
    SET last_review_date = NEW.review_date
    WHERE id = NEW.employee_id;
    
    -- Calculate next review date (3 months from review date for quarterly, 12 months for annual)
    UPDATE hr_employees
    SET next_review_date = CASE
      WHEN NEW.review_type = 'annual' THEN NEW.review_date + INTERVAL '12 months'
      ELSE NEW.review_date + INTERVAL '3 months'
    END
    WHERE id = NEW.employee_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update employee review dates
CREATE TRIGGER update_employee_review_dates_trigger
  AFTER INSERT OR UPDATE OF review_date ON hr_performance_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_review_dates();

-- Function to automatically update goal status based on progress
CREATE OR REPLACE FUNCTION update_goal_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.progress = 100 THEN
    NEW.status := 'Complete';
  ELSIF NEW.progress >= 70 THEN
    NEW.status := 'On Track';
  ELSE
    NEW.status := 'Behind';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update goal status
CREATE TRIGGER update_goal_status_trigger
  BEFORE INSERT OR UPDATE OF progress ON hr_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_status();

-- Enable Row Level Security (RLS)
ALTER TABLE hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_goal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_360_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_recognitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_career_paths ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (customize these for production)
CREATE POLICY "Enable all operations for all users" ON hr_employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON hr_performance_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON hr_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON hr_goal_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON hr_360_feedback FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON hr_mentorships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON hr_recognitions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON hr_learning_paths FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON hr_career_paths FOR ALL USING (true) WITH CHECK (true);

