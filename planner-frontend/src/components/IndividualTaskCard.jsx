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

  const currentUserId = localStorage.getItem('userId') || '';
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

            {/* Assigned User Info */}
            {task.assignedUserId && task.User && (
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>Assigned to: {task.User.name || "User"}</span>
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

            {canMarkComplete && !readOnly && (
              <button
                onClick={() => updateIndividualTaskStatus(task.id, "COMPLETED")}
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

          {isAssignedToMe && !isCreator && task.status !== 'COMPLETED' && !readOnly && (
            <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl text-sm text-blue-700 flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <span>You can mark this task as complete, but only the creator can edit its details.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IndividualTaskCard;