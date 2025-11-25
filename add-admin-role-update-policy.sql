-- ==========================================
-- ADD ADMIN ROLE UPDATE POLICY
-- ==========================================
-- This migration adds a policy to allow owners and admins
-- to update user roles in their organization

-- Add policy for admins to update user profiles
DROP POLICY IF EXISTS "Admins can update user profiles in their organization" ON public.user_profiles;
CREATE POLICY "Admins can update user profiles in their organization" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

COMMENT ON POLICY "Admins can update user profiles in their organization" ON public.user_profiles 
IS 'Allows organization owners and admins to update any user profile in their organization, including changing roles';

