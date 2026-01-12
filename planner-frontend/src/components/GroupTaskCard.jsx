const GroupTaskCard = ({ task, participationCompleted }) => {
  const priorityStyles = {
    HIGH: 'bg-red-100 text-red-700 border-red-200',
    MEDIUM: 'bg-orange-100 text-orange-700 border-orange-200',
    LOW: 'bg-teal-100 text-teal-700 border-teal-200'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg text-slate-900">{task.title}</h3>
        <span
          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${task.status === "COMPLETED" ? "bg-teal-100 text-teal-700" : "bg-yellow-100 text-yellow-700"}`}
        >
          {task.status}
        </span>
      </div>

      {task.description && (
        <p className="text-sm text-slate-600 mb-5 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="font-semibold">Group Task</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${priorityStyles[task.priority]}`}>
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
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div
        className={`flex items-center gap-3 text-sm font-semibold px-4 py-3.5 rounded-xl ${participationCompleted ? "bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 border border-teal-200" : "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200"}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${participationCompleted ? "bg-teal-200" : "bg-orange-200"}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={participationCompleted ? "M5 13l4 4L19 7" : "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
        </div>
        <span>Your participation: {participationCompleted ? "Completed" : "Pending"}</span>
      </div>

      {task.status === "COMPLETED" && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-start gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
          <span>Finalized by admin</span>
        </div>
      )}
    </div>
  );
};

export default GroupTaskCard;