'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Discussion } from '@/types/lead';

// The dialog is mounted fresh per lead (keyed by id), so state starts clean each time
export function useDiscussions(leadId: string) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    api
      .getDiscussions(leadId, controller.signal)
      .then(setDiscussions)
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Failed to load discussions');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [leadId]);

  // Newest first, so a freshly saved note goes on top without refetching
  const prepend = useCallback((d: Discussion) => {
    setDiscussions((prev) => [d, ...prev]);
  }, []);

  return { discussions, loading, error, prepend };
}