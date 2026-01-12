import { useState } from "react";
import TaskComments from "./TaskComments";

const TaskCard = ({ task, taskType = "individual", onTaskUpdated }) => {
  const priorityColors = {
    HIGH: 'bg-red-100 text-red-700 border-red-200',
    MEDIUM: 'bg-orange-100 text-orange-700 border-orange-200',
    LOW: 'bg-teal-100 text-teal-700 border-teal-200'
  };

  const statusColors = {
    COMPLETED: "bg-teal-100 text-teal-700 border border-teal-200",
    IN_PROGRESS: "bg-blue-100 text-blue-700 border border-blue-200",
    PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200"
  };

  // State to manage open comment sections
  const [openCommentsTaskId, setOpenCommentsTaskId] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // Function to toggle comments
  const toggleComments = () => {
    if (openCommentsTaskId === task.id) {
      setOpenCommentsTaskId(null);
      setShowComments(false);
    } else {
      setOpenCommentsTaskId(task.id);
      setShowComments(true);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Function to format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(dateString);
  };

  // Get the actual task object (handles group tasks which have nested structure)
  const actualTask = task.task || task;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900 mb-1">{actualTask.title}</h3>
          {actualTask.group && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{actualTask.group.name}</span>
            </div>
          )}
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[actualTask.status] || "bg-gray-100 text-gray-700 border border-gray-200"}`}
        >
          {actualTask.status.replace("_", " ")}
        </span>
      </div>

      {/* Description */}
      {actualTask.description && (
        <p className="text-sm text-slate-600 mb-5 line-clamp-2 leading-relaxed">
          {actualTask.description}
        </p>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border ${priorityColors[actualTask.priority] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
            {actualTask.priority} Priority
          </span>
        </div>

        {actualTask.dueDate && (
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">Due: {formatDate(actualTask.dueDate)}</span>
              {actualTask.dueDate && new Date(actualTask.dueDate) < new Date() && actualTask.status !== "COMPLETED" && (
                <span className="text-xs text-red-600 font-medium mt-1">
                  Overdue
                </span>
              )}
            </div>
          </div>
        )}

        {/* Assigned User (for individual tasks) */}
        {actualTask.assignedUserId && actualTask.User && (
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span>Assigned to: {actualTask.User.name}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Comments Button */}
          <button
            onClick={toggleComments}
            className={`flex items-center gap-2 transition-colors duration-200 ${
              openCommentsTaskId === task.id 
                ? "text-teal-700 font-semibold" 
                : "text-slate-600 hover:text-teal-700"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={openCommentsTaskId === task.id ? 2 : 1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm">Comments</span>
          </button>

          {/* Status Update Button (if applicable) */}
          {actualTask.status !== "COMPLETED" && (
            <button
              onClick={() => {
                if (onTaskUpdated) {
                  onTaskUpdated(actualTask.id, { status: "COMPLETED" });
                }
              }}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Mark Complete</span>
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500">
          Updated {formatRelativeTime(actualTask.updatedAt)}
        </span>
      </div>

      {/* Comments Section */}
      {showComments && openCommentsTaskId === task.id && (
        <div className="mt-4 animate-fadeIn">
          <TaskComments
            taskId={actualTask.id}
            taskType={actualTask.groupId ? "group" : "individual"}
            isOpen={true}
            onClose={() => {
              setOpenCommentsTaskId(null);
              setShowComments(false);
            }}
            onCommentAdded={() => {
              // You could add logic here to refresh task data if needed
              if (onTaskUpdated) {
                onTaskUpdated(actualTask.id);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TaskCard;