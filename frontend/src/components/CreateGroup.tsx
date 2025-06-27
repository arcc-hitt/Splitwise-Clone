import { useEffect, useState } from "react";
import { api } from "../api";
import type { GroupCreate, Group } from "../types";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const [userIds, setUserIds] = useState("");
  const [errors, setErrors] = useState<{ name?: string; userIds?: string }>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  // Fetch all groups from backend
  const fetchGroups = async () => {
    try {
      const res = await api.get<Group[]>("/groups/");
      setGroups(res.data);
    } catch {
      // silently ignore or set an error state if you wish
    }
  };

  // Load groups on mount
  useEffect(() => {
    fetchGroups();
  }, []);

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!name.trim()) {
      errs.name = "Group name is required.";
    }
    const ids = userIds.split(",").map((s) => s.trim());
    if (
      ids.length === 0 ||
      ids.some((s) => !/^\d+$/.test(s))
    ) {
      errs.userIds = "Enter one or more numeric IDs, comma-separated.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;

    const payload: GroupCreate = {
      name: name.trim(),
      user_ids: userIds.split(",").map((s) => Number(s.trim())),
    };

    try {
      const res = await api.post<Group>("/groups", payload);
      setMessage({ type: "success", text: `Group created with ID ${res.data.id}` });
      setName("");
      setUserIds("");
      setErrors({});
      fetchGroups();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.detail || err.message });
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl mb-4">Create Group</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Group Name</label>
          <input
            className={`w-full p-2 border rounded ${errors.name ? "border-red-500" : ""}`}
            placeholder="e.g. Weekend Trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block mb-1">User IDs (comma-separated)</label>
          <input
            className={`w-full p-2 border rounded ${errors.userIds ? "border-red-500" : ""}`}
            placeholder="e.g. 1,2,3"
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
          />
          {errors.userIds && <p className="text-red-600 text-sm mt-1">{errors.userIds}</p>}
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer"
        >
          Create
        </button>
      </form>

      {message && (
        <div
          className={`p-3 rounded ${message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}
        >
          {message.text}
        </div>
      )}
      <section className="mt-8">
        <h3 className="text-xl font-semibold mb-3">All Groups</h3>
        {groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g.id} className="p-4 border rounded bg-gray-50">
                <div className="flex justify-between">
                  <span className="font-medium">#{g.id} {g.name}</span>
                  <span>Total Spent: ₹{g.total_expenses.toFixed(2)}</span>
                </div>
                <div className="mt-2 text-sm">
                  Members: {g.user_ids.join(", ")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No groups have been created yet.</p>
        )}
      </section>
    </div>
  );
}
