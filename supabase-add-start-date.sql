-- Migration: Add start_date column to tasks table
-- Run this in your Supabase SQL Editor

-- Add start_date column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE;

-- Update existing tasks with estimated start dates based on deadline
-- For tasks without a start date, set it to 7-14 days before the deadline
UPDATE tasks 
SET start_date = deadline - INTERVAL '10 days'
WHERE start_date IS NULL AND deadline IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN tasks.start_date IS 'The start date of the task for Gantt chart visualization';





