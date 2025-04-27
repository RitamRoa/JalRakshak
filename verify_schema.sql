-- First, let's verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'water_issues';

-- Verify PostGIS extension
SELECT extname, extversion FROM pg_extension WHERE extname = 'postgis';

-- Verify permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'water_issues';

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'water_issues';

-- If needed, reapply permissions and disable RLS
ALTER TABLE public.water_issues DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.water_issues TO anon;
GRANT ALL ON public.water_issues TO authenticated;
GRANT ALL ON public.water_issues TO service_role;

-- Test insert to verify everything works
INSERT INTO public.water_issues (
  location,
  issue_type,
  description,
  severity
) VALUES (
  '(77.1944,28.6139)', -- Example coordinates for New Delhi
  'leak',
  'Test water leak',
  'medium'
) RETURNING *; 