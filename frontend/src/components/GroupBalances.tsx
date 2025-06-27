import { useState } from "react";
import { api } from "../api";
import type { Group } from "../types";
import type { Expense } from "../types";

type BalancesMap = Record<string, number>;
type Settlement = { from: string; to: string; amount: number };

export default function GroupBalances() {
  const [groupId, setGroupId] = useState("");
  const [group, setGroup] = useState<Group | null>(null);
  const [balances, setBalances] = useState<BalancesMap | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!/^\d+$/.test(groupId)) {
      setError("Please enter a valid numeric Group ID.");
      return false;
    }
    setError(null);
    return true;
  };

  const computeSettlements = (balMap: BalancesMap): Settlement[] => {
    const debtors: { user: string; amount: number }[] = [];
    const creditors: { user: string; amount: number }[] = [];

    Object.entries(balMap).forEach(([user, bal]) => {
      if (bal < 0) debtors.push({ user, amount: -bal });
      else if (bal > 0) creditors.push({ user, amount: bal });
    });

    const result: Settlement[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const owe = Math.min(debtors[i].amount, creditors[j].amount);
      result.push({
        from: debtors[i].user,
        to: creditors[j].user,
        amount: parseFloat(owe.toFixed(2)),
      });
      debtors[i].amount -= owe;
      creditors[j].amount -= owe;
      if (debtors[i].amount <= 0) i++;
      if (creditors[j].amount <= 0) j++;
    }
    return result;
  };

  const fetchAll = async () => {
    if (!validate()) return;
    try {
      // fetch group details, balances, and expense history in parallel
      const [grpRes, balRes, expRes] = await Promise.all([
        api.get<Group>(`/groups/${groupId}`),
        api.get<BalancesMap>(`/groups/${groupId}/balances`),
        api.get<Expense[]>(`/groups/${groupId}/expenses/`),
      ]);
      setGroup(grpRes.data);
      setBalances(balRes.data);
      setExpenses(expRes.data);
      setSettlements(computeSettlements(balRes.data));
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Group not found. Please check the Group ID.");
      } else {
        setError(err.response?.data?.detail || "An error occurred.");
      }
      setGroup(null);
      setBalances(null);
      setExpenses([]);
      setSettlements([]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h2 className="text-xl">Group Balances & History</h2>

      <div>
        <input
          className={`w-1/2 p-2 border rounded ${error ? "border-red-500" : ""}`}
          placeholder="Enter Group ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
        <button
          type="submit"
          onClick={fetchAll}
          className="ml-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded cursor-pointer"
        >
          Load
        </button>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>

      {group && (
        <div className="space-y-4">
          {/* Group Header */}
          <div className="text-xl">
            <strong>{group.name}</strong> — total spent ₹
            {group.total_expenses.toFixed(2)}
          </div>

          {/* Expense History */}
          <section className="bg-gray-50 p-4 rounded shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Expense History</h3>
            {expenses.length > 0 ? (
              <ul className="space-y-4">
                {expenses.map((exp) => (
                  <li key={exp.id} className="p-3 border rounded">
                    <div className="flex justify-between">
                      <span>#{exp.id} {exp.description}</span>
                      <span>₹{exp.amount.toFixed(2)} by <strong>User {exp.paid_by}</strong></span>
                    </div>
                    <div className="mt-2 text-sm italic">
                      {exp.split_type === "equal" ? "Equal Split" : "Percentage Split"}
                    </div>
                    <div className="mt-2">
                      <h4 className="font-medium">Splits:</h4>
                      <ul className="list-disc list-inside text-sm">
                        {exp.splits.map((s) => (
                          <li key={s.user_id}>
                            User {s.user_id}: ₹{s.share.toFixed(2)}
                            {exp.split_type === "percentage" && (
                              <span className="ml-2 text-xs text-gray-600">
                                ({((s.share / exp.amount) * 100).toFixed(1)}%)
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
              <p className="text-gray-600">No expenses recorded yet.</p>
            )}
          </section>

          {/* Net Balances */}
          {balances && (
            <section className="bg-indigo-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Net Balances</h3>
              {Object.entries(balances).map(([uid, bal]) => (
                <div
                  key={uid}
                  className="flex justify-between py-1 border-b last:border-0"
                >
                  <span>User {uid} { }</span>
                  <span
                    className={
                      bal > 0 ? "text-green-600" : bal < 0 ? "text-red-600" : ""
                    }
                  >
                    {bal > 0 ? "+" : ""}
                    ₹{bal.toFixed(2)}
                  </span>
                </div>
              ))}
            </section>
          )}

          {/* Settle-Up */}
          {settlements.length > 0 ? (
            <section className="bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Settle-Up Suggestions</h3>
              <ul className="space-y-1">
                {settlements.map((st, i) => (
                  <li key={i}>
                    User {st.from} → User {st.to}: ₹{st.amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            balances && (
              <p className="text-green-700 font-medium">
                All settled—no one owes anything!
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

