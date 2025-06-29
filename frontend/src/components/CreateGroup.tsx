import { useState } from 'react';
import { useGroups } from '../hooks/useGroups';
import { useCreateGroup } from '../hooks/useCreateGroup';
import { Spinner } from './layout/Spinner';
import type { GroupCreate } from '../types';
import { useUpdateGroup } from '../hooks/useUpdateGroup';
import Modal from './Modal';
import { useDeleteGroup } from '../hooks/useDeleteGroup';

export default function CreateGroup() {
  // --- Hooks ---
  const { groups, loading: loadingGroups, error: errGroups, refresh } = useGroups();
  const { createGroup, loading: creating, error: errCreate } = useCreateGroup(refresh);
  const { update: updateGroup, loading: updating, error: errUpdate } = useUpdateGroup(refresh);
  const { deleteGroup, loading: deleting, error: errDelete } = useDeleteGroup(refresh);

  // --- Create form state ---
  const [name, setName] = useState('');
  const [userIds, setUserIds] = useState('');
  const [formError, setFormError] = useState<{ name?: string; userIds?: string }>({});

  // --- Add Users Modal state ---
  const [addModalGroupId, setAddModalGroupId] = useState<number | null>(null);
  const [addInput, setAddInput] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // --- Delete Users Modal state ---
  const [delModalGroupId, setDelModalGroupId] = useState<number | null>(null);
  const [delInput, setDelInput] = useState('');
  const [delError, setDelError] = useState<string | null>(null);

  // --- Delete Group modal state ---
  const [delGrpModalId, setDelGrpModalId] = useState<number|null>(null);
  const [delGrpError, setDelGrpError] = useState<string|null>(null);

  // --- Create form handlers ---
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

  // --- Open/close modals ---
  const openAdd = (gid: number) => { setAddModalGroupId(gid); setAddInput(''); setAddError(null); };
  const closeAdd = () => setAddModalGroupId(null);
  const openDel = (gid: number) => { setDelModalGroupId(gid); setDelInput(''); setDelError(null); };
  const closeDel = () => setDelModalGroupId(null);
  const openDelGroup = (gid: number) => { setDelGrpModalId(gid); setDelGrpError(null); };
  const closeDelGroup = () => setDelGrpModalId(null);

  // --- Handle Add Users ---
  const handleAddUsers = () => {
    if (!addModalGroupId) return;
    if (!/^\d+(,\d+)*$/.test(addInput.trim())) {
      setAddError('Enter comma-separated numeric IDs.');
      return;
    }
    const ids = addInput.split(',').map(s => +s.trim());
    const group = groups.find(g => g.id === addModalGroupId)!;
    const alreadyPresent = ids.filter(id => group.user_ids.includes(id));
    if (alreadyPresent.length > 0) {
      setAddError(
        `User ID${alreadyPresent.length > 1 ? 's' : ''} ${alreadyPresent.join(', ')} already ${alreadyPresent.length > 1 ? 'exist' : 'exists'} in the group.`
      );
      return;
    }
    const mergedIds = Array.from(new Set([...group.user_ids, ...ids]));
    updateGroup(addModalGroupId, mergedIds)
      .then(() => closeAdd())
      .catch(() => setAddError(errUpdate || 'Failed to add.'));
  };

  // --- Handle Delete Users ---
  const handleDeleteUsers = () => {
    if (delModalGroupId === null) return;
    if (!/^\d+(,\d+)*$/.test(delInput.trim())) {
      setDelError('Enter comma-separated numeric IDs.');
      return;
    }
    const rmIds = delInput.split(',').map(s => +s.trim());
    const grp = groups.find(g => g.id === delModalGroupId)!;
    const missing = rmIds.filter(id => !grp.user_ids.includes(id));
    if (missing.length) {
      setDelError(`User ID${missing.length > 1 ? 's' : ''} ${missing.join(', ')} not in group.`);
      return;
    }
    // new full list = existing minus removed
    const updated = grp.user_ids.filter(id => !rmIds.includes(id));
    updateGroup(delModalGroupId, updated)
      .then(() => closeDel())
      .catch(() => setDelError(errUpdate || 'Failed to delete.'));
  };

  // --- Handle Delete Group ---
  const handleDeleteGroup = () => {
    if (delGrpModalId === null) return;
    deleteGroup(delGrpModalId)
      .then(closeDelGroup)
      .catch(() => setDelGrpError(errDelete || 'Failed to delete.'));
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
              <li
                key={g.id}
                className="p-4 border rounded bg-gray-50 flex justify-between items-start"
              >
                <div>
                  <div className="font-medium">#{g.id} {g.name}</div>
                  <p className="text-sm">
                    Members: {g.user_ids.join(', ')}<br />
                    Total: ₹{g.total_expenses.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col space-y-1 items-end">
                  <button
                    onClick={() => openAdd(g.id)}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    Add Users
                  </button>
                  <button
                    onClick={() => openDel(g.id)}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    Delete Users
                  </button>
                  <button onClick={()=>openDelGroup(g.id)} className="text-gray-800 hover:underline cursor-pointer">
                    Delete Group
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No groups have been created yet.</p>
        )}
      </section>

      {/* Modal for Adding Users */}
      <Modal
        isOpen={addModalGroupId !== null}
        title={`Add Users to Group#${addModalGroupId}`}
        onClose={closeAdd}
        footer={
          <>
            <button
              onClick={closeAdd}
              className="px-4 py-2 rounded border cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUsers}
              disabled={updating}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {updating ? 'Adding…' : 'Add'}
            </button>
          </>
        }
      >
        <input
          className={`w-full p-2 border rounded ${addError ? 'border-red-500' : ''}`}
          placeholder="e.g. 4,5,6"
          value={addInput}
          onChange={e => setAddInput(e.target.value)}
        />
        {addError && <p className="text-red-600 text-sm mt-1">{addError}</p>}
        {errUpdate && !addError && <p className="text-red-600 text-sm mt-1">{errUpdate}</p>}
      </Modal>

      {/* Delete Users Modal */}
      <Modal
        isOpen={delModalGroupId !== null}
        title={`Remove Users from #${delModalGroupId}`}
        onClose={closeDel}
        footer={
          <>
            <button onClick={closeDel} className="px-4 py-2 rounded border cursor-pointer">Cancel</button>
            <button
              onClick={handleDeleteUsers}
              disabled={updating}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {updating?'Removing…':'Remove'}
            </button>
          </>
        }
      >
        <input
          className={`w-full p-2 border rounded ${delError?'border-red-500':''}`}
          placeholder="e.g. 2,3"
          value={delInput}
          onChange={e=>setDelInput(e.target.value)}
        />
        {delError && <p className="text-red-600 text-sm mt-1">{delError}</p>}
      </Modal>

      {/* Delete Group Modal */}
      <Modal
        isOpen={delGrpModalId !== null}
        title={`Delete Group #${delGrpModalId}?`}
        onClose={closeDelGroup}
        footer={
          <>
            <button onClick={closeDelGroup} className="px-4 py-2 rounded border cursor-pointer">Cancel</button>
            <button
              onClick={handleDeleteGroup}
              disabled={deleting}
              className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
            >
              {deleting?'Deleting…':'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          This will remove the group and all its data. This action cannot be undone.
        </p>
        {delGrpError && <p className="text-red-600 text-sm mt-1">{delGrpError}</p>}
      </Modal>
    </div>
  );
}
