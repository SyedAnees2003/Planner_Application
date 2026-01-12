import { useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";

const ParticipationBadge = ({ taskId }) => {
  const { taskParticipants } = useContext(TaskContext);
  
  const participations = taskParticipants[taskId] || [];
  const completed = participations.filter(p => p.completed).length;
  const total = participations.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getColor = () => {
    if (percentage === 100) return 'bg-teal-100 text-teal-800';
    if (percentage >= 50) return 'bg-blue-100 text-blue-800';
    if (percentage > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getColor()}`}>
      <span className="mr-1">
        {percentage === 100 ? '✅' :
         percentage >= 50 ? '🟦' :
         percentage > 0 ? '🟨' : '⏳'}
      </span>
      {completed}/{total} • {percentage}%
    </div>
  );
};

export default ParticipationBadge;