import { useState } from 'react';
import { api } from '../api';
import type { Group, Expense } from '../types';

type BalancesMap = Record<string, number>;
type Settlement = { from: string; to: string; amount: number };

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
      const [gRes, bRes, eRes] = await Promise.all([
        api.get<Group>(`/groups/${groupId}`),
        api.get<BalancesMap>(`/groups/${groupId}/balances`),
        api.get<Expense[]>(`/groups/${groupId}/expenses/`),
      ]);
      setGroup(gRes.data);
      setBalances(bRes.data);
      setExpenses(eRes.data);

      // compute settlements
      const debtors: {u:string;amt:number}[] = [], creditors: {u:string;amt:number}[] = [];
      Object.entries(bRes.data).forEach(([u, bal]) => {
        if (bal<0) debtors.push({u,amt:-bal});
        if (bal>0) creditors.push({u,amt:bal});
      });
      const s: Settlement[] = [];
      let i=0,j=0;
      while(i<debtors.length && j<creditors.length){
        const amt = Math.min(debtors[i].amt, creditors[j].amt);
        s.push({from: debtors[i].u, to: creditors[j].u, amount: parseFloat(amt.toFixed(2))});
        debtors[i].amt-=amt; creditors[j].amt-=amt;
        if(!debtors[i].amt) i++; if(!creditors[j].amt) j++;
      }
      setSettlements(s);
    } catch (e: any) {
      setError(e.response?.status===404 ? 'Group not found.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  return { group, balances, expenses, settlements, loading, error, loadGroup };
}
