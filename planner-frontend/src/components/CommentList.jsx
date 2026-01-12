const CommentList = ({ comments }) => {
  if (!Array.isArray(comments) || comments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {comment.User?.name?.charAt(0) || "U"}
            </div>
            <div>
              <span className="font-semibold text-slate-900">{comment.User?.name || "User"}</span>
              <span className="text-slate-500 text-sm ml-3">
                {new Date(comment.createdAt).toLocaleDateString()} at{" "}
                {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <p className="text-slate-700 whitespace-pre-wrap">{comment.content}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentList;