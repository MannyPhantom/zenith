-- Supabase Storage Setup for Project Files
-- Run this in your Supabase SQL Editor

-- Add file_url column to project_files table (stores the Supabase Storage path)
ALTER TABLE project_files 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Create a storage bucket for project files
-- Note: This needs to be done via the Supabase dashboard or using the storage API
-- Go to: Storage > Create bucket > Name: "project-files" > Public: false

-- Create a policy for the project-files bucket
-- This allows authenticated and anonymous users to upload/download files
-- You can customize this based on your authentication requirements

-- For now, we'll use RLS policies that match our existing setup
-- The bucket policies should be configured in the Supabase dashboard:
-- 1. Go to Storage > project-files > Policies
-- 2. Add the following policies:

-- Policy for SELECT (download files)
-- CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'project-files');

-- Policy for INSERT (upload files)
-- CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files');

-- Policy for DELETE (remove files)
-- CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE USING (bucket_id = 'project-files');

-- Update existing file records to have a placeholder URL if needed
-- UPDATE project_files SET file_url = '' WHERE file_url IS NULL;









