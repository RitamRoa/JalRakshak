export interface Tables {
  water_issues: {
    id: string;
    created_at: string;
    updated_at: string;
    location: string;
    coordinates: [number, number];
    issue_type: 'leak' | 'flood' | 'contamination' | 'shortage' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    user_id: string;
  };
  user_profiles: {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    full_name: string;
    email: string;
    phone?: string;
    role: 'user' | 'admin' | 'authority';
  };
  authorities: {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    jurisdiction: string;
    contact_email: string;
    contact_phone: string;
    response_time_hours: number;
  };
} 