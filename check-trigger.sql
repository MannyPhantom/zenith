-- Check if the trigger and function exist

-- Check for the handle_new_user function
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- Check for the trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'on_auth_user_created';

-- Check if you have any user profiles
SELECT 
  id,
  email,
  full_name,
  role,
  organization_id,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- Check organizations
SELECT 
  id,
  name,
  domain,
  created_at
FROM public.organizations
ORDER BY created_at DESC
LIMIT 10;





