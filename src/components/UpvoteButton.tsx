import React, { useState, useEffect } from 'react';
import { ArrowBigUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toggleUpvote } from '../utils/supabaseClient';
import { supabase } from '../utils/supabaseClient';

interface UpvoteButtonProps {
  issueId: string;
  initialUpvotes: number;
  className?: string;
}

const UpvoteButton: React.FC<UpvoteButtonProps> = ({ issueId, initialUpvotes, className = '' }) => {
  const { user } = useAuth();
  const [upvoteCount, setUpvoteCount] = useState(initialUpvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUserUpvote = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('issue_upvotes')
        .select('*')
        .eq('issue_id', issueId)
        .eq('user_id', user.id)
        .single();

      setHasUpvoted(!!data);
    };

    checkUserUpvote();
  }, [issueId, user]);

  const handleUpvote = async () => {
    if (!user) {
      alert('Please sign in to upvote issues');
      return;
    }

    setIsLoading(true);
    try {
      const isUpvoted = await toggleUpvote(issueId, user.id);
      setHasUpvoted(isUpvoted);
      setUpvoteCount(prev => isUpvoted ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling upvote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={isLoading}
      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full transition-colors duration-200 ${
        hasUpvoted
          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
    >
      <ArrowBigUp
        className={`h-5 w-5 ${hasUpvoted ? 'text-primary-600' : 'text-gray-500'} ${
          isLoading ? 'animate-bounce' : ''
        }`}
      />
      <span className="text-sm font-medium">{upvoteCount}</span>
    </button>
  );
};

export default UpvoteButton; 