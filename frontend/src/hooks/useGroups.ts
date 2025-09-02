import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { Group } from '../types';

const STORAGE_KEY = 'splitwise:groups';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>(() => {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Group[]>('/groups/');
      setGroups(res.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    } catch (e: any) {
      setError(e.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, error, refresh: fetchGroups };
}
