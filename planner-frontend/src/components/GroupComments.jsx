import { useState, useEffect } from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

const GroupComments = ({ groupId, isOpen, onClose }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return 'https://planner-application-2kgd.onrender.com';
  };

  const fetchComments = async () => {
    if (!groupId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const apiBase = getApiBaseUrl();
      const endpoint = `${apiBase}/api/comments/group/${groupId}`;
      
      console.log("Fetching group comments from:", endpoint);
      
      const response = await fetch(endpoint, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication failed");
        }
        
        const errorText = await response.text();
        console.error("Error response:", errorText.substring(0, 200));
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching group comments:", err);
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

      const apiBase = getApiBaseUrl();
      const endpoint = `${apiBase}/api/comments/group/${groupId}`;

      console.log("Adding group comment to:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Add comment error:", errorText.substring(0, 200));
        
        if (response.status === 401) {
          throw new Error("Please log in again");
        }
        
        throw new Error(`Failed to add comment: ${response.status}`);
      }

      const newComment = await response.json();
      setComments(prevComments => [...prevComments, newComment]);
    } catch (err) {
      console.error("Error adding group comment:", err);
      alert(`Failed to add comment: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isOpen && groupId) {
      fetchComments();
    }
  }, [isOpen, groupId]);

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Group Chat</h3>
            <p className="text-sm text-slate-600">Discuss with group members</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-teal-200 border-t-teal-600 mx-auto"></div>
            <p className="text-sm text-slate-500 mt-3">Loading comments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">
              <p className="font-medium">Error loading chat</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchComments}
                className="mt-3 px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto pr-2 mb-6">
              <CommentList comments={comments} />
            </div>
            <div className="border-t border-slate-200 pt-6">
              <CommentForm onSubmit={handleAddComment} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupComments;