import { useState, useContext } from "react";
import { GroupContext } from "../contexts/GroupContext";

const AddMemberModal = ({ groupId, onClose }) => {
  const { addMember, loadGroup } = useContext(GroupContext);
  const [userId, setUserId] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    await addMember(groupId, userId);
    await loadGroup(groupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-full max-w-sm">
        <h2 className="font-semibold mb-4">Add Member</h2>

        <form onSubmit={handleAdd} className="space-y-4">
          <input
            type="number"
            placeholder="User ID"
            className="w-full border px-3 py-2 rounded"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border px-3 py-1 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-700 text-white px-3 py-1 rounded"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
