import { useState, useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";
import TaskComments from "./TaskComments";

const IndividualTaskCard = ({ task, readOnly = false }) => {
  const {
    updateIndividualTask,
    updateIndividualTaskStatus,
    loadMyTasks
  } = useContext(TaskContext);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split("T")[0] : ""
  );
  
  // Comments state
  const [showComments, setShowComments] = useState(false);

  const currentUserId = Number(localStorage.getItem('userId'));
  const isCreator = task.createdBy === currentUserId;
  const isAssignedToMe = task.assignedUserId === currentUserId;
  const canEdit = isCreator;
  const canMarkComplete = isAssignedToMe && task.status !== "COMPLETED";
  
  const handleSave = async () => {
    await updateIndividualTask(task.id, {
      title,
      priority,
      dueDate: dueDate || null
    });
    await loadMyTasks();
    setIsEditing(false);
  };

const handleStatusUpdate = async (newStatus) => {
  if (newStatus === task.status) return;

  try {
    await updateIndividualTaskStatus(task.id, newStatus);
  } catch (error) {
    console.error("Failed to update task status:", error);
  }
};


  const getAvailableStatuses = () => {
    const allStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
    
    // If task is completed, only allow to keep it as COMPLETED
    if (task.status === "COMPLETED") {
      return ["COMPLETED"];
    }
    
    // If task is IN_PROGRESS, allow to go back to PENDING or forward to COMPLETED
    if (task.status === "IN_PROGRESS") {
      return ["IN_PROGRESS", "PENDING", "COMPLETED"];
    }
    
    // If task is PENDING, allow to go to IN_PROGRESS or stay PENDING
    if (task.status === "PENDING") {
      return ["PENDING", "IN_PROGRESS"];
    }
    
    return [task.status];
  };

  const getStatusTransitionOptions = () => {
    const current = task.status;
    const allStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
    
    if (current === "COMPLETED") {
      return [{ value: "COMPLETED", label: "Completed" }];
    }
    
    return allStatuses.map(status => ({
      value: status,
      label: status.replace("_", " "),
      disabled: false
    }));
  };

  const priorityStyles = {
    HIGH: 'bg-red-100 text-red-700 border-red-200',
    MEDIUM: 'bg-orange-100 text-orange-700 border-orange-200',
    LOW: 'bg-teal-100 text-teal-700 border-teal-200'
  };

  const statusStyles = {
    COMPLETED: 'bg-teal-100 text-teal-700 border border-teal-200',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border border-blue-200',
    PENDING: 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Toggle comments visibility
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.dueDate || task.status === "COMPLETED") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-200">
      {/* Task Header */}
      <div className="flex justify-between items-start mb-5">
        <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${statusStyles[task.status] || 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
          {task.status.replace("_", " ")}
        </span>
        
        {isCreator && !readOnly && (
          <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700 border border-teal-200">
            Created by you
          </span>
        )}
        
        {isAssignedToMe && !isCreator && !readOnly && (
          <span className="px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border border-blue-200">
            Assigned to you
          </span>
        )}
      </div>

      {isEditing ? (
        // Edit Mode
        <div className="space-y-5">
          <input
            className="w-full border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />

          <select
            className="w-full border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>

          <input
            type="date"
            className="w-full border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

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
      ) : (
        // View Mode
        <>
          <h3 className="font-bold text-xl text-slate-900 mb-4">{task.title}</h3>
          
          {task.description && (
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">{task.description}</p>
          )}
          
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${priorityStyles[task.priority] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {task.priority} Priority
              </span>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex items-center gap-3">
                  <span>Due: {formatDate(task.dueDate)}</span>
                  {isOverdue() && (
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">OVERDUE</span>
                  )}
                </div>
              </div>
            )}

            {/* STATUS UPDATE - ASSIGNED USER CAN UPDATE STATUS */}
            {isAssignedToMe && !readOnly && (
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">
                    Update Status:
                  </label>
                  <div className="flex gap-2">
                    {getAvailableStatuses().map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        disabled={status === task.status}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          status === task.status
                            ? statusStyles[status]
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {status === "COMPLETED" ? "✓ Complete" : status.replace("_", " ")}
                      </button>
                    ))}
                    
                    {/* Dropdown for more options */}
                    {getAvailableStatuses().length < 3 && task.status !== "COMPLETED" && (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className="border border-slate-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value={task.status}>
                          Change to...
                        </option>
                        {getStatusTransitionOptions()
                          .filter(opt => opt.value !== task.status)
                          .map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assigned User Info */}
            {task.assignedUserId && task.User && (
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <span>Assigned to: <strong>{task.User.name || "User"}</strong></span>
                  {isAssignedToMe && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                      You
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-5 border-t border-slate-200">
            {/* Comments Button */}
            <button
              onClick={toggleComments}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl font-medium transition-all duration-200 ${
                showComments 
                  ? "bg-teal-100 text-teal-700 border border-teal-200"
                  : "border border-slate-300 hover:bg-slate-50 text-slate-600"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={showComments ? 2 : 1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {showComments ? "Hide Comments" : "Comments"}
            </button>

            {canEdit && !readOnly && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm border border-slate-300 rounded-xl hover:bg-slate-50 font-medium transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}

            {/* Quick Complete Button for assigned users */}
            {isAssignedToMe && !readOnly && task.status !== "COMPLETED" && (
              <button
                onClick={() => handleStatusUpdate("COMPLETED")}
                className="flex items-center gap-2 px-4 py-2.5 text-sm bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 font-semibold transition-all duration-200 shadow-lg shadow-teal-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark Complete
              </button>
            )}
            
            {task.status === "COMPLETED" && (
              <span className="flex items-center gap-2 px-4 py-2.5 text-sm bg-teal-100 text-teal-700 rounded-xl font-semibold border border-teal-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </span>
            )}
          </div>
          
          {/* Comments Section */}
          {showComments && (
            <div className="mt-6 pt-6 border-t border-slate-200 animate-fadeIn">
              <TaskComments
                taskId={task.id}
                taskType="individual"
                isOpen={true}
                onClose={() => setShowComments(false)}
              />
            </div>
          )}

          {/* Info Box */}
          {isAssignedToMe && !isCreator && !readOnly && (
            <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <div>
                <p className="font-semibold mb-1">Assigned User Permissions:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>You can update the task status (Pending → In Progress → Complete)</li>
                  <li>You can mark the task as complete with one click</li>
                  <li>You can add comments to the task</li>
                  <li>Only the task creator can edit task details (title, priority, due date)</li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IndividualTaskCard;