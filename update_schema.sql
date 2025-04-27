-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing tables
DROP TABLE IF EXISTS public.issue_upvotes;
DROP TABLE IF EXISTS public.water_issues;

-- Create water_issues table
CREATE TABLE public.water_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000',
  location point NOT NULL,
  issue_type text NOT NULL CHECK (issue_type IN ('leak', 'flood', 'contamination', 'shortage', 'other')),
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'inProgress', 'resolved', 'urgent')),
  upvote_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create issue_upvotes table for tracking individual upvotes
CREATE TABLE public.issue_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid REFERENCES public.water_issues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(issue_id, user_id)
);

-- Disable RLS
ALTER TABLE public.water_issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_upvotes DISABLE ROW LEVEL SECURITY;

-- Grant access to public
GRANT ALL ON public.water_issues TO anon;
GRANT ALL ON public.water_issues TO authenticated;
GRANT ALL ON public.water_issues TO service_role;

GRANT ALL ON public.issue_upvotes TO anon;
GRANT ALL ON public.issue_upvotes TO authenticated;
GRANT ALL ON public.issue_upvotes TO service_role;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for water_issues
DROP TRIGGER IF EXISTS update_water_issues_updated_at ON public.water_issues;
CREATE TRIGGER update_water_issues_updated_at
    BEFORE UPDATE ON public.water_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger function for upvote count
CREATE OR REPLACE FUNCTION update_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.water_issues
        SET upvote_count = upvote_count + 1
        WHERE id = NEW.issue_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.water_issues
        SET upvote_count = upvote_count - 1
        WHERE id = OLD.issue_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for upvote count
DROP TRIGGER IF EXISTS update_upvote_count_insert ON public.issue_upvotes;
CREATE TRIGGER update_upvote_count_insert
    AFTER INSERT ON public.issue_upvotes
    FOR EACH ROW
    EXECUTE FUNCTION update_upvote_count();

DROP TRIGGER IF EXISTS update_upvote_count_delete ON public.issue_upvotes;
CREATE TRIGGER update_upvote_count_delete
    AFTER DELETE ON public.issue_upvotes
    FOR EACH ROW
    EXECUTE FUNCTION update_upvote_count();

-- Create index
DROP INDEX IF EXISTS water_issues_location_idx;
CREATE INDEX water_issues_location_idx ON public.water_issues USING gist (location); 