import { useState } from 'react';
import { useUserBalances } from '../hooks/useUserBalances';
import { Spinner } from './layout/Spinner';

export default function UserBalances() {
  const { data, loading, error, loadUser } = useUserBalances();
  const [userId, setUserId] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handle = () => {
    if (!/^[1-9]\d*$/.test(userId)) {
      setInputError('Enter a valid User ID');
      return;
    }
    setInputError(null);
    loadUser(+userId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">My Balances</h1>

      <div className="flex space-x-2">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="User ID"
          value={userId}
          onChange={e=>setUserId(e.target.value)}
        />
        <button
          onClick={handle}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded cursor-pointer"
        >
          Load
        </button>
      </div>
      {inputError && <p className="text-red-600 text-sm">{inputError}</p>}

      {loading && <Spinner />}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data.map(({ group, net, expenses, settlements }) => (
        <section key={group.id} className="p-4 border rounded bg-gray-50 space-y-2">
          <h2 className="font-semibold">{group.name} (ID {group.id})</h2>

          <p>
            Net Balance: <span className={net>0?'text-green-600':net<0?'text-red-600':''}>
              {net>0?'+':''}₹{net.toFixed(2)}
            </span>
          </p>

          <div>
            <h3 className="font-medium">My Expenses</h3>
            {expenses.length ? (
              <ul className="list-disc list-inside text-sm space-y-1">
                {expenses.map((e) => {
                    const meSplit = e.splits.find(
                      (s) => s.user_id === Number(userId)
                    )!;
                    const pct = ((meSplit?.share / e.amount) * 100).toFixed(1);
                    return (
                      <li key={e.id}>
                        <div className="flex justify-between">
                          <span>
                            #{e.id} {e.description}
                          </span>
                          <span>
                            ₹{e.amount.toFixed(2)} by User {e.paid_by}
                          </span>
                        </div>
                        <div className="text-sm italic">
                          {e.split_type === "equal"
                            ? "Equal Split"
                            : "Percentage Split"}
                        </div>
                        <div className="text-sm">
                          My share: ₹{meSplit?.share.toFixed(2)}
                          {e.split_type === "percentage" && (
                            <span className="ml-2 text-xs text-gray-600">
                              ({pct}%)
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p className="text-gray-600">No activity.</p>
            )}
          </div>

          <div>
            <h3 className="font-medium">Settle-Up</h3>
            {settlements.length ? (
              <ul className="list-disc list-inside text-sm">
                {settlements.map((s,i)=>(
                  <li key={i}>
                    {s.from === userId ? 'You owe' : 'You are owed'} ₹{s.amount.toFixed(2)} {s.from===userId?'to':'by'} User {s.from===userId?s.to:s.from}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-700">You are settled in this group.</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
