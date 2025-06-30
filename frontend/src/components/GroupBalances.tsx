import { useState } from 'react';
import { useGroupBalances } from '../hooks/useGroupBalances';
import { Spinner } from './layout/Spinner';
import type { Expense } from '../types';
import { api } from '../api';

type Settlement = { from: string; to: string; amount: number };

export default function GroupBalances() {
  const { group, balances, expenses, loading, error, loadGroup, suggestions } = useGroupBalances();
  const [groupId, setGroupId] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handle = () => {
    if (!/^[1-9]\d*$/.test(groupId)) {
      setInputError('Enter a valid Group ID');
      return;
    }
    setInputError(null);
    loadGroup(+groupId);
  };

  const markAsPaid = async (s: { from: string; to: string; amount: number }) => {
    if (!group) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await api.post<Settlement>(`/groups/${group.id}/settlements/`, {
        from_user: +s.from,
        to_user: +s.to,
        amount: s.amount,
      });
      await loadGroup(group.id);
    } catch (e: any) {
      setActionError(e.response?.data?.detail || e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Group Balances</h1>

      <div className="flex space-x-2">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Group ID"
          value={groupId}
          onChange={e => setGroupId(e.target.value)}
        />
        <button
          onClick={handle}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded cursor-pointer"
        >
          Load
        </button>
      </div>
      {inputError && <p className="text-red-600 text-sm">{inputError}</p>}

      {loading && <Spinner />}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {group && (
        <div className="space-y-6">
          <div className="text-xl">
            <strong>{group.name}</strong> — Total ₹{group.total_expenses.toFixed(2)}
          </div>

          <section className="bg-gray-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Expenses</h2>
            {expenses.length ? (
              <ul className="space-y-2">
                {expenses.map((e: Expense) => (
                  <li key={e.id} className="p-2 border rounded">
                    <div className="flex justify-between">
                      <span>#{e.id} {e.description}</span>
                      <span>₹{e.amount.toFixed(2)} paid by User {e.paid_by}</span>
                    </div>

                    <div className="mt-2 text-sm italic">
                      {e.split_type === "equal" ? "Equal Split" : "Percentage Split"}
                    </div>
                    <div className="mt-2">
                      <h4 className="font-medium">Splits:</h4>
                      <ul className="list-disc list-inside text-sm">
                        {e.splits.map((s) => (
                          <li key={s.user_id}>
                            User {s.user_id}: ₹{s.share.toFixed(2)}
                            {e.split_type === "percentage" && (
                              <span className="ml-2 text-xs text-gray-600">
                                ({((s.share / e.amount) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No expenses.</p>
            )}
          </section>

          <section className="bg-indigo-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Net Balances</h2>
            {Object.entries(balances).map(([u, bal]) => (
              <div key={u} className="flex justify-between py-1 border-b last:border-0">
                <span>User {u}</span>
                <span className={bal > 0 ? 'text-green-600' : bal < 0 ? 'text-red-600' : ''}>
                  {bal > 0 ? '+' : ''}₹{bal.toFixed(2)}
                </span>
              </div>
            ))}
          </section>

          <section className="bg-yellow-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Settle-Up</h2>
            {actionError && <p className="text-red-600">{actionError}</p>}
            {actionLoading && <Spinner />}
            {suggestions.length ? (
              <ul className="list-disc list-inside">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span>
                      User {s.from} → User {s.to}: ₹{s.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => markAsPaid(s)}
                      disabled={actionLoading}
                      className="text-sm text-green-700 hover:underline cursor-pointer"
                    >
                      Mark as paid
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No outstanding settlements.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
