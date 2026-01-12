import { useState, useContext, useEffect } from "react";
import { TaskContext } from "../contexts/TaskContext";
import { GroupContext } from "../contexts/GroupContext";

const CreateTaskModal = ({ onClose, onTaskCreated }) => {
  const { 
    createIndividualTask, 
    createGroupTask, 
    loadMyTasks, 
    users, 
    loadUsers 
  } = useContext(TaskContext);
  
  const { userGroups, checkIsAdmin } = useContext(GroupContext);

  const [form, setForm] = useState({
    assignmentType: "INDIVIDUAL",
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedUserId: "",
    groupId: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userGroupsWithAdmin, setUserGroupsWithAdmin] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (users.length === 0) {
          await loadUsers();
        }
        
        const adminGroups = userGroups.filter(group => group.isCurrentUserAdmin);
        setUserGroupsWithAdmin(adminGroups);
        
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, [userGroups]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (form.assignmentType === "INDIVIDUAL" && !form.assignedUserId) {
      newErrors.assignee = "Please select a user to assign this task to";
    }
    
    if (form.assignmentType === "GROUP") {
      if (!form.groupId) {
        newErrors.assignee = "Please select a group to assign this task to";
      } else if (!checkIsAdmin(form.groupId)) {
        newErrors.assignee = "You must be an admin of the group to create group tasks";
      }
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
      const taskData = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null
      };

      if (form.assignmentType === "INDIVIDUAL") {
        await createIndividualTask({
          ...taskData,
          assignedUserId: form.assignedUserId
        });
      } else {
        if (!checkIsAdmin(form.groupId)) {
          throw new Error("You must be an admin of the group to create group tasks");
        }
        
        await createGroupTask(form.groupId, taskData);
      }

      await loadMyTasks();
      if (onTaskCreated) onTaskCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert(`Failed to create task: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ 
      ...prev, 
      [field]: value,
      ...(field === "assignmentType" && {
        assignedUserId: "",
        groupId: ""
      })
    }));
    
    if (errors[field] || errors.assignee) {
      setErrors(prev => ({ 
        ...prev, 
        [field]: undefined,
        assignee: undefined 
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Create New Task</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Assignment Type Toggle */}
          <div className="flex gap-2 p-1 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleChange('assignmentType', 'INDIVIDUAL')}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${form.assignmentType === 'INDIVIDUAL' ? 'bg-white text-teal-700 shadow-lg border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Individual Task
            </button>
            <button
              type="button"
              onClick={() => handleChange('assignmentType', 'GROUP')}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${form.assignmentType === 'GROUP' ? 'bg-white text-teal-700 shadow-lg border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Group Task
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 ${errors.title ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-white'}`}
              placeholder="Enter task title"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
            {errors.title && <p className="text-red-500 text-sm mt-2 ml-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
              placeholder="Enter task description (optional)"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
            />
          </div>

          {/* Assignee Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {form.assignmentType === 'INDIVIDUAL' ? 'Assign To User' : 'Assign To Group'} 
              <span className="text-red-500">*</span>
            </label>
            
            {form.assignmentType === "INDIVIDUAL" ? (
              <select
                value={form.assignedUserId}
                onChange={(e) => handleChange('assignedUserId', e.target.value)}
                className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 ${errors.assignee ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-white'}`}
                required
              >
                <option value="">Select a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({user.email})
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <select
                  value={form.groupId}
                  onChange={(e) => handleChange('groupId', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 ${errors.assignee ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 hover:bg-white'}`}
                  required
                >
                  <option value="">Select a group...</option>
                  {userGroupsWithAdmin.length === 0 ? (
                    <option value="" disabled>
                      You are not an admin of any groups
                    </option>
                  ) : (
                    userGroupsWithAdmin.map(group => (
                      <option key={group.id} value={group.id}>
                        👑 {group.name} (Admin)
                      </option>
                    ))
                  )}
                </select>
                
                <p className="text-xs text-slate-500 mt-2 ml-1">
                  Only groups where you are an admin are shown
                </p>
              </div>
            )}
            
            {errors.assignee && <p className="text-red-500 text-sm mt-2 ml-1">{errors.assignee}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Priority
              </label>
              <select
                className="w-full border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
                value={form.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
            </div>
          </div>

          {/* Info Message */}
          <div className={`p-4 rounded-xl border ${form.assignmentType === 'INDIVIDUAL' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200' : 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.assignmentType === 'INDIVIDUAL' ? 'bg-blue-200' : 'bg-purple-200'}`}>
                {form.assignmentType === 'INDIVIDUAL' ? '📌' : '👑'}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {form.assignmentType === 'INDIVIDUAL' 
                    ? 'This task will be assigned to a single user.'
                    : form.groupId && checkIsAdmin(form.groupId)
                      ? 'You can create this task as a group admin'
                      : 'Group tasks can only be created by group admins'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${form.assignmentType === 'GROUP' && (!form.groupId || !checkIsAdmin(form.groupId)) ? 'bg-slate-400 text-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-500/30'}`}
              disabled={isSubmitting || (form.assignmentType === 'GROUP' && (!form.groupId || !checkIsAdmin(form.groupId)))}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  Create Task
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;