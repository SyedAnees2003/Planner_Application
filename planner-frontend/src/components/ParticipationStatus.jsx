import { useState, useEffect, useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";

const ParticipationStatus = ({ taskId, groupId, compact = false }) => {
  const { loadTaskParticipants, taskParticipants, users } = useContext(TaskContext);
  
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipation = async () => {
      setLoading(true);
      try {
        // Check if we already have participants for this task
        const existing = taskParticipants[taskId];
        if (existing) {
          setParticipations(existing);
        } else {
          // Fetch from API
          const data = await loadTaskParticipants(taskId);
          setParticipations(data);
        }
      } catch (error) {
        console.error("Failed to load participation data:", error);
        setParticipations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipation();
  }, [taskId, taskParticipants, loadTaskParticipants]);

  // Calculate participation stats
  const completedCount = participations.filter(p => p.completed).length;
  const totalCount = participations.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Find user names for participants
  const getParticipantName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name || user.email : `User ${userId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
        <div className="animate-pulse h-2 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="text-sm text-gray-600">
          {completedCount}/{totalCount} completed
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500">
          {completionPercentage}%
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700">
          Participation Status
        </div>
        <div className="text-sm text-gray-600">
          {completedCount}/{totalCount} completed • {completionPercentage}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${
            completionPercentage === 100 ? 'bg-teal-600' :
            completionPercentage >= 50 ? 'bg-blue-600' :
            completionPercentage > 0 ? 'bg-yellow-500' : 'bg-gray-300'
          }`}
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      {/* Participants list */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {participations.map(participation => (
          <div 
            key={participation.userId} 
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                participation.completed 
                  ? 'bg-teal-100 text-teal-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {participation.completed ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                )}
              </div>
              
              <div>
                <div className="font-medium text-sm text-gray-900">
                  {getParticipantName(participation.userId)}
                </div>
                <div className="text-xs text-gray-500">
                  {participation.completed ? (
                    <span className="text-teal-600 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Completed
                    </span>
                  ) : (
                    <span className="text-gray-500">Pending</span>
                  )}
                </div>
              </div>
            </div>
            
            {participation.completed && participation.completedAt && (
              <div className="text-xs text-gray-500">
                {new Date(participation.completedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
        
        {participations.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No participation data available
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-teal-50 rounded-lg">
            <div className="text-teal-700 font-semibold">{completedCount}</div>
            <div className="text-teal-600 text-xs">Completed</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-gray-700 font-semibold">{totalCount - completedCount}</div>
            <div className="text-gray-600 text-xs">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipationStatus;