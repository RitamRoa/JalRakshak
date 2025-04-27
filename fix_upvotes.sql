-- Drop and recreate the issue_upvotes table
DROP TABLE IF EXISTS public.issue_upvotes;

CREATE TABLE public.issue_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid REFERENCES public.water_issues(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(issue_id, user_id)
);

-- Reset upvote counts
UPDATE public.water_issues SET upvote_count = 0;

-- Recalculate upvote counts
WITH upvote_counts AS (
  SELECT issue_id, COUNT(*) as count
  FROM public.issue_upvotes
  GROUP BY issue_id
)
UPDATE public.water_issues wi
SET upvote_count = COALESCE(uc.count, 0)
FROM upvote_counts uc
WHERE wi.id = uc.issue_id;

-- Recreate the trigger function for upvote count
CREATE OR REPLACE FUNCTION public.update_upvote_count()
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
$$ language 'plpgsql' SECURITY DEFINER;

-- Recreate the triggers
DROP TRIGGER IF EXISTS update_upvote_count_insert ON public.issue_upvotes;
CREATE TRIGGER update_upvote_count_insert
    AFTER INSERT ON public.issue_upvotes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_upvote_count();

DROP TRIGGER IF EXISTS update_upvote_count_delete ON public.issue_upvotes;
CREATE TRIGGER update_upvote_count_delete
    AFTER DELETE ON public.issue_upvotes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_upvote_count();

-- Grant necessary permissions
GRANT ALL ON public.issue_upvotes TO authenticated;
GRANT ALL ON public.water_issues TO authenticated; 