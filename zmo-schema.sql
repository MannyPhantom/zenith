-- ============================================
-- Z-MO (Manufacturing Operations) SCHEMA
-- ============================================
-- Database schema for Manufacturing Operations module
-- Supports machines, work orders, quality inspections, maintenance, and OEE tracking

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MACHINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS zmo_machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id TEXT NOT NULL UNIQUE, -- e.g., "CNC-01", "Press-01"
  status TEXT NOT NULL DEFAULT 'IDLE' CHECK (status IN ('RUN', 'IDLE', 'DOWN', 'MAINTENANCE')),
  cell TEXT NOT NULL, -- Manufacturing cell (e.g., "Cell-A", "Cell-B")
  machine_type TEXT NOT NULL, -- e.g., "CNC Machine", "Hydraulic Press"
  good_parts INTEGER NOT NULL DEFAULT 0,
  scrap INTEGER NOT NULL DEFAULT 0,
  oee DECIMAL(5, 2) DEFAULT 0 CHECK (oee >= 0 AND oee <= 100), -- Overall Equipment Effectiveness %
  availability DECIMAL(5, 2) DEFAULT 0 CHECK (availability >= 0 AND availability <= 100),
  performance DECIMAL(5, 2) DEFAULT 0 CHECK (performance >= 0 AND performance <= 100),
  quality DECIMAL(5, 2) DEFAULT 0 CHECK (quality >= 0 AND quality <= 100),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORK ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS zmo_work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id TEXT NOT NULL UNIQUE, -- e.g., "WO-1234"
  sku TEXT NOT NULL, -- Part number/SKU
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  completed INTEGER NOT NULL DEFAULT 0 CHECK (completed >= 0),
  status TEXT NOT NULL DEFAULT 'Queued' CHECK (status IN ('Queued', 'In Progress', 'Completed', 'On Hold', 'Cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  assigned_machine_id UUID REFERENCES zmo_machines(id) ON DELETE SET NULL,
  assigned_machine_name TEXT, -- Denormalized for quick access
  eta TEXT, -- Estimated time to completion (e.g., "2h 15m")
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT completed_not_exceed_quantity CHECK (completed <= quantity)
);

-- ============================================
-- QUALITY INSPECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS zmo_quality_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id TEXT NOT NULL UNIQUE, -- e.g., "QI-001"
  part_number TEXT NOT NULL, -- Part number being inspected
  inspection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inspector TEXT NOT NULL, -- Inspector name
  result TEXT NOT NULL CHECK (result IN ('Pass', 'Fail')),
  defects INTEGER NOT NULL DEFAULT 0 CHECK (defects >= 0),
  sample_size INTEGER NOT NULL DEFAULT 50 CHECK (sample_size > 0),
  pass_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN sample_size > 0 THEN ((sample_size - defects)::DECIMAL / sample_size * 100)
      ELSE 0
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MAINTENANCE TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS zmo_maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT NOT NULL UNIQUE, -- e.g., "MT-001"
  machine_id UUID NOT NULL REFERENCES zmo_machines(id) ON DELETE CASCADE,
  machine_name TEXT NOT NULL, -- Denormalized for quick access
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('Preventive', 'Corrective', 'Emergency')),
  description TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
  technician TEXT,
  estimated_hours DECIMAL(5, 2) DEFAULT 0,
  actual_hours DECIMAL(5, 2),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOWNTIME EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS zmo_downtime_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID NOT NULL REFERENCES zmo_machines(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- e.g., "Equipment Failure", "Setup/Changeover"
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER / 60
      ELSE NULL
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MACHINE OEE METRICS TABLE (Historical tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS zmo_oee_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID NOT NULL REFERENCES zmo_machines(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  oee DECIMAL(5, 2) NOT NULL CHECK (oee >= 0 AND oee <= 100),
  availability DECIMAL(5, 2) NOT NULL CHECK (availability >= 0 AND availability <= 100),
  performance DECIMAL(5, 2) NOT NULL CHECK (performance >= 0 AND performance <= 100),
  quality DECIMAL(5, 2) NOT NULL CHECK (quality >= 0 AND quality <= 100),
  good_parts INTEGER NOT NULL DEFAULT 0,
  scrap INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(machine_id, metric_date)
);

-- ============================================
-- INDEXES for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_zmo_machines_status ON zmo_machines(status);
CREATE INDEX IF NOT EXISTS idx_zmo_machines_cell ON zmo_machines(cell);
CREATE INDEX IF NOT EXISTS idx_zmo_machines_machine_id ON zmo_machines(machine_id);

CREATE INDEX IF NOT EXISTS idx_zmo_work_orders_status ON zmo_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_zmo_work_orders_priority ON zmo_work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_zmo_work_orders_due_date ON zmo_work_orders(due_date);
CREATE INDEX IF NOT EXISTS idx_zmo_work_orders_machine ON zmo_work_orders(assigned_machine_id);
CREATE INDEX IF NOT EXISTS idx_zmo_work_orders_work_order_id ON zmo_work_orders(work_order_id);

CREATE INDEX IF NOT EXISTS idx_zmo_quality_inspections_part_number ON zmo_quality_inspections(part_number);
CREATE INDEX IF NOT EXISTS idx_zmo_quality_inspections_date ON zmo_quality_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_zmo_quality_inspections_result ON zmo_quality_inspections(result);
CREATE INDEX IF NOT EXISTS idx_zmo_quality_inspections_inspection_id ON zmo_quality_inspections(inspection_id);

CREATE INDEX IF NOT EXISTS idx_zmo_maintenance_tasks_machine ON zmo_maintenance_tasks(machine_id);
CREATE INDEX IF NOT EXISTS idx_zmo_maintenance_tasks_status ON zmo_maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_zmo_maintenance_tasks_scheduled_date ON zmo_maintenance_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_zmo_maintenance_tasks_task_id ON zmo_maintenance_tasks(task_id);

CREATE INDEX IF NOT EXISTS idx_zmo_downtime_events_machine ON zmo_downtime_events(machine_id);
CREATE INDEX IF NOT EXISTS idx_zmo_downtime_events_start_time ON zmo_downtime_events(start_time);
CREATE INDEX IF NOT EXISTS idx_zmo_downtime_events_reason ON zmo_downtime_events(reason);

CREATE INDEX IF NOT EXISTS idx_zmo_oee_metrics_machine ON zmo_oee_metrics(machine_id);
CREATE INDEX IF NOT EXISTS idx_zmo_oee_metrics_date ON zmo_oee_metrics(metric_date);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_zmo_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate OEE from availability, performance, and quality
CREATE OR REPLACE FUNCTION calculate_oee(
  p_availability DECIMAL,
  p_performance DECIMAL,
  p_quality DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (p_availability * p_performance * p_quality) / 10000;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to auto-update machine OEE when metrics change
CREATE OR REPLACE FUNCTION update_machine_oee()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate OEE from availability, performance, and quality
  NEW.oee = calculate_oee(
    COALESCE(NEW.availability, 0),
    COALESCE(NEW.performance, 0),
    COALESCE(NEW.quality, 0)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update work order status based on completion
CREATE OR REPLACE FUNCTION update_work_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update status based on completion
  IF NEW.completed >= NEW.quantity AND NEW.status != 'Completed' THEN
    NEW.status = 'Completed';
  ELSIF NEW.completed > 0 AND NEW.status = 'Queued' THEN
    NEW.status = 'In Progress';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate work order ID
CREATE OR REPLACE FUNCTION generate_work_order_id()
RETURNS TEXT AS $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(work_order_id FROM 'WO-(\d+)') AS INTEGER)), 0) INTO max_num
  FROM zmo_work_orders;
  RETURN 'WO-' || LPAD((max_num + 1)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate inspection ID
CREATE OR REPLACE FUNCTION generate_inspection_id()
RETURNS TEXT AS $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(inspection_id FROM 'QI-(\d+)') AS INTEGER)), 0) INTO max_num
  FROM zmo_quality_inspections;
  RETURN 'QI-' || LPAD((max_num + 1)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate maintenance task ID
CREATE OR REPLACE FUNCTION generate_maintenance_task_id()
RETURNS TEXT AS $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(task_id FROM 'MT-(\d+)') AS INTEGER)), 0) INTO max_num
  FROM zmo_maintenance_tasks;
  RETURN 'MT-' || LPAD((max_num + 1)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers to automatically update updated_at
CREATE TRIGGER update_zmo_machines_updated_at
  BEFORE UPDATE ON zmo_machines
  FOR EACH ROW
  EXECUTE FUNCTION update_zmo_updated_at_column();

CREATE TRIGGER update_zmo_work_orders_updated_at
  BEFORE UPDATE ON zmo_work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_zmo_updated_at_column();

CREATE TRIGGER update_zmo_quality_inspections_updated_at
  BEFORE UPDATE ON zmo_quality_inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_zmo_updated_at_column();

CREATE TRIGGER update_zmo_maintenance_tasks_updated_at
  BEFORE UPDATE ON zmo_maintenance_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_zmo_updated_at_column();

CREATE TRIGGER update_zmo_downtime_events_updated_at
  BEFORE UPDATE ON zmo_downtime_events
  FOR EACH ROW
  EXECUTE FUNCTION update_zmo_updated_at_column();

-- Trigger to auto-calculate OEE when machine metrics change
CREATE TRIGGER calculate_machine_oee_trigger
  BEFORE INSERT OR UPDATE ON zmo_machines
  FOR EACH ROW
  WHEN (NEW.availability IS NOT NULL AND NEW.performance IS NOT NULL AND NEW.quality IS NOT NULL)
  EXECUTE FUNCTION update_machine_oee();

-- Trigger to auto-update work order status
CREATE TRIGGER update_work_order_status_trigger
  BEFORE INSERT OR UPDATE ON zmo_work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_work_order_status();

-- Trigger to update machine name in work orders when machine is updated
CREATE OR REPLACE FUNCTION sync_work_order_machine_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE zmo_work_orders
  SET assigned_machine_name = NEW.machine_id
  WHERE assigned_machine_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_work_order_machine_name_trigger
  AFTER UPDATE OF machine_id ON zmo_machines
  FOR EACH ROW
  EXECUTE FUNCTION sync_work_order_machine_name();

-- Trigger to update machine name in maintenance tasks when machine is updated
CREATE OR REPLACE FUNCTION sync_maintenance_machine_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE zmo_maintenance_tasks
  SET machine_name = NEW.machine_id
  WHERE machine_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_maintenance_machine_name_trigger
  AFTER UPDATE OF machine_id ON zmo_machines
  FOR EACH ROW
  EXECUTE FUNCTION sync_maintenance_machine_name();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE zmo_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE zmo_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE zmo_quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE zmo_maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE zmo_downtime_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE zmo_oee_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (you can customize these later)
CREATE POLICY "Enable all operations for all users on zmo_machines" 
  ON zmo_machines FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users on zmo_work_orders" 
  ON zmo_work_orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users on zmo_quality_inspections" 
  ON zmo_quality_inspections FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users on zmo_maintenance_tasks" 
  ON zmo_maintenance_tasks FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users on zmo_downtime_events" 
  ON zmo_downtime_events FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for all users on zmo_oee_metrics" 
  ON zmo_oee_metrics FOR ALL USING (true) WITH CHECK (true);






