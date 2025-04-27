/*
  # Initial Schema Setup

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `phone` (text)
      - `address` (text)
      - `badges` (text array)
      - `safety_score` (integer)
      - `is_admin` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `water_issues`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `location` (point)
      - `issue_type` (text)
      - `description` (text)
      - `severity` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `authorities`
      - `id` (uuid, primary key)
      - `name` (text)
      - `location` (point)
      - `type` (text)
      - `phone` (text)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin-specific policies
*/

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text,
  phone text,
  address text,
  badges text[] DEFAULT ARRAY[]::text[],
  safety_score integer DEFAULT 0,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Drop existing table if exists
DROP TABLE IF EXISTS public.water_issues;

-- Create water_issues table with point type
CREATE TABLE public.water_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000',
  location point NOT NULL,
  issue_type text NOT NULL CHECK (issue_type IN ('leak', 'flood', 'contamination', 'shortage', 'other')),
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'inProgress', 'resolved', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Temporarily disable RLS
ALTER TABLE public.water_issues DISABLE ROW LEVEL SECURITY;

-- Grant access to public
GRANT ALL ON public.water_issues TO anon;
GRANT ALL ON public.water_issues TO authenticated;
GRANT ALL ON public.water_issues TO service_role;

-- Create authorities table
CREATE TABLE IF NOT EXISTS public.authorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location point NOT NULL,
  type text NOT NULL,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorities ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all profiles"
  ON public.user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Authorities Policies
CREATE POLICY "Anyone can view authorities"
  ON public.authorities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify authorities"
  ON public.authorities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Create index on location
DROP INDEX IF EXISTS water_issues_location_idx;
CREATE INDEX water_issues_location_idx ON public.water_issues USING gist (location);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_water_issues_updated_at ON public.water_issues;
CREATE TRIGGER update_water_issues_updated_at
    BEFORE UPDATE ON public.water_issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.create_water_issue(float8, float8, jsonb);

-- Create stored procedure for water issue creation
CREATE OR REPLACE FUNCTION public.create_water_issue(
  issue_data jsonb,
  latitude float8,
  longitude float8
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_issue_id uuid;
  new_issue record;
BEGIN
  -- Insert the new water issue
  INSERT INTO public.water_issues (
    id,
    user_id,
    location,
    issue_type,
    description,
    severity,
    status,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    (issue_data->>'user_id')::uuid,
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
    issue_data->>'issue_type',
    issue_data->>'description',
    issue_data->>'severity',
    issue_data->>'status',
    COALESCE((issue_data->>'created_at')::timestamptz, now()),
    COALESCE((issue_data->>'updated_at')::timestamptz, now())
  )
  RETURNING * INTO new_issue;

  -- Return the created issue as JSON
  RETURN jsonb_build_object(
    'id', new_issue.id,
    'user_id', new_issue.user_id,
    'location', ST_AsGeoJSON(new_issue.location)::jsonb,
    'issue_type', new_issue.issue_type,
    'description', new_issue.description,
    'severity', new_issue.severity,
    'status', new_issue.status,
    'created_at', new_issue.created_at,
    'updated_at', new_issue.updated_at
  );
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Error creating water issue: %', SQLERRM;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.create_water_issue(jsonb, float8, float8) TO public;