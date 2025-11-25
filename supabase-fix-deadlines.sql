-- Fix deadline columns to be nullable
-- Run this in your Supabase SQL Editor to make deadlines optional

-- Make project deadlines nullable
ALTER TABLE projects 
ALTER COLUMN deadline DROP NOT NULL;

-- Make task deadlines nullable
ALTER TABLE tasks 
ALTER COLUMN deadline DROP NOT NULL;

-- Optional: Clear all existing deadlines if you want a clean slate
-- Uncomment the lines below if you want to clear all deadlines
-- UPDATE projects SET deadline = NULL;
-- UPDATE tasks SET deadline = NULL;





















