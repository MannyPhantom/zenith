-- Migration: Add photo_url field to hr_employees table
-- This allows storing JPEG image URLs from the employee portal for managers

-- Add photo_url column to hr_employees table
ALTER TABLE hr_employees 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add comment to document the field
COMMENT ON COLUMN hr_employees.photo_url IS 'URL to employee photo (JPEG) from employee portal';

-- Create index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_hr_employees_photo_url ON hr_employees(photo_url) WHERE photo_url IS NOT NULL;







