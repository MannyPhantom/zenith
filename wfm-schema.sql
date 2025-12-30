-- ============================================
-- WORKFORCE MANAGEMENT (WFM) SCHEMA
-- ============================================
-- Tables for managing technicians, jobs, schedules, and timesheets

-- ============================================
-- TECHNICIANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wfm_technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'technician' CHECK (role IN ('technician', 'lead', 'supervisor')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave')),
  skills TEXT[], -- Array of skills/certifications
  hourly_rate DECIMAL(10, 2),
  avatar_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOBS/WORK ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wfm_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  location TEXT,
  location_address TEXT,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in-progress', 'completed', 'on-hold', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  technician_id UUID REFERENCES wfm_technicians(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  estimated_hours DECIMAL(5, 2),
  actual_hours DECIMAL(5, 2),
  notes TEXT,
  completion_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wfm_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES wfm_technicians(id) ON DELETE CASCADE,
  job_id UUID REFERENCES wfm_jobs(id) ON DELETE SET NULL,
  schedule_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TIMESHEETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wfm_timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID REFERENCES wfm_technicians(id) ON DELETE CASCADE,
  job_id UUID REFERENCES wfm_jobs(id) ON DELETE SET NULL,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  break_duration INTEGER DEFAULT 0, -- in minutes
  total_hours DECIMAL(5, 2),
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOB NOTES/COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wfm_job_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES wfm_jobs(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES wfm_technicians(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_wfm_technicians_status ON wfm_technicians(status);
CREATE INDEX IF NOT EXISTS idx_wfm_technicians_is_active ON wfm_technicians(is_active);

CREATE INDEX IF NOT EXISTS idx_wfm_jobs_status ON wfm_jobs(status);
CREATE INDEX IF NOT EXISTS idx_wfm_jobs_technician ON wfm_jobs(technician_id);
CREATE INDEX IF NOT EXISTS idx_wfm_jobs_start_date ON wfm_jobs(start_date);
CREATE INDEX IF NOT EXISTS idx_wfm_jobs_is_active ON wfm_jobs(is_active);

CREATE INDEX IF NOT EXISTS idx_wfm_schedules_technician ON wfm_schedules(technician_id);
CREATE INDEX IF NOT EXISTS idx_wfm_schedules_job ON wfm_schedules(job_id);
CREATE INDEX IF NOT EXISTS idx_wfm_schedules_date ON wfm_schedules(schedule_date);

CREATE INDEX IF NOT EXISTS idx_wfm_timesheets_technician ON wfm_timesheets(technician_id);
CREATE INDEX IF NOT EXISTS idx_wfm_timesheets_job ON wfm_timesheets(job_id);
CREATE INDEX IF NOT EXISTS idx_wfm_timesheets_clock_in ON wfm_timesheets(clock_in);

CREATE INDEX IF NOT EXISTS idx_wfm_job_notes_job ON wfm_job_notes(job_id);

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_wfm_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS trigger_wfm_technicians_updated_at ON wfm_technicians;
CREATE TRIGGER trigger_wfm_technicians_updated_at
  BEFORE UPDATE ON wfm_technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_wfm_updated_at_column();

DROP TRIGGER IF EXISTS trigger_wfm_jobs_updated_at ON wfm_jobs;
CREATE TRIGGER trigger_wfm_jobs_updated_at
  BEFORE UPDATE ON wfm_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_wfm_updated_at_column();

DROP TRIGGER IF EXISTS trigger_wfm_schedules_updated_at ON wfm_schedules;
CREATE TRIGGER trigger_wfm_schedules_updated_at
  BEFORE UPDATE ON wfm_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_wfm_updated_at_column();

DROP TRIGGER IF EXISTS trigger_wfm_timesheets_updated_at ON wfm_timesheets;
CREATE TRIGGER trigger_wfm_timesheets_updated_at
  BEFORE UPDATE ON wfm_timesheets
  FOR EACH ROW
  EXECUTE FUNCTION update_wfm_updated_at_column();

-- Function to calculate total hours in timesheet
CREATE OR REPLACE FUNCTION calculate_timesheet_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_out IS NOT NULL THEN
    NEW.total_hours := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600 
                      - (COALESCE(NEW.break_duration, 0) / 60.0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate timesheet hours
DROP TRIGGER IF EXISTS trigger_calculate_timesheet_hours ON wfm_timesheets;
CREATE TRIGGER trigger_calculate_timesheet_hours
  BEFORE INSERT OR UPDATE OF clock_in, clock_out, break_duration ON wfm_timesheets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_timesheet_hours();

-- Function to generate job numbers
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  job_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 2) AS INTEGER)), 0) + 1
  INTO next_num
  FROM wfm_jobs
  WHERE job_number ~ '^#[0-9]+$';
  
  job_num := '#' || LPAD(next_num::TEXT, 3, '0');
  RETURN job_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE wfm_technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE wfm_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wfm_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE wfm_timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wfm_job_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust based on your auth setup)
-- For now, allowing all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON wfm_technicians
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON wfm_jobs
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON wfm_schedules
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON wfm_timesheets
  FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON wfm_job_notes
  FOR ALL USING (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Insert sample technicians
INSERT INTO wfm_technicians (name, email, phone, role, status, skills, hourly_rate) VALUES
  ('John Smith', 'john.smith@example.com', '(555) 123-4567', 'technician', 'active', ARRAY['HVAC', 'Electrical'], 45.00),
  ('Sarah Johnson', 'sarah.johnson@example.com', '(555) 234-5678', 'lead', 'active', ARRAY['Plumbing', 'General Maintenance'], 50.00),
  ('Mike Davis', 'mike.davis@example.com', '(555) 345-6789', 'technician', 'active', ARRAY['Electrical', 'Network'], 42.00),
  ('Emily Wilson', 'emily.wilson@example.com', '(555) 456-7890', 'supervisor', 'active', ARRAY['All Systems', 'Management'], 60.00)
ON CONFLICT (email) DO NOTHING;

-- Insert sample jobs (using the first technician's ID)
INSERT INTO wfm_jobs (
  job_number, title, description, customer_name, customer_phone, 
  location, status, priority, technician_id, start_date, end_date, estimated_hours
)
SELECT 
  generate_job_number(),
  'Office HVAC Maintenance',
  'Routine maintenance check on office HVAC system',
  'Acme Corp',
  '(555) 111-2222',
  'Downtown Office Building',
  'assigned',
  'medium',
  (SELECT id FROM wfm_technicians WHERE email = 'john.smith@example.com' LIMIT 1),
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '4 hours',
  4.0
WHERE NOT EXISTS (SELECT 1 FROM wfm_jobs WHERE title = 'Office HVAC Maintenance');

INSERT INTO wfm_jobs (
  job_number, title, description, customer_name, customer_phone,
  location, status, priority, technician_id, start_date, end_date, estimated_hours
)
SELECT
  generate_job_number(),
  'Electrical Panel Inspection',
  'Annual safety inspection of electrical panels',
  'Tech Industries',
  '(555) 222-3333',
  'Industrial Park Unit 5',
  'in-progress',
  'high',
  (SELECT id FROM wfm_technicians WHERE email = 'mike.davis@example.com' LIMIT 1),
  NOW(),
  NOW() + INTERVAL '3 hours',
  3.0
WHERE NOT EXISTS (SELECT 1 FROM wfm_jobs WHERE title = 'Electrical Panel Inspection');






