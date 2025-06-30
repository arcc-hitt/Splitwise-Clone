import { useState } from 'react';
import { api } from '../api';
import type { Group, Expense, BalancesMap, Settlement } from '../types';
import React from 'react';

export function useGroupBalances() {
  const [group, setGroup] = useState<Group | null>(null);
  const [balances, setBalances] = useState<BalancesMap>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroup = async (groupId: number) => {
    setLoading(true);
    setError(null);
    try {
      const [gRes, bRes, eRes, sRes] = await Promise.all([
        api.get<Group>(`/groups/${groupId}`),
        api.get<BalancesMap>(`/groups/${groupId}/balances`),
        api.get<Expense[]>(`/groups/${groupId}/expenses/`),
        api.get<Settlement[]>(`/groups/${groupId}/settlements/`),
      ]);
      setGroup(gRes.data);
      setBalances(bRes.data);
      setExpenses(eRes.data);
      setSettlements(sRes.data);
    } catch (e: any) {
      setError(e.response?.status===404 ? 'Group not found.' : e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

    // compute unpaid suggestions
  const suggestions = React.useMemo(() => {
    // raw suggestions as before
    const debtors: {u:string;amt:number}[] = [];
    const creditors: {u:string;amt:number}[] = [];
    Object.entries(balances).forEach(([u, bal]) => {
      if (bal < 0) debtors.push({ u, amt: -bal });
      else if (bal > 0) creditors.push({ u, amt: bal });
    });
    const raw: { from: string; to: string; amount: number }[] = [];
    let i=0, j=0;
    while (i<debtors.length && j<creditors.length) {
      const amt = Math.min(debtors[i].amt, creditors[j].amt);
      raw.push({ from: debtors[i].u, to: creditors[j].u, amount: parseFloat(amt.toFixed(2)) });
      debtors[i].amt -= amt; creditors[j].amt -= amt;
      if (!debtors[i].amt) i++;
      if (!creditors[j].amt) j++;
    }
    // filter out persisted
    return raw.filter(r => 
      !settlements.some(s => 
        String(s.from_user) === r.from &&
        String(s.to_user)   === r.to &&
        Math.abs(s.amount - r.amount) < 0.01
      )
    );
  }, [balances, settlements]);

  return { group, balances, expenses, settlements, loading, error, loadGroup, suggestions };
}
