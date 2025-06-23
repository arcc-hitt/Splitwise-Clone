import { useState } from "react";
import { api } from "../api";
import type { ExpenseCreate, SplitType } from "../types";

export default function AddExpense() {
  const [form, setForm] = useState<ExpenseCreate>({
    description: "",
    amount: 0,
    paid_by: 0,
    split_type: "equal",
  });
  const [groupId, setGroupId] = useState("");
  const [splitsRaw, setSplitsRaw] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ExpenseCreate = {
      ...form,
      amount: Number(form.amount),
      paid_by: Number(form.paid_by),
    };

    if (form.split_type === "percentage") {
      payload.splits = splitsRaw.split(",").map((s) => {
        const [uid, share] = s.split(":");
        return { user_id: Number(uid), share: Number(share) };
      });
    }

    try {
      const res = await api.post(`/groups/${groupId}/expenses`, payload);
      alert("Expense added successfully!");
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl mb-4">Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Group ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
        />
        <input
          className="w-full p-2 border rounded"
          type="number"
          placeholder="Paid By (User ID)"
          value={form.paid_by}
          onChange={(e) => setForm({ ...form, paid_by: Number(e.target.value) })}
        />
        <select
          className="w-full p-2 border rounded"
          value={form.split_type}
          onChange={(e) =>
            setForm({ ...form, split_type: e.target.value as SplitType })
          }
        >
          <option value="equal">Equal</option>
          <option value="percentage">Percentage</option>
        </select>
        {form.split_type === "percentage" && (
          <input
            className="w-full p-2 border rounded"
            placeholder="Splits (e.g. 1:50,2:50)"
            value={splitsRaw}
            onChange={(e) => setSplitsRaw(e.target.value)}
          />
        )}
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Add Expense
        </button>
      </form>
    </div>
  );
}
