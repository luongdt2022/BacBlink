import { useState, useEffect } from 'react';
import { fetchPublicStories, Story, StorySource } from '@/core/api/stories';

interface UseSuccessStoriesResult {
  stories: Story[];
  loading: boolean;
  error: Error | null;
}

export function useSuccessStories(source: StorySource = 'all', limit = 6): UseSuccessStoriesResult {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPublicStories({ source, limit })
      .then(({ data }) => {
        if (!cancelled) {
          setStories(data);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [source, limit]);

  return { stories, loading, error };
}
