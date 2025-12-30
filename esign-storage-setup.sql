-- E-Signature Storage Setup Instructions
-- Execute these in Supabase Dashboard > Storage

-- 1. Create storage buckets
-- Go to Storage in Supabase Dashboard and create these buckets:

-- Bucket: esign-documents
-- Settings: Private, File size limit: 10MB

-- Bucket: esign-signatures  
-- Settings: Private, File size limit: 1MB

-- 2. Set up storage policies

-- For esign-documents bucket:

-- Policy: "Users can view documents they created or are invited to sign"
-- Operation: SELECT
-- Policy definition:
CREATE POLICY "Users can view esign documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'esign-documents' AND
  (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM esign_documents 
      WHERE creator_id = auth.uid()
    )
    OR
    (storage.foldername(name))[1] IN (
      SELECT document_id::text FROM esign_signers 
      WHERE user_email = auth.jwt()->>'email'
    )
  )
);

-- Policy: "Authenticated users can upload documents"
-- Operation: INSERT
CREATE POLICY "Authenticated users can upload esign documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'esign-documents' AND
  auth.role() = 'authenticated'
);

-- Policy: "Document creators can update their documents"
-- Operation: UPDATE
CREATE POLICY "Document creators can update esign documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'esign-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM esign_documents 
    WHERE creator_id = auth.uid()
  )
);

-- Policy: "Document creators can delete their documents"
-- Operation: DELETE
CREATE POLICY "Document creators can delete esign documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'esign-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM esign_documents 
    WHERE creator_id = auth.uid()
  )
);

-- For esign-signatures bucket:

-- Policy: "Users can view their own signatures"
-- Operation: SELECT
CREATE POLICY "Users can view their signatures"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'esign-signatures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: "Users can upload their own signatures"
-- Operation: INSERT
CREATE POLICY "Users can upload signatures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'esign-signatures' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  auth.role() = 'authenticated'
);

-- Policy: "Users can update their own signatures"
-- Operation: UPDATE
CREATE POLICY "Users can update their signatures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'esign-signatures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: "Users can delete their own signatures"
-- Operation: DELETE
CREATE POLICY "Users can delete their signatures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'esign-signatures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);





