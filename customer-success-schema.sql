-- Customer Success Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CSM Users table (Customer Success Managers)
CREATE TABLE IF NOT EXISTS csm_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Clients table
CREATE TABLE IF NOT EXISTS cs_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  health_score INTEGER NOT NULL DEFAULT 75 CHECK (health_score >= 0 AND health_score <= 100),
  status TEXT NOT NULL DEFAULT 'moderate' CHECK (status IN ('healthy', 'moderate', 'at-risk')),
  last_contact_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  churn_risk INTEGER NOT NULL DEFAULT 25 CHECK (churn_risk >= 0 AND churn_risk <= 100),
  churn_trend TEXT NOT NULL DEFAULT 'stable' CHECK (churn_trend IN ('up', 'down', 'stable')),
  nps_score INTEGER NOT NULL DEFAULT 7 CHECK (nps_score >= 0 AND nps_score <= 10),
  arr INTEGER NOT NULL DEFAULT 100000, -- Annual Recurring Revenue
  renewal_date DATE NOT NULL,
  csm_id UUID REFERENCES csm_users(id) ON DELETE SET NULL,
  engagement_score INTEGER NOT NULL DEFAULT 50 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  portal_logins INTEGER NOT NULL DEFAULT 0,
  feature_usage TEXT NOT NULL DEFAULT 'Medium',
  support_tickets INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Health Score History (for trend tracking)
CREATE TABLE IF NOT EXISTS cs_health_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES cs_clients(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Client Tasks
CREATE TABLE IF NOT EXISTS cs_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES cs_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES csm_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Client Milestones
CREATE TABLE IF NOT EXISTS cs_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES cs_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('completed', 'in-progress', 'upcoming')),
  target_date DATE NOT NULL,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Client Interactions (communication history)
CREATE TABLE IF NOT EXISTS cs_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES cs_clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'call', 'meeting')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  csm_id UUID REFERENCES csm_users(id) ON DELETE SET NULL,
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cs_clients_status ON cs_clients(status);
CREATE INDEX IF NOT EXISTS idx_cs_clients_csm_id ON cs_clients(csm_id);
CREATE INDEX IF NOT EXISTS idx_cs_clients_renewal_date ON cs_clients(renewal_date);
CREATE INDEX IF NOT EXISTS idx_cs_tasks_client_id ON cs_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_cs_tasks_status ON cs_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cs_tasks_due_date ON cs_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_cs_milestones_client_id ON cs_milestones(client_id);
CREATE INDEX IF NOT EXISTS idx_cs_milestones_status ON cs_milestones(status);
CREATE INDEX IF NOT EXISTS idx_cs_interactions_client_id ON cs_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_cs_interactions_date ON cs_interactions(interaction_date);
CREATE INDEX IF NOT EXISTS idx_cs_health_history_client_id ON cs_health_history(client_id);
CREATE INDEX IF NOT EXISTS idx_cs_health_history_recorded_at ON cs_health_history(recorded_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_csm_users_updated_at
  BEFORE UPDATE ON csm_users
  FOR EACH ROW
  EXECUTE FUNCTION update_cs_updated_at_column();

CREATE TRIGGER update_cs_clients_updated_at
  BEFORE UPDATE ON cs_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_cs_updated_at_column();

CREATE TRIGGER update_cs_tasks_updated_at
  BEFORE UPDATE ON cs_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_cs_updated_at_column();

CREATE TRIGGER update_cs_milestones_updated_at
  BEFORE UPDATE ON cs_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_cs_updated_at_column();

-- Function to automatically track health score history
CREATE OR REPLACE FUNCTION track_health_score_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if health_score actually changed
  IF (TG_OP = 'UPDATE' AND OLD.health_score != NEW.health_score) OR TG_OP = 'INSERT' THEN
    INSERT INTO cs_health_history (client_id, health_score)
    VALUES (NEW.id, NEW.health_score);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to track health score changes
CREATE TRIGGER track_client_health_score
  AFTER INSERT OR UPDATE ON cs_clients
  FOR EACH ROW
  EXECUTE FUNCTION track_health_score_change();

-- Function to automatically update client status based on health score
CREATE OR REPLACE FUNCTION update_client_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.health_score >= 80 THEN
    NEW.status := 'healthy';
  ELSIF NEW.health_score >= 50 THEN
    NEW.status := 'moderate';
  ELSE
    NEW.status := 'at-risk';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update status when health score changes
CREATE TRIGGER auto_update_client_status
  BEFORE INSERT OR UPDATE OF health_score ON cs_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_client_status();

-- Enable Row Level Security (RLS)
ALTER TABLE csm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_health_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (customize these for production)
CREATE POLICY "Enable all operations for all users" ON csm_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON cs_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON cs_health_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON cs_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON cs_milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON cs_interactions FOR ALL USING (true) WITH CHECK (true);

-- Sample CSM users
INSERT INTO csm_users (name, email, avatar) VALUES
  ('Sarah Johnson', 'sarah.johnson@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
  ('Michael Chen', 'michael.chen@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'),
  ('Emily Rodriguez', 'emily.rodriguez@company.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily')
ON CONFLICT (email) DO NOTHING;







