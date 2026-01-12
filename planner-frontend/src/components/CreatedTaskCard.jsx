import { useState, useContext, useEffect } from "react";
import { TaskContext } from "../contexts/TaskContext";
import { GroupContext } from "../contexts/GroupContext";
import ParticipationBadge from "../components/ParticipationBadge";

const CreatedTaskCard = ({ task, onTaskUpdated, onTaskDeleted }) => {
  const {
    updateIndividualTask,
    updateGroupTask,
    updateTaskStatus,
    finalizeGroupTask,
    loadCreatedTasks,
    deleteTask,
    users,
    loadUsers,
    loadMyTasks
  } = useContext(TaskContext);

  const { groups: allGroups, checkIsAdmin } = useContext(GroupContext);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    assignedUserId: task.assignedUserId || "",
    groupId: task.groupId || "",
    status: task.status
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);

  const isGroupTask = task.assignmentType === "GROUP";
  const isFinalized = task.status === "COMPLETED";

  const getGroupName = (groupId) => {
    if (!groupId) return "No Group";
    
    if (Array.isArray(allGroups)) {
      const group = allGroups.find(g => g.id === groupId);
      return group ? group.name : `Group ${groupId}`;
    }
    
    if (allGroups && typeof allGroups === 'object') {
      if (allGroups[groupId] && typeof allGroups[groupId] === 'object') {
        return allGroups[groupId].name || `Group ${groupId}`;
      }
      return allGroups[groupId] || `Group ${groupId}`;
    }
    
    return `Group ${groupId}`;
  };

  useEffect(() => {
    const initializeData = async () => {
      if (isGroupTask && task.groupId) {
        const adminStatus = checkIsAdmin(task.groupId);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(true);
      }

      if (users.length === 0) {
        await loadUsers();
      }

      if (allGroups && allGroups.length > 0) {
        const adminGroups = allGroups.filter(group => checkIsAdmin(group.id));
        setAvailableGroups(adminGroups);
      }
    };

    initializeData();
  }, [isGroupTask, task.groupId, checkIsAdmin, users, allGroups]);

  useEffect(() => {
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      assignedUserId: task.assignedUserId || "",
      groupId: task.groupId || "",
      status: task.status
    });
  }, [task]);

  const handleSave = async () => {
    try {
      let updatedTask;
      
      if (task.assignmentType === "INDIVIDUAL") {
        updatedTask = await updateIndividualTask(task.id, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate || null,
          assignedUserId: form.assignedUserId,
          status: form.status
        });
      } else if (task.assignmentType === "GROUP" && isAdmin) {
        updatedTask = await updateGroupTask(task.id, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate || null
        });
        
        if (form.status !== task.status) {
          await updateTaskStatus(task.id, form.status);
        }
      } else {
        alert("You don't have permission to edit this task");
        return;
      }
  
      setTimeout(async () => {
        await loadCreatedTasks();
        setIsEditing(false);
        alert("Task updated successfully!");
      }, 300);
      
    } catch (error) {
      console.error("Failed to update task:", error);
      alert(`Failed to update task: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?\n\nThis action cannot be undone.")) {
      return;
    }
  
    try {
      await deleteTask(task.id);
      alert("Task deleted successfully!");
      
      if (onTaskDeleted) {
        onTaskDeleted(task.id);
      }
      
      await loadCreatedTasks();
      
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert(`Failed to delete task: ${error.message}`);
    }
  };

  const handleFinalize = async () => {
    try {
      if (!isAdmin) {
        alert("You must be a group admin to finalize this task");
        return;
      }

      if (!window.confirm("Are you sure you want to finalize this group task?\n\nOnce finalized:\n• Task status becomes COMPLETED\n• All participation will be locked\n• No further changes can be made")) {
        return;
      }

      await finalizeGroupTask(task.id, task.groupId);
      await loadCreatedTasks();
      alert("Task has been finalized successfully!");
    } catch (error) {
      console.error("Failed to finalize task:", error);
      alert("Failed to finalize task. Please try again.");
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canEdit = !isFinalized && (isGroupTask ? isAdmin : true);
  const canFinalize = isGroupTask && !isFinalized && isAdmin;

  const renderTaskTypeBadge = () => (
    <div className="flex items-center gap-3 mb-4">
      <span className={`inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full ${isGroupTask ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border border-purple-200" : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border border-blue-200"}`}>
        {isGroupTask ? (
          <>
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            GROUP TASK
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            INDIVIDUAL TASK
          </>
        )}
      </span>
      
      {isAdmin && (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700 rounded-full border border-teal-200">
          👑 Task Creator
        </span>
      )}
      
      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${form.status === 'COMPLETED' ? 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700 border-teal-200' : form.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-200' : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-200'}`}>
        {form.status === 'COMPLETED' ? '✅ ' : form.status === 'IN_PROGRESS' ? '🔄 ' : '📋 '}
        {form.status}
      </span>
    </div>
  );

  const renderEditForm = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Description
        </label>
        <textarea
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter task description"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Status
        </label>
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value)}
          disabled={isGroupTask && isFinalized}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        {isGroupTask && isFinalized && (
          <p className="text-xs text-slate-500 mt-2 ml-1">
            Status cannot be changed for finalized tasks
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Priority
        </label>
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
          value={form.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {task.assignmentType === "INDIVIDUAL" ? (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Assign To User <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
            value={form.assignedUserId}
            onChange={(e) => handleChange('assignedUserId', e.target.value)}
            required
          >
            <option value="">Select a user...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.email})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Assign To Group <span className="text-red-500">*</span>
          </label>
          <div className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50">
            {getGroupName(task.groupId)}
          </div>
          <p className="text-xs text-slate-500 mt-2 ml-1">
            Group assignment cannot be changed after creation
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Due Date (Optional)
        </label>
        <input
          type="date"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
          value={form.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-semibold shadow-lg shadow-teal-500/30"
        >
          Save Changes
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="px-5 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderTaskDetails = () => (
    <>
      <div>
        <h3 className="font-bold text-xl text-slate-900">{task.title}</h3>
        
        {isGroupTask && (
          <div className="inline-block ml-3">
            <ParticipationBadge taskId={task.id} />
          </div>
        )}
        
        {task.description && (
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">{task.description}</p>
        )}
        
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${task.priority === 'HIGH' ? 'bg-red-100 text-red-700 border-red-200' : task.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-teal-100 text-teal-700 border-teal-200'}`}>
                {task.priority} Priority
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${task.status === 'COMPLETED' ? 'bg-teal-100 text-teal-700 border-teal-200' : task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                {task.status}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {task.assignmentType === "INDIVIDUAL" && task.assignedUserId && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm text-slate-700">
                  Assigned to: <span className="font-semibold">{users.find(u => u.id === task.assignedUserId)?.name || users.find(u => u.id === task.assignedUserId)?.email || `User ${task.assignedUserId}`}</span>
                </span>
              </div>
            )}
            
            {task.assignmentType === "GROUP" && task.groupId && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm text-slate-700">
                  Group: <span className="font-semibold">{getGroupName(task.groupId)}</span>
                </span>
              </div>
            )}
            
            {task.dueDate && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className={`text-sm ${new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600 font-semibold' : 'text-slate-700'}`}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                  {new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">OVERDUE</span>
                  )}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-slate-700">
                Created: <span className="font-semibold">{new Date(task.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-200">
        {canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-300 rounded-xl hover:bg-slate-50 font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Task
          </button>
        )}

        {canFinalize && (
          <button
            onClick={handleFinalize}
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 font-semibold transition-all duration-200 shadow-lg shadow-teal-500/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Finalize Task
          </button>
        )}

        {canEdit && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2.5 text-sm border border-red-300 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Task
          </button>
        )}
      </div>
      
      <div className="mt-4">
        {isGroupTask && !isFinalized && !isAdmin && (
          <div className="p-3 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <span>Only group admins can edit or finalize this task</span>
          </div>
        )}
        
        {isGroupTask && isFinalized && (
          <div className="p-3 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-xl text-sm text-teal-700 flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Task finalized - No further edits allowed</span>
          </div>
        )}
        
        {task.assignmentType === "GROUP" && !isFinalized && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl text-xs text-blue-700">
            <span>Group tasks affect all members of the group</span>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-all duration-200">
      {renderTaskTypeBadge()}
      {isEditing ? renderEditForm() : renderTaskDetails()}
    </div>
  );
};

export default CreatedTaskCard;