import { useState } from "react";
import { api } from "../api";
import type { Group, Expense, Split} from "../types";

type BalancesMap = Record<string, number>;
type Settlement = { from: string; to: string; amount: number };

interface GroupData {
  group: Group;
  net: number;
  expenses: Expense[];             // only those relevant to this user
  settlements: Settlement[];       // only those where from===user or to===user
}

export default function UserBalances() {
  const [userId, setUserId] = useState("");
  const [groupsData, setGroupsData] = useState<GroupData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    if (!/^\d+$/.test(userId)) {
      setError("Please enter a valid numeric User ID.");
      return false;
    }
    setError(null);
    return true;
  };

  const computeUserSettlements = (
    groupBalances: BalancesMap,
    currentUserId: string
  ): Settlement[] => {
    const debtors: { user: string; amount: number }[] = [];
    const creditors: { user: string; amount: number }[] = [];

    Object.entries(groupBalances).forEach(([user, bal]) => {
      if (bal < 0) debtors.push({ user, amount: -bal });
      else if (bal > 0) creditors.push({ user, amount: bal });
    });

    const settlements: Settlement[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].amount, creditors[j].amount);
      settlements.push({
        from: debtors[i].user,
        to: creditors[j].user,
        amount: parseFloat(amount.toFixed(2)),
      });
      debtors[i].amount -= amount;
      creditors[j].amount -= amount;
      if (debtors[i].amount <= 0) i++;
      if (creditors[j].amount <= 0) j++;
    }

    // Filter: only include settlements where user is involved
    return settlements.filter(
      (s) => s.from === currentUserId || s.to === currentUserId
    );
  };

    const fetchData = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);
    setGroupsData([]);

    try {
      // 1) fetch per-user balances
      const balRes = await api.get<BalancesMap>(`/users/${userId}/balances`);
      // 2) for each group, fetch details if net != 0 or we still want zero-net groups
      const entries = Object.entries(balRes.data);

      const all = await Promise.all(
        entries.map(async ([gid, net]) => {
          // Check that user actually exists in the system by fetching /groups/
          const gRes = await api.get<Group>(`/groups/${gid}`);
          // Fetch that group’s balances and expenses
          const [gbRes, eRes] = await Promise.all([
            api.get<BalancesMap>(`/groups/${gid}/balances`),
            api.get<Expense[]>(`/groups/${gid}/expenses/`),
          ]);

          const relevant = eRes.data.filter(
            (exp) =>
              exp.paid_by === Number(userId) ||
              exp.splits.some((s: Split) => s.user_id === Number(userId))
          );

          const settlements = computeUserSettlements(
            gbRes.data,
            userId
          );

          return {
            group: gRes.data,
            net,
            expenses: relevant,
            settlements,
          } as GroupData;
        })
      );

      setGroupsData(all);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("User not found. Please check the User ID.");
      } else {
        setError(err.response?.data?.detail || "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded shadow">
      <h2 className="text-3xl font-bold">My Balances & Activity</h2>

      <div>
        <input
          className={`w-1/2 p-2 border rounded ${error ? "border-red-500" : ""
            }`}
          placeholder="Enter Your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button
          onClick={fetchData}
          className="ml-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded cursor-pointer"
          disabled={loading}
        >
          {loading ? "Loading…" : "Load My Data"}
        </button>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>

      {groupsData.map(({ group, net, expenses, settlements }) => {
        const inGroup = group.user_ids.includes(Number(userId));
        return (
          <section
            key={group.id}
            className="p-4 border rounded space-y-4 bg-gray-50"
          >
            <h3 className="text-xl font-semibold">
              {group.name} (ID {group.id})
            </h3>
            <div>
              <span>Net Balance: </span>
              <span
                className={
                  net > 0 ? "text-green-600" : net < 0 ? "text-red-600" : ""
                }
              >
                {net > 0 ? "+" : ""}
                ₹{net.toFixed(2)}
              </span>
            </div>

            <div>
              <h4 className="font-medium">My Expenses:</h4>
              {expenses.length > 0 ? (
                <ul className="space-y-2 list-disc list-inside">
                  {expenses.map((exp) => {
                    const meSplit = exp.splits.find(
                      (s) => s.user_id === Number(userId)
                    )!;
                    const pct = ((meSplit?.share / exp.amount) * 100).toFixed(1);
                    return (
                      <li key={exp.id}>
                        <div className="flex justify-between">
                          <span>
                            #{exp.id} {exp.description}
                          </span>
                          <span>
                            ₹{exp.amount.toFixed(2)} by User {exp.paid_by}
                          </span>
                        </div>
                        <div className="text-sm italic">
                          {exp.split_type === "equal"
                            ? "Equal Split"
                            : "Percentage Split"}
                        </div>
                        <div className="text-sm">
                          My share: ₹{meSplit?.share.toFixed(2)}
                          {exp.split_type === "percentage" && (
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
                <p className="text-gray-600">No activity found.</p>
              )}
            </div>

            <div>
              {inGroup && settlements.length === 0 ? (
                <p className="text-green-700 font-medium">
                  You are settled in this group.
                </p>
              ) : inGroup ? (
                <>
                  <h4 className="font-medium">Settle-Up Suggestions:</h4>
                  <ul className="list-disc list-inside">
                    {settlements.map((s, i) => (
                      <li key={i}>
                        You {s.from === userId ? "owe" : "are owed"} ₹
                        {s.amount.toFixed(2)}{" "}
                        {s.from === userId ? "to" : "by"} User{" "}
                        {s.from === userId ? s.to : s.from}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
