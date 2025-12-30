-- ============================================
-- INVENTORY MODULE SCHEMA FOR SUPABASE
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create all inventory tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SUPPLIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  lead_time INTEGER DEFAULT 0, -- in days
  total_orders INTEGER DEFAULT 0,
  on_time_delivery INTEGER DEFAULT 0 CHECK (on_time_delivery >= 0 AND on_time_delivery <= 100),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVENTORY ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  location TEXT,
  on_hand_qty INTEGER DEFAULT 0,
  min_qty INTEGER DEFAULT 0,
  reorder_qty INTEGER DEFAULT 0,
  unit_cost DECIMAL(10, 2) DEFAULT 0,
  total_value DECIMAL(12, 2) GENERATED ALWAYS AS (on_hand_qty * unit_cost) STORED,
  allocated INTEGER DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT, -- Denormalized for quick access
  status TEXT DEFAULT 'in-stock' CHECK (status IN ('in-stock', 'low-stock', 'out-of-stock')),
  barcode TEXT,
  image_url TEXT,
  category TEXT,
  description TEXT,
  last_movement_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast SKU/barcode lookups
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);

-- ============================================
-- PURCHASE ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  supplier_name TEXT NOT NULL, -- Denormalized for quick access
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'pending', 'received', 'cancelled')),
  total DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  expected_date TIMESTAMPTZ,
  received_date TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast PO number lookups
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);

-- ============================================
-- PO LINE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS po_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  received_qty INTEGER DEFAULT 0,
  unit_cost DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast PO lookups
CREATE INDEX IF NOT EXISTS idx_po_line_items_po_id ON po_line_items(po_id);
CREATE INDEX IF NOT EXISTS idx_po_line_items_item_id ON po_line_items(item_id);

-- ============================================
-- INVENTORY MOVEMENTS TABLE (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_date TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT NOT NULL,
  change_qty INTEGER NOT NULL, -- Positive for in, negative for out
  reference TEXT,
  user_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast item lookups
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(movement_date);

-- ============================================
-- INVENTORY TRANSACTIONS TABLE (Scan-in/Check-out)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('scan-in', 'check-out')),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  user_name TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Function to auto-update inventory item status based on quantity
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.on_hand_qty <= 0 THEN
    NEW.status := 'out-of-stock';
  ELSIF NEW.on_hand_qty <= NEW.min_qty THEN
    NEW.status := 'low-stock';
  ELSE
    NEW.status := 'in-stock';
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating status
DROP TRIGGER IF EXISTS trigger_update_inventory_status ON inventory_items;
CREATE TRIGGER trigger_update_inventory_status
  BEFORE UPDATE OF on_hand_qty, min_qty ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_status();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS trigger_suppliers_updated_at ON suppliers;
CREATE TRIGGER trigger_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER trigger_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER trigger_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_po_line_items_updated_at ON po_line_items;
CREATE TRIGGER trigger_po_line_items_updated_at
  BEFORE UPDATE ON po_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update PO total when line items change
CREATE OR REPLACE FUNCTION update_po_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE purchase_orders
  SET total = (
    SELECT COALESCE(SUM(quantity * unit_cost), 0)
    FROM po_line_items
    WHERE po_id = COALESCE(NEW.po_id, OLD.po_id)
  )
  WHERE id = COALESCE(NEW.po_id, OLD.po_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating PO total
DROP TRIGGER IF EXISTS trigger_update_po_total ON po_line_items;
CREATE TRIGGER trigger_update_po_total
  AFTER INSERT OR UPDATE OR DELETE ON po_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_po_total();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (allow all operations for now)
-- You can customize these based on your organization's needs

-- Suppliers policies
CREATE POLICY "Allow all operations on suppliers for authenticated users" ON suppliers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access on suppliers for anon users" ON suppliers
  FOR SELECT TO anon USING (true);

-- Inventory items policies
CREATE POLICY "Allow all operations on inventory_items for authenticated users" ON inventory_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access on inventory_items for anon users" ON inventory_items
  FOR SELECT TO anon USING (true);

-- Purchase orders policies
CREATE POLICY "Allow all operations on purchase_orders for authenticated users" ON purchase_orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access on purchase_orders for anon users" ON purchase_orders
  FOR SELECT TO anon USING (true);

-- PO line items policies
CREATE POLICY "Allow all operations on po_line_items for authenticated users" ON po_line_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access on po_line_items for anon users" ON po_line_items
  FOR SELECT TO anon USING (true);

-- Inventory movements policies
CREATE POLICY "Allow all operations on inventory_movements for authenticated users" ON inventory_movements
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access on inventory_movements for anon users" ON inventory_movements
  FOR SELECT TO anon USING (true);

-- Inventory transactions policies
CREATE POLICY "Allow all operations on inventory_transactions for authenticated users" ON inventory_transactions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow read access on inventory_transactions for anon users" ON inventory_transactions
  FOR SELECT TO anon USING (true);

-- ============================================
-- HELPER FUNCTION FOR GENERATING PO NUMBERS
-- ============================================
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
  po_num TEXT;
BEGIN
  year_str := to_char(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN po_number ~ ('^PO-' || year_str || '-[0-9]+$')
      THEN CAST(SUBSTRING(po_number FROM '[0-9]+$') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO seq_num
  FROM purchase_orders;
  
  po_num := 'PO-' || year_str || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN po_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment below to insert sample data

/*
-- Insert sample suppliers
INSERT INTO suppliers (name, contact_name, email, phone, address, performance_score, lead_time, total_orders, on_time_delivery)
VALUES
  ('Tech Supplies Inc', 'Michael Johnson', 'michael@techsupplies.com', '(555) 123-4567', '123 Tech Street, Silicon Valley, CA 94025', 95, 7, 45, 98),
  ('Cable World', 'Sarah Williams', 'sarah@cableworld.com', '(555) 234-5678', '456 Cable Ave, New York, NY 10001', 88, 5, 32, 94),
  ('Office Depot', 'David Brown', 'david@officedepot.com', '(555) 345-6789', '789 Office Blvd, Chicago, IL 60601', 92, 10, 28, 96),
  ('Display Solutions', 'Emily Davis', 'emily@displaysolutions.com', '(555) 456-7890', '321 Display Road, Austin, TX 78701', 90, 14, 18, 92);

-- Insert sample inventory items
INSERT INTO inventory_items (sku, product_name, location, on_hand_qty, min_qty, reorder_qty, unit_cost, supplier_name, barcode, category)
VALUES
  ('SKU-001', 'Wireless Mouse', 'A-01-01', 150, 50, 100, 25.99, 'Tech Supplies Inc', '123456789012', 'Electronics'),
  ('SKU-002', 'USB-C Cable', 'A-01-02', 8, 20, 50, 12.50, 'Cable World', '123456789013', 'Accessories'),
  ('SKU-003', 'Laptop Stand', 'B-02-01', 0, 10, 25, 45.00, 'Office Depot', '123456789014', 'Furniture'),
  ('SKU-004', 'Mechanical Keyboard', 'A-01-03', 75, 30, 50, 89.99, 'Tech Supplies Inc', '123456789015', 'Electronics'),
  ('SKU-005', 'Monitor 27 inch', 'B-02-02', 15, 15, 20, 299.99, 'Display Solutions', '123456789016', 'Electronics');
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the schema was created correctly:
-- SELECT * FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'inventory%' OR table_name IN ('suppliers', 'purchase_orders', 'po_line_items');









