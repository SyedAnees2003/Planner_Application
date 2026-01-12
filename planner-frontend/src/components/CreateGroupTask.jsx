import { useState, useContext, useEffect } from "react";
import { TaskContext } from "../contexts/TaskContext";
import { GroupContext } from "../contexts/GroupContext";

const CreateGroupTask = ({ groupId, onClose, onCreated }) => {
  const { createGroupTask } = useContext(TaskContext);
  const { checkIsAdmin } = useContext(GroupContext);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  // Check if user is admin when component mounts
  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        const adminStatus = checkIsAdmin(groupId);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          setPermissionError("You must be a group admin to create group tasks");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setPermissionError("Unable to verify your permissions");
      }
    };

    verifyAdminStatus();
  }, [groupId, checkIsAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Double-check admin status
    if (!isAdmin) {
      alert("Permission denied. You must be a group admin to create tasks.");
      return;
    }

    if (!form.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    setIsSubmitting(true);

    try {
      await createGroupTask(groupId, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null
      });

      onCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create group task:", error);
      
      if (error.response?.status === 403) {
        alert("Permission denied. You are not authorized to create tasks in this group.");
      } else {
        alert(`Failed to create task: ${error.message || "Please try again"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // If not admin, show permission error
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mb-4">
              <span className="text-2xl">⛔</span>
            </div>
            
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Permission Required
            </h2>
            
            <p className="text-gray-600 mb-6">
              {permissionError || "You must be a group admin to create group tasks."}
            </p>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Create Group Task
          </h2>
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full font-medium">
            👑 Admin Only
          </span>
        </div>

        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded">
          <p className="text-sm text-purple-800">
            <span className="font-medium">Admin Privilege:</span> This task will be assigned to all members of the group.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter task title"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Enter task description (optional)"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupTask;