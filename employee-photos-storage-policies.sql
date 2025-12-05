-- Employee Photos Storage Policies
-- Run these ONE AT A TIME in Supabase SQL Editor
-- Or better yet, use the Dashboard: Storage → employee-photos → Policies

-- Policy 1: Allow public read access
CREATE POLICY "Allow public read access to employee photos" 
ON storage.objects 
FOR SELECT 
TO public
USING (bucket_id = 'employee-photos');

-- Policy 2: Allow public upload
CREATE POLICY "Allow public upload employee photos" 
ON storage.objects 
FOR INSERT 
TO public
WITH CHECK (bucket_id = 'employee-photos');

-- Policy 3: Allow public delete
CREATE POLICY "Allow public delete employee photos" 
ON storage.objects 
FOR DELETE 
TO public
USING (bucket_id = 'employee-photos');







