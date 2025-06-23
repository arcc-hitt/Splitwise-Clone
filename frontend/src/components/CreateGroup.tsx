import { useState } from "react";
import { api } from "../api";
import type { GroupCreate, Group } from "../types";

export default function CreateGroup() {
  const [name, setName] = useState("");
  const [userIds, setUserIds] = useState("");
  const [result, setResult] = useState<Group | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = userIds.split(",").map((id) => Number(id.trim()));
    const payload: GroupCreate = { name, user_ids: ids };

    try {
      const res = await api.post<Group>("/groups", payload);
      setResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl mb-4">Create Group</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="User IDs (comma separated)"
          value={userIds}
          onChange={(e) => setUserIds(e.target.value)}
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
          Create
        </button>
      </form>

      {result && (
        <pre className="mt-4 bg-green-50 p-4 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
