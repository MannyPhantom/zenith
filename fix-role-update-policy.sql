-- ==========================================
-- FIX ROLE UPDATE POLICY
-- ==========================================
-- This fixes the RLS policy to include WITH CHECK clause
-- which is required for UPDATE operations to work properly

-- Drop and recreate the policy with WITH CHECK clause
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

-- Verify the policy was updated
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles' 
  AND policyname = 'Admins can update user profiles in their organization';

COMMENT ON POLICY "Admins can update user profiles in their organization" ON public.user_profiles 
IS 'Allows organization owners and admins to update any user profile in their organization, including changing roles. Includes WITH CHECK for proper UPDATE validation.';

