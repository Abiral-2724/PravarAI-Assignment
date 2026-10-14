'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { getTodayWindow } from '@/lib/date';
import type { Lead } from '@/types/lead';


export function useLeads(search: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true); // true only until the first response
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchLeads = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const data = await api.getLeads(
        { search: search.trim() || undefined, ...getTodayWindow() },
        controller.signal
      );
      if (controller.signal.aborted) return;
      setLeads(data);
      setError(null);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchLeads();
    return () => controllerRef.current?.abort();
  }, [fetchLeads]);

  return { leads, loading, error, refetch: fetchLeads };
}