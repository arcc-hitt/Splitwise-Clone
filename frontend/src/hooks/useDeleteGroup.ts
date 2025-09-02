import { useState } from 'react';
import { api } from '../api';

export function useDeleteGroup(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteGroup = async (groupId: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/groups/${groupId}`);
      onSuccess();
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return { deleteGroup, loading, error };
}
