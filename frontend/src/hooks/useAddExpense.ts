import { useState } from 'react';
import { api } from '../api';
import type { ExpenseCreate } from '../types';

export function useAddExpense() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addExpense = async (groupId: number, payload: ExpenseCreate) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/groups/${groupId}/expenses/`, payload);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return { addExpense, loading, error };
}
