import { useState } from 'react';
import { api } from '../api';
import type { Group, Expense } from '../types';

type BalancesMap = Record<string, number>;
type Settlement = { from: string; to: string; amount: number };

interface GroupData {
  group: Group;
  net: number;
  expenses: Expense[];
  settlements: Settlement[];
}

export function useUserBalances() {
  const [data, setData] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const balRes = await api.get<BalancesMap>(`/users/${userId}/balances`);
      const entries = Object.entries(balRes.data);
      if (!entries.length) {
        setError('User not found or no activity.');
        setData([]);
        return;
      }
      const all = await Promise.all(
        entries.map(async ([gid, net]) => {
          const [gRes, gbRes, eRes] = await Promise.all([
            api.get<Group>(`/groups/${gid}`),
            api.get<BalancesMap>(`/groups/${gid}/balances`),
            api.get<Expense[]>(`/groups/${gid}/expenses/`),
          ]);
          const me = Number(userId);
          const relevant = eRes.data.filter(
            x => x.paid_by===me || x.splits.some(s=>s.user_id===me)
          );
          // compute per-user settlements
          const debtors:any[] =[], creditors:any[]=[];
          Object.entries(gbRes.data).forEach(([u, b]) => {
            if(b<0) debtors.push({u,amt:-b});
            if(b>0) creditors.push({u,amt:b});
          });
          const s: Settlement[] = [];
          let i=0,j=0;
          while(i<debtors.length&&j<creditors.length){
            const amt=Math.min(debtors[i].amt,creditors[j].amt);
            s.push({from:debtors[i].u,to:creditors[j].u,amount:parseFloat(amt.toFixed(2))});
            debtors[i].amt-=amt; creditors[j].amt-=amt;
            if(!debtors[i].amt) i++; if(!creditors[j].amt) j++;
          }
          const userSett = s.filter(x=>x.from===String(me)||x.to===String(me));
          return { group: gRes.data, net, expenses: relevant, settlements: userSett };
        })
      );
      setData(all);
    } catch (e: any) {
      setError(e.response?.status===404 ? 'User not found.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, loadUser };
}
