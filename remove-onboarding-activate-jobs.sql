-- SQL Migration: Remove Onboarding Status & Activate All Jobs
-- Run this in Supabase SQL Editor

-- 1. Update all employees with 'Onboarding' status to 'Active'
UPDATE hr_employees 
SET status = 'Active' 
WHERE status = 'Onboarding';

-- 2. Set all job postings to is_active = true
UPDATE job_postings 
SET is_active = true;

-- 3. (Optional) Update the status constraint if it exists
-- This removes 'Onboarding' as a valid option
-- Comment out if you want to keep the flexibility
/*
ALTER TABLE hr_employees 
DROP CONSTRAINT IF EXISTS hr_employees_status_check;

ALTER TABLE hr_employees 
ADD CONSTRAINT hr_employees_status_check 
CHECK (status IN ('Active', 'Inactive'));
*/

-- Verify the changes
SELECT 'Employees updated:' as message, status, COUNT(*) as count 
FROM hr_employees 
GROUP BY status;

SELECT 'Job postings activated:' as message, COUNT(*) as count 
FROM job_postings 
WHERE is_active = true;

