-- First, enable the required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.issue_upvotes;
DROP TABLE IF EXISTS public.water_issues;
DROP TABLE IF EXISTS public.profiles;

-- Create the water_issues table first
CREATE TABLE public.water_issues (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create the issue_upvotes table
CREATE TABLE public.issue_upvotes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id uuid REFERENCES public.water_issues(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(issue_id, user_id)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY,
    email text UNIQUE,
    full_name text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER update_water_issues_updated_at
    BEFORE UPDATE ON public.water_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upvote_count_insert
    AFTER INSERT ON public.issue_upvotes
    FOR EACH ROW
    EXECUTE FUNCTION update_upvote_count();

CREATE TRIGGER update_upvote_count_delete
    AFTER DELETE ON public.issue_upvotes
    FOR EACH ROW
    EXECUTE FUNCTION update_upvote_count();

-- Enable Row Level Security
ALTER TABLE public.water_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for water_issues
CREATE POLICY "Water issues are viewable by everyone" 
    ON public.water_issues FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create water issues" 
    ON public.water_issues FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own water issues" 
    ON public.water_issues FOR UPDATE 
    USING (auth.uid()::text = user_id::text);

-- Create policies for issue_upvotes
CREATE POLICY "Upvotes are viewable by everyone" 
    ON public.issue_upvotes FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create upvotes" 
    ON public.issue_upvotes FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own upvotes" 
    ON public.issue_upvotes FOR DELETE 
    USING (auth.uid()::text = user_id::text);

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.water_issues TO anon, authenticated;
GRANT ALL ON public.issue_upvotes TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create spatial index
CREATE INDEX water_issues_location_idx ON public.water_issues USING gist (location);

-- Insert a test water issue
INSERT INTO public.water_issues (
    location,
    issue_type,
    description,
    severity,
    status
) VALUES (
    point(77.2090, 28.6139),
    'leak',
    'Test water leak',
    'medium',
    'pending'
); 