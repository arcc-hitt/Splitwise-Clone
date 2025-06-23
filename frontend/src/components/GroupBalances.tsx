import { useState } from "react";
import { api } from "../api";

export default function GroupBalances() {
  const [groupId, setGroupId] = useState("");
  const [balances, setBalances] = useState<Record<string, number>>({});

  const fetchBalances = async () => {
    try {
      const res = await api.get(`/groups/${groupId}/balances`);
      setBalances(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl mb-4">Group Balances</h2>
      <input
        className="w-full p-2 border rounded mb-2"
        placeholder="Group ID"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
      />
      <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={fetchBalances}>
        Fetch Balances
      </button>

      {Object.keys(balances).length > 0 && (
        <div className="mt-4 p-4 bg-indigo-50 rounded">
          {Object.entries(balances).map(([uid, amount]) => (
            <div key={uid}>
              User {uid}: {amount.toFixed(2)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
