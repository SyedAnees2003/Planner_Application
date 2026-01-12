import IndividualTaskCard from "../components/IndividualTaskCard";

const IndividualTasksSection = ({ tasks }) => {
  const pending = tasks.filter(t => t.status !== "COMPLETED");
  const completed = tasks.filter(t => t.status === "COMPLETED");

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pending Tasks</h2>
              <p className="text-sm text-slate-600">Tasks that need your attention</p>
            </div>
            <span className="px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold border border-amber-200">
              {pending.length}
            </span>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {pending.map(task => (
              <IndividualTaskCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full"></div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Completed Tasks</h2>
              <p className="text-sm text-slate-600">Tasks you've successfully finished</p>
            </div>
            <span className="px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold border border-teal-200">
              {completed.length}
            </span>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {completed.map(task => (
              <IndividualTaskCard
                key={task.id}
                task={task}
                readOnly
              />
            ))}
          </div>
        </section>
      )}

      {pending.length === 0 && completed.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No tasks to display</h3>
          <p className="text-slate-600">Create a task or wait for assignments</p>
        </div>
      )}
    </div>
  );
};

export default IndividualTasksSection;