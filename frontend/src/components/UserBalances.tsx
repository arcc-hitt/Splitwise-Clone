import { useState } from "react";
import { api } from "../api";

export default function UserBalances() {
  const [userId, setUserId] = useState("");
  const [balances, setBalances] = useState<Record<string, number>>({});

  const fetchBalances = async () => {
    try {
      const res = await api.get(`/users/${userId}/balances`);
      setBalances(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl mb-4">User Balances</h2>
      <input
        className="w-full p-2 border rounded mb-2"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={fetchBalances}>
        Fetch
      </button>

      {Object.keys(balances).length > 0 && (
        <div className="mt-4 p-4 bg-purple-50 rounded">
          {Object.entries(balances).map(([groupId, amount]) => (
            <div key={groupId}>
              Group {groupId}: {amount.toFixed(2)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
