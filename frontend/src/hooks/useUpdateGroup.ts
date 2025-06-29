import { useState } from 'react';
import { api } from '../api';

export function useUpdateGroup(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (groupId: number, userIds: number[]) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/groups/${groupId}`, { user_ids: userIds });
      onSuccess();
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
