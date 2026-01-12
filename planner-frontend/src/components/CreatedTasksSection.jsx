import CreatedTaskCard from "../components/CreatedTaskCard";
import { useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";

const CreatedTasksSection = ({ tasks, onTaskDeleted }) => {
  const { loadCreatedTasks } = useContext(TaskContext);

  const handleTaskDeleted = async (taskId) => {
    if (onTaskDeleted) {
      onTaskDeleted(taskId);
    }
    await loadCreatedTasks();
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No created tasks</h3>
        <p className="text-slate-600">Tasks you create will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {tasks.map(task => (
        <CreatedTaskCard 
          key={task.id} 
          task={task} 
          onTaskDeleted={handleTaskDeleted}
        />
      ))}
    </div>
  );
};

export default CreatedTasksSection;