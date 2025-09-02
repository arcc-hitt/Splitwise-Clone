import { useState } from 'react';
import { api } from '../api';
import type { GroupCreate } from '../types';

export function useCreateGroup(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = async (payload: GroupCreate) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/groups/', payload);
      onSuccess();
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return { createGroup, loading, error };
}
