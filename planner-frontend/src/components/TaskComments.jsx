import { useState, useEffect } from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

const TaskComments = ({ taskId, taskType, isOpen, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the correct API base URL
  const getApiBaseUrl = () => {
    // Check if we're in development or production
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5000'; // Your backend port
    }
    return ''; // Same origin in production
  };

  const fetchComments = async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/comments/task/${taskId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      console.log("Comments response status:", response.status);
      
      if (!response.ok) {
        // Check if it's an authentication error
        if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication failed. Please log in again.");
        }
        
        // Try to parse error message
        const errorText = await response.text();
        console.error("Error response:", errorText);
        
        // Check if it's HTML
        if (errorText.trim().startsWith("<!DOCTYPE") || errorText.trim().startsWith("<html")) {
          throw new Error("Server returned HTML instead of JSON. Check API endpoint.");
        }
        
        throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      console.log("Comments data received:", data);
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Determine the correct endpoint based on task type
      const apiBase = getApiBaseUrl();
      let endpoint;
      
      if (taskType === "group") {
        endpoint = `${apiBase}/api/comments/task/group/${taskId}`;
      } else {
        // For individual tasks
        endpoint = `${apiBase}/api/comments/task/individual/${taskId}`;
      }

      console.log("Adding comment to:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      console.log("Add comment response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Add comment error response:", errorText);
        
        if (errorText.trim().startsWith("<!DOCTYPE") || errorText.trim().startsWith("<html")) {
          throw new Error("Invalid API endpoint. Check your routes.");
        }
        
        throw new Error(`Failed to add comment: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const newComment = await response.json();
      console.log("New comment added:", newComment);
      
      // Add the new comment to the list
      setComments(prevComments => [...prevComments, newComment]);
    } catch (err) {
      console.error("Error adding comment:", err);
      alert(`Failed to add comment: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchComments();
    }
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-900">Comments</h3>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-200 border-t-teal-600 mx-auto"></div>
          <p className="text-sm text-slate-500 mt-2">Loading comments...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <div className="text-red-600 bg-red-50 p-3 rounded-lg">
            <p className="font-medium">Error loading comments</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchComments}
              className="mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <CommentList comments={comments} />
          <div className="mt-4">
            <CommentForm onSubmit={handleAddComment} />
          </div>
        </>
      )}
    </div>
  );
};

export default TaskComments;