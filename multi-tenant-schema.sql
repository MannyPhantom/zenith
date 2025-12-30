-- ==========================================
-- MULTI-TENANT ARCHITECTURE FOR ZENITH SAAS
-- ==========================================
-- This schema implements organization-based multi-tenancy
-- Each organization has isolated data with proper RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- CORE MULTI-TENANT TABLES
-- ==========================================

-- Organizations table (the tenant root)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE, -- e.g., "acme.com" for email domain matching
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  subscription_tier TEXT NOT NULL DEFAULT 'free', -- free, starter, professional, enterprise
  subscription_status TEXT NOT NULL DEFAULT 'active', -- active, trial, suspended, cancelled
  max_users INTEGER DEFAULT 50,
  settings JSONB DEFAULT '{}', -- Organization-specific settings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  department TEXT,
  job_title TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id, organization_id)
);

-- Organization invitations
CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES public.user_profiles(id),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- ==========================================
-- UPDATE EXISTING TABLES WITH ORGANIZATION_ID
-- ==========================================

-- Add organization_id to projects table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id);
  END IF;
END $$;

-- Add organization_id to tasks table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.tasks ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_tasks_organization_id ON public.tasks(organization_id);
  END IF;
END $$;

-- Add organization_id to milestones table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'milestones' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.milestones ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_milestones_organization_id ON public.milestones(organization_id);
  END IF;
END $$;

-- Add organization_id to team_members table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_members' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.team_members ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_team_members_organization_id ON public.team_members(organization_id);
  END IF;
END $$;

-- Add organization_id to cs_clients table (Customer Success)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cs_clients' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.cs_clients ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_cs_clients_organization_id ON public.cs_clients(organization_id);
  END IF;
END $$;

-- Add organization_id to job_postings table (HR)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_postings' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE public.job_postings ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_job_postings_organization_id ON public.job_postings(organization_id);
  END IF;
END $$;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Organizations policies
DROP POLICY IF EXISTS "Users can view their organization" ON public.organizations;
CREATE POLICY "Users can view their organization" ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organization owners can update their organization" ON public.organizations;
CREATE POLICY "Organization owners can update their organization" ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- User profiles policies
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.user_profiles;
CREATE POLICY "Users can view profiles in their organization" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow reading your own profile directly (avoids recursion)
    id = auth.uid()
    OR
    -- Or if organization matches (uses helper function to avoid recursion)
    organization_id = public.get_user_organization()
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can update user profiles in their organization" ON public.user_profiles;
CREATE POLICY "Admins can update user profiles in their organization" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Projects RLS policies (updated for multi-tenancy)
DROP POLICY IF EXISTS "Users can view projects in their organization" ON public.projects;
CREATE POLICY "Users can view projects in their organization" ON public.projects
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert projects in their organization" ON public.projects;
CREATE POLICY "Users can insert projects in their organization" ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update projects in their organization" ON public.projects;
CREATE POLICY "Users can update projects in their organization" ON public.projects
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete projects in their organization" ON public.projects;
CREATE POLICY "Users can delete projects in their organization" ON public.projects
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Tasks RLS policies
DROP POLICY IF EXISTS "Users can view tasks in their organization" ON public.tasks;
CREATE POLICY "Users can view tasks in their organization" ON public.tasks
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage tasks in their organization" ON public.tasks;
CREATE POLICY "Users can manage tasks in their organization" ON public.tasks
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

-- CS Clients RLS policies
DROP POLICY IF EXISTS "Users can view cs_clients in their organization" ON public.cs_clients;
CREATE POLICY "Users can view cs_clients in their organization" ON public.cs_clients
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage cs_clients in their organization" ON public.cs_clients;
CREATE POLICY "Users can manage cs_clients in their organization" ON public.cs_clients
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to get current user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM public.user_profiles WHERE id = auth.uid();
$$;

-- Function to check if user has role in organization
CREATE OR REPLACE FUNCTION public.user_has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role = required_role
  );
$$;

-- Function to auto-create organization on first Microsoft 365 sign-in
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  email_domain TEXT;
  existing_org_id UUID;
  new_org_id UUID;
  user_full_name TEXT;
BEGIN
  -- Get user email from auth metadata
  user_email := NEW.email;
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(user_email, '@', 1));
  
  -- Extract domain from email
  email_domain := split_part(user_email, '@', 2);
  
  -- Check if organization exists for this domain
  SELECT id INTO existing_org_id 
  FROM public.organizations 
  WHERE domain = email_domain
  LIMIT 1;
  
  -- If no organization exists, create one
  IF existing_org_id IS NULL THEN
    INSERT INTO public.organizations (name, domain, slug, subscription_tier)
    VALUES (
      email_domain,  -- Use domain as initial name
      email_domain,
      LOWER(REPLACE(email_domain, '.', '-')),
      'trial'  -- Start with trial
    )
    RETURNING id INTO new_org_id;
    
    existing_org_id := new_org_id;
  END IF;
  
  -- Create user profile
  INSERT INTO public.user_profiles (
    id, 
    organization_id, 
    email, 
    full_name,
    avatar_url,
    role,
    last_login_at
  )
  VALUES (
    NEW.id,
    existing_org_id,
    user_email,
    user_full_name,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE organization_id = existing_org_id)
      THEN 'owner'  -- First user becomes owner
      ELSE 'member' -- Subsequent users are members
    END,
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create organization and profile on new user sign-up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update user's last login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_login_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update last login timestamp
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_login();

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_organization_id ON public.user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON public.organizations(domain);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE public.organizations IS 'Tenant organizations - each organization has isolated data';
COMMENT ON TABLE public.user_profiles IS 'Extended user profiles linked to organizations';
COMMENT ON COLUMN public.organizations.domain IS 'Email domain for auto-assignment (e.g., company.com)';
COMMENT ON COLUMN public.user_profiles.role IS 'User role: owner, admin, member, viewer';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates organization and user profile on Microsoft 365 SSO';



