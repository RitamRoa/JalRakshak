-- Insert multiple water issues across Bengaluru
INSERT INTO public.water_issues (
    location,
    issue_type,
    description,
    severity,
    status
) VALUES 
    -- Koramangala
    (point(77.6332, 12.9352),
    'leak',
    'Major water pipe leak near Forum Mall, water wastage observed',
    'high',
    'pending'),

    -- Indiranagar
    (point(77.6411, 12.9719),
    'shortage',
    'No water supply for the past 2 days in 12th Main',
    'critical',
    'urgent'),

    -- Whitefield
    (point(77.7506, 12.9698),
    'contamination',
    'Brown colored water coming from taps, possibly contaminated',
    'high',
    'pending'),

    -- Electronic City
    (point(77.6701, 12.8458),
    'flood',
    'Water logging after recent rains, roads blocked',
    'medium',
    'pending'),

    -- HSR Layout
    (point(77.6501, 12.9116),
    'leak',
    'Underground pipeline burst causing road damage',
    'critical',
    'urgent'),

    -- Marathahalli
    (point(77.7010, 12.9567),
    'shortage',
    'Irregular water supply affecting residential apartments',
    'high',
    'pending'),

    -- JP Nagar
    (point(77.5921, 12.9102),
    'contamination',
    'Sewage mixing with water supply, urgent attention needed',
    'critical',
    'urgent'),

    -- Bannerghatta Road
    (point(77.5979, 12.8991),
    'flood',
    'Drainage overflow causing street flooding',
    'medium',
    'inProgress');

-- Add some upvotes to existing issues (you'll need to replace the issue_ids with actual UUIDs after insertion)
-- Example of how to add upvotes (run this after noting down some issue IDs):
/*
INSERT INTO public.issue_upvotes (issue_id, user_id)
VALUES 
    ('issue_id_here', 'your_user_id_here'),
    ('another_issue_id', 'your_user_id_here');
*/ 