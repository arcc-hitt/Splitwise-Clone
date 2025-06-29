import { useEffect, useState } from 'react';
import { useAddExpense } from '../hooks/useAddExpense';
import { Spinner } from './layout/Spinner';
import type { ExpenseCreate, SplitType } from '../types';
import { api } from '../api';

export default function AddExpense() {
  const { addExpense, loading, error } = useAddExpense();

  const [groupId, setGroupId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [splitsRaw, setSplitsRaw] = useState('');
  const [formError, setFormError] = useState<Record<string,string>>({});
  const [groupMembers, setGroupMembers] = useState<number[] | null>(null);
  const [groupFetchError, setGroupFetchError] = useState<string | null>(null);


  // Whenever groupId is valid, fetch its members
  useEffect(() => {
    setGroupMembers(null);
    setGroupFetchError(null);
    if (!/^[1-9]\d*$/.test(groupId)) return;

    api.get<{ user_ids: number[] }>(`/groups/${groupId}`)
      .then(res => setGroupMembers(res.data.user_ids))
      .catch(err => {
        if (err.response?.status === 404) {
          setGroupFetchError('Group not found');
        } else {
          setGroupFetchError('Error loading group');
        }
      })
  }, [groupId]);


  const validate = () => {
    const e: typeof formError = {};
    if (!/^[1-9]\d*$/.test(groupId)) {
      e.groupId = 'Enter a valid Group ID';
    } else if (groupFetchError) {
      e.groupId = groupFetchError;
    }
    if (!description.trim()) e.description = 'Description is required';
    if (!(+amount > 0)) e.amount = 'Amount must be greater than 0';
    if (!/^[1-9]\d*$/.test(paidBy)) {
      e.paidBy = 'Enter a valid User ID';
    } else if (groupMembers && !groupMembers.includes(+paidBy)) {
      e.paidBy = `User ${paidBy} is not in Group ${groupId}`;
    }
    if (splitType==='percentage') {
      const parts = splitsRaw.split(',');
      if (!parts.length || parts.some(p => !/^\d+:\d+(\.\d+)?$/.test(p.trim()))) {
        e.splitsRaw = 'Format: userId:percent,...';
      } else {
        const total = parts.reduce((sum,p)=>sum + +p.split(':')[1],0);
        if (Math.abs(total-100)>0.01) e.splitsRaw = '% must sum to 100';
      }
    }
    setFormError(e);
    return !Object.keys(e).length;
  };

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: ExpenseCreate = {
      description: description.trim(),
      amount: +amount,
      paid_by: +paidBy,
      split_type: splitType,
    };
    if (splitType==='percentage') {
      payload.splits = splitsRaw.split(',').map(s => {
        const [u, pct] = s.trim().split(':');
        return { user_id: +u, share: +pct };
      });
    }
    addExpense(+groupId, payload);
    setDescription(''); setAmount(''); setPaidBy(''); setSplitsRaw('');
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Add Expense</h1>
      <form onSubmit={handle} className="space-y-4">
        {loading && <Spinner />}

        <div>
          <label className="block mb-1">Group ID</label>
          <input
            className={`w-full p-2 border rounded ${formError.groupId?'border-red-500':''}`}
            placeholder="e.g. 1"
            value={groupId}
            onChange={e=>setGroupId(e.target.value)}
          />
          {formError.groupId && <p className="text-red-600 text-sm">{formError.groupId}</p>}
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <input
            className={`w-full p-2 border rounded ${formError.description?'border-red-500':''}`}
            placeholder="e.g. Dinner at restaurant"
            value={description}
            onChange={e=>setDescription(e.target.value)}
          />
          {formError.description && <p className="text-red-600 text-sm">{formError.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Amount</label>
            <input
              type="number"
              className={`w-full p-2 border rounded ${formError.amount?'border-red-500':''}`}
              value={amount}
              onChange={e=>setAmount(e.target.value)}
            />
            {formError.amount && <p className="text-red-600 text-sm">{formError.amount}</p>}
          </div>
          <div>
            <label className="block mb-1">Paid By (User ID)</label>
            <input
              className={`w-full p-2 border rounded ${formError.paidBy?'border-red-500':''}`}
              value={paidBy}
              onChange={e=>setPaidBy(e.target.value)}
            />
            {formError.paidBy && <p className="text-red-600 text-sm">{formError.paidBy}</p>}
          </div>
        </div>

        <div>
          <label className="block mb-1">Split Type</label>
          <select
            className="w-full p-2 border rounded"
            value={splitType}
            onChange={e=>setSplitType(e.target.value as SplitType)}
          >
            <option value="equal">Equal</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>

        {splitType==='percentage' && (
          <div>
            <label className="block mb-1">Splits <span className="text-gray-500 text-xs">(id:percent,...)</span> </label>
            <input
              className={`w-full p-2 border rounded ${formError.splitsRaw?'border-red-500':''}`}
              placeholder="e.g. 1:50,2:30,3:20"
              value={splitsRaw}
              onChange={e=>setSplitsRaw(e.target.value)}
            />
            {formError.splitsRaw && <p className="text-red-600 text-sm">{formError.splitsRaw}</p>}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
        >
          Add
        </button>

        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
);
}
