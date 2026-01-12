import { useState, useContext, useEffect } from "react";
import { TaskContext } from "../contexts/TaskContext";
import AssigneeSelector from "./AssigneeSelector";

const CreateIndividualTaskModal = ({ onClose }) => {
  const { createIndividualTask, loadMyTasks, users, loadUsers } = useContext(TaskContext);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedUserId: "" // CRITICAL: This was missing!
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users if not already loaded
  useEffect(() => {
    if (users.length === 0) {
      loadUsers();
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!form.assignedUserId) {
      newErrors.assignedUserId = "Please select a user to assign this task to";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createIndividualTask({
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null,
        assignedUserId: form.assignedUserId // This is required by backend
      });

      await loadMyTasks();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert(`Failed to create task: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          Create Individual Task
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full border rounded px-3 py-2 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter task title"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter task description (optional)"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
            />
          </div>

          {/* Assignee Selector */}
          <AssigneeSelector
            type="INDIVIDUAL"
            selectedValue={form.assignedUserId}
            onChange={(e) => handleChange('assignedUserId', e.target.value)}
            users={users}
            label="Assign To User"
            required={true}
            error={!!errors.assignedUserId}
          />

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
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
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={form.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </div>

          {/* Buttons */}
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

export default CreateIndividualTaskModal;