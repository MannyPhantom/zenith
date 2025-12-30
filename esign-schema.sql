-- E-Signature Module Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- E-Sign Documents table
CREATE TABLE IF NOT EXISTS esign_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size INTEGER NOT NULL,
  page_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'completed', 'expired', 'cancelled')),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- E-Sign Fields table (signature and date field positions)
CREATE TABLE IF NOT EXISTS esign_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES esign_documents(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL CHECK (field_type IN ('signature', 'date', 'text', 'initial')),
  page_number INTEGER NOT NULL DEFAULT 1,
  x NUMERIC NOT NULL, -- X position (percentage)
  y NUMERIC NOT NULL, -- Y position (percentage)
  width NUMERIC NOT NULL, -- Width (percentage)
  height NUMERIC NOT NULL, -- Height (percentage)
  required BOOLEAN NOT NULL DEFAULT true,
  assigned_to TEXT, -- Email of signer this field is assigned to
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- E-Sign Signatures table (saved signatures for reuse)
CREATE TABLE IF NOT EXISTS esign_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signature_data TEXT NOT NULL, -- Base64 encoded signature image
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- E-Sign Signers table (track who needs to sign)
CREATE TABLE IF NOT EXISTS esign_signers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES esign_documents(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'viewed', 'signed', 'declined')),
  signing_order INTEGER NOT NULL DEFAULT 1,
  access_token TEXT NOT NULL, -- Unique token for accessing the document
  viewed_at TIMESTAMP WITH TIME ZONE,
  signed_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  decline_reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(document_id, user_email)
);

-- E-Sign Field Values table (stored signature/date values)
CREATE TABLE IF NOT EXISTS esign_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id UUID NOT NULL REFERENCES esign_fields(id) ON DELETE CASCADE,
  signer_id UUID NOT NULL REFERENCES esign_signers(id) ON DELETE CASCADE,
  value TEXT NOT NULL, -- Base64 for signature, text for date/text fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- E-Sign Audit Log table (track all actions)
CREATE TABLE IF NOT EXISTS esign_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES esign_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL, -- 'created', 'viewed', 'signed', 'sent', 'declined', 'expired', 'cancelled'
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_esign_documents_creator ON esign_documents(creator_id);
CREATE INDEX IF NOT EXISTS idx_esign_documents_status ON esign_documents(status);
CREATE INDEX IF NOT EXISTS idx_esign_fields_document ON esign_fields(document_id);
CREATE INDEX IF NOT EXISTS idx_esign_signatures_user ON esign_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_esign_signers_document ON esign_signers(document_id);
CREATE INDEX IF NOT EXISTS idx_esign_signers_email ON esign_signers(user_email);
CREATE INDEX IF NOT EXISTS idx_esign_signers_token ON esign_signers(access_token);
CREATE INDEX IF NOT EXISTS idx_esign_audit_document ON esign_audit_log(document_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE esign_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE esign_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE esign_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE esign_signers ENABLE ROW LEVEL SECURITY;
ALTER TABLE esign_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE esign_audit_log ENABLE ROW LEVEL SECURITY;

-- esign_documents policies
CREATE POLICY "Users can view documents they created or are invited to sign"
  ON esign_documents FOR SELECT
  USING (
    creator_id = auth.uid() OR
    id IN (SELECT document_id FROM esign_signers WHERE user_email = auth.jwt()->>'email')
  );

CREATE POLICY "Users can create their own documents"
  ON esign_documents FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update their own documents"
  ON esign_documents FOR UPDATE
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can delete their own documents"
  ON esign_documents FOR DELETE
  USING (creator_id = auth.uid());

-- esign_fields policies
CREATE POLICY "Users can view fields for documents they have access to"
  ON esign_fields FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM esign_documents
      WHERE creator_id = auth.uid() OR
      id IN (SELECT document_id FROM esign_signers WHERE user_email = auth.jwt()->>'email')
    )
  );

CREATE POLICY "Document creators can manage fields"
  ON esign_fields FOR ALL
  USING (
    document_id IN (SELECT id FROM esign_documents WHERE creator_id = auth.uid())
  );

-- esign_signatures policies
CREATE POLICY "Users can view their own signatures"
  ON esign_signatures FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own signatures"
  ON esign_signatures FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own signatures"
  ON esign_signatures FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own signatures"
  ON esign_signatures FOR DELETE
  USING (user_id = auth.uid());

-- esign_signers policies
CREATE POLICY "Users can view signers for documents they have access to"
  ON esign_signers FOR SELECT
  USING (
    document_id IN (SELECT id FROM esign_documents WHERE creator_id = auth.uid()) OR
    user_email = auth.jwt()->>'email'
  );

CREATE POLICY "Document creators can manage signers"
  ON esign_signers FOR ALL
  USING (
    document_id IN (SELECT id FROM esign_documents WHERE creator_id = auth.uid())
  );

-- esign_field_values policies
CREATE POLICY "Users can view field values for accessible documents"
  ON esign_field_values FOR SELECT
  USING (
    field_id IN (
      SELECT id FROM esign_fields
      WHERE document_id IN (
        SELECT id FROM esign_documents
        WHERE creator_id = auth.uid() OR
        id IN (SELECT document_id FROM esign_signers WHERE user_email = auth.jwt()->>'email')
      )
    )
  );

CREATE POLICY "Signers can insert their own field values"
  ON esign_field_values FOR INSERT
  WITH CHECK (
    signer_id IN (SELECT id FROM esign_signers WHERE user_email = auth.jwt()->>'email')
  );

-- esign_audit_log policies
CREATE POLICY "Users can view audit logs for their documents"
  ON esign_audit_log FOR SELECT
  USING (
    document_id IN (SELECT id FROM esign_documents WHERE creator_id = auth.uid())
  );

CREATE POLICY "Anyone can insert audit logs (system use)"
  ON esign_audit_log FOR INSERT
  WITH CHECK (true);

-- Storage setup
-- Note: Run these commands in Supabase Dashboard > Storage

-- Create storage buckets (execute via Supabase Dashboard or API):
-- 1. esign-documents bucket (for PDFs)
-- 2. esign-signatures bucket (for signature images)

-- Storage policies will need to be set in Supabase Dashboard:
-- esign-documents:
--   - SELECT: Users can view documents they created or are invited to sign
--   - INSERT: Authenticated users can upload
--   - UPDATE: Document creators only
--   - DELETE: Document creators only

-- esign-signatures:
--   - SELECT: Users can view their own signatures
--   - INSERT: Authenticated users can upload
--   - UPDATE: Own signatures only
--   - DELETE: Own signatures only

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_esign_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_esign_documents_updated_at
  BEFORE UPDATE ON esign_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_esign_updated_at();

-- Function to generate unique access token
CREATE OR REPLACE FUNCTION generate_access_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set access token on insert
CREATE OR REPLACE FUNCTION set_signer_access_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_token IS NULL OR NEW.access_token = '' THEN
    NEW.access_token = generate_access_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_esign_signer_token
  BEFORE INSERT ON esign_signers
  FOR EACH ROW
  EXECUTE FUNCTION set_signer_access_token();





