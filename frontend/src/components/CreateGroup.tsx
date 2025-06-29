import { useState } from 'react';
import { useGroups } from '../hooks/useGroups';
import { useCreateGroup } from '../hooks/useCreateGroup';
import { Spinner } from './layout/Spinner';
import type { GroupCreate } from '../types';

export default function CreateGroup() {
  const { groups, loading: loadingGroups, error: errGroups, refresh } = useGroups();
  const { createGroup, loading: creating, error: errCreate } = useCreateGroup(refresh);

  const [name, setName] = useState('');
  const [userIds, setUserIds] = useState('');
  const [formError, setFormError] = useState<{ name?: string; userIds?: string }>({});

  const validate = () => {
    const e: typeof formError = {};
    if (!name.trim()) e.name = 'Group name is required.';
    
    const ids = userIds.split(",").map((s) => s.trim());
    if (
      ids.length === 0 ||
      ids.some((s) => !/^\d+$/.test(s))
    ) {
      e.userIds = "Enter one or more numeric IDs, comma-separated.";
    }
    else if (ids.length > 10) {
      e.userIds = "Maximum 10 user IDs allowed.";
    }
    setFormError(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: GroupCreate = {
      name: name.trim(),
      user_ids: userIds.split(',').map((s) => +s.trim()),
    };
    createGroup(payload);
    setName('');
    setUserIds('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Create Group</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Group Name</label>
          <input
            className={`w-full p-2 border rounded ${formError.name ? 'border-red-500' : ''}`}
            placeholder="e.g. Weekend Trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {formError.name && <p className="text-red-600 text-sm">{formError.name}</p>}
        </div>

        <div>
          <label className="block mb-1">User IDs <span className="text-gray-500 text-xs">(Comma-separated)</span> </label>
          <input
            className={`w-full p-2 border rounded ${formError.userIds ? 'border-red-500' : ''}`}
            placeholder="e.g. 1,2,3"
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
          />
          {formError.userIds && <p className="text-red-600 text-sm">{formError.userIds}</p>}
        </div>

        <button
          type="submit"
          disabled={creating}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
        >
          {creating ? 'Creating…' : 'Create'}
        </button>

        {errCreate && <p className="text-red-600">{errCreate}</p>}
      </form>

      <section className="pt-6 space-y-4">
        <h2 className="text-xl font-semibold">All Groups</h2>
        {loadingGroups ? (
          <Spinner />
        ) : errGroups ? (
          <p className="text-red-600">{errGroups}</p>
        ) : groups.length ? (
          <ul className="space-y-4">
            {groups.map((g) => (
              <li key={g.id} className="p-4 border rounded bg-gray-50">
                <div className="flex justify-between">
                  <span className="font-medium">#{g.id} {g.name}</span>
                  <span>Total ₹{g.total_expenses.toFixed(2)}</span>
                </div>
                <p className="text-sm">Members: {g.user_ids.join(', ')}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No groups have been created yet.</p>
        )}
      </section>
    </div>
  );
}
