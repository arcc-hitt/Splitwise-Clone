import { useState } from "react";
import { api } from "../api";
import type { ExpenseCreate, SplitType, Split } from "../types";

export default function AddExpense() {
  const [form, setForm] = useState<Omit<ExpenseCreate, "splits"> & { splitsRaw: string }>({
    description: "",
    amount: 0,
    paid_by: 0,
    split_type: "equal",
    splitsRaw: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [groupId, setGroupId] = useState("");

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!/^\d+$/.test(groupId)) errs.groupId = "Enter a valid group ID.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (form.amount <= 0) errs.amount = "Amount must be greater than zero.";
    if (form.paid_by <= 0) errs.paid_by = "Payer user ID is required.";

    if (form.split_type === "percentage") {
      const parts = form.splitsRaw.split(",").map((s) => s.trim());
      if (
        parts.length === 0 ||
        parts.some((p) => {
          const [u, pct] = p.split(":");
          return !/^\d+$/.test(u) || isNaN(Number(pct));
        })
      ) {
        errs.splitsRaw = "Use format `id:percent`, comma-separated.";
      } else {
        const total = parts.reduce((sum, p) => sum + Number(p.split(":")[1]), 0);
        if (total !== 100) errs.splitsRaw = "Percentages must add up to 100.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;

    const payload: ExpenseCreate = {
      description: form.description.trim(),
      amount: form.amount,
      paid_by: form.paid_by,
      split_type: form.split_type as SplitType,
    };

    if (form.split_type === "percentage") {
      payload.splits = form.splitsRaw.split(",").map<Split>((s) => {
        const [uid, pct] = s.split(":");
        return { user_id: Number(uid), share: Number(pct) };
      });
    }

    try {
      await api.post(`/groups/${groupId}/expenses/`, payload);
      setMessage({ type: "success", text: "Expense added successfully." });
      setGroupId("");
      setForm({ description: "", amount: 0, paid_by: 0, split_type: "equal", splitsRaw: "" });
      setErrors({});
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.detail || err.message });
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl mb-4">Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Group ID</label>
          <input
            className={`w-full p-2 border rounded ${errors.groupId ? "border-red-500" : ""}`}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            placeholder="e.g. 1"
          />
          {errors.groupId && <p className="text-red-600 text-sm mt-1">{errors.groupId}</p>}
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <input
            className={`w-full p-2 border rounded ${errors.description ? "border-red-500" : ""}`}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block mb-1">Amount</label>
          <input
            type="number"
            className={`w-full p-2 border rounded ${errors.amount ? "border-red-500" : ""}`}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            placeholder="e.g. 2500"
          />
          {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount}</p>}
        </div>

        <div>
          <label className="block mb-1">Paid By (User ID)</label>
          <input
            type="number"
            className={`w-full p-2 border rounded ${errors.paid_by ? "border-red-500" : ""}`}
            value={form.paid_by}
            onChange={(e) => setForm({ ...form, paid_by: Number(e.target.value) })}
            placeholder="e.g. 2"
          />
          {errors.paid_by && <p className="text-red-600 text-sm mt-1">{errors.paid_by}</p>}
        </div>

        <div>
          <label className="block mb-1">Split Type</label>
          <select
            className="w-full p-2 border rounded"
            value={form.split_type}
            onChange={(e) => setForm({ ...form, split_type: e.target.value as SplitType })}
          >
            <option value="equal">Equal</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>

        {form.split_type === "percentage" && (
          <div>
            <label className="block mb-1">Splits (id:percent,...)</label>
            <input
              className={`w-full p-2 border rounded ${errors.splitsRaw ? "border-red-500" : ""}`}
              value={form.splitsRaw}
              onChange={(e) => setForm({ ...form, splitsRaw: e.target.value })}
              placeholder="e.g. 1:50,2:30,3:20"
            />
            {errors.splitsRaw && <p className="text-red-600 text-sm mt-1">{errors.splitsRaw}</p>}
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
        >
          Add Expense
        </button>
      </form>
      {message && (
        <div
          className={`p-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
