import { useContext, useState } from "react";
import { TaskContext } from "../contexts/TaskContext";
import { GroupContext } from "../contexts/GroupContext";
import ParticipationStatus from "./ParticipationStatus";

const GroupTaskItem = ({ task, participationCompleted }) => {
  const { groups, participateTask, finalizeTask } = useContext(TaskContext);
  const { checkIsAdmin } = useContext(GroupContext);
  
  const [showParticipationDetails, setShowParticipationDetails] = useState(false);
  
  const isFinalized = task.status === "COMPLETED";
  const isAdmin = checkIsAdmin(task.groupId);

  const getGroupName = () => {
    if (task.groupName) return task.groupName;
    if (groups && groups[task.groupId]) return groups[task.groupId];
    if (task.Group && task.Group.name) return task.Group.name;
    return "Unknown Group";
  };

  const handleParticipate = async () => {
    if (!participationCompleted && !isFinalized) {
      try {
        await participateTask(task.id, task.groupId);
      } catch (error) {
        console.error("Failed to mark participation:", error);
      }
    }
  };

  const handleFinalize = async () => {
    if (isAdmin && !isFinalized) {
      try {
        if (!window.confirm("Are you sure you want to finalize this task? Once finalized, no one can change participation.")) {
          return;
        }
        await finalizeTask(task.id, task.groupId);
      } catch (error) {
        console.error("Failed to finalize task:", error);
        alert("Failed to finalize task. You may not have admin permissions.");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {isAdmin && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full border border-purple-200">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Admin
              </span>
            )}
            
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${task.status === 'COMPLETED' ? 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700 border-teal-200' : task.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-200' : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-200'}`}>
              {task.status}
            </span>
            
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${task.priority === 'HIGH' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-200' : task.priority === 'MEDIUM' ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-200' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-200'}`}>
              {task.priority} Priority
            </span>
          </div>
          
          <h3 className="font-bold text-lg text-slate-900 mb-3">{task.title}</h3>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm text-slate-700 font-medium">{getGroupName()}</span>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm text-slate-700">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                  {new Date(task.dueDate) < new Date() && !isFinalized && (
                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">OVERDUE</span>
                  )}
                </span>
              </div>
            )}
            
            {task.description && (
              <p className="text-slate-600 text-sm leading-relaxed mt-2">{task.description}</p>
            )}
          </div>

          <div className="mt-4">
            <ParticipationStatus 
              taskId={task.id} 
              groupId={task.groupId} 
              compact={true}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-[200px]">
          {!isAdmin && !isFinalized && (
            <button
              disabled={participationCompleted}
              onClick={handleParticipate}
              className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 ${participationCompleted ? "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700 border border-teal-200 cursor-not-allowed" : "bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-500/30"}`}
            >
              {participationCompleted ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  You Completed
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Mark Complete
                </>
              )}
            </button>
          )}
          
          {isAdmin && !isFinalized && (
            <button
              onClick={handleFinalize}
              className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Finalize Task
            </button>
          )}
          
          <span className={`text-sm px-3 py-2 font-semibold rounded-xl text-center whitespace-nowrap ${isFinalized ? "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700 border border-teal-200" : "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border border-yellow-200"}`}>
            {task.status}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-200">
        <button
          onClick={() => setShowParticipationDetails(!showParticipationDetails)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
        >
          {showParticipationDetails ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
              </svg>
              Hide Participation Details
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              Show Participation Details
            </>
          )}
        </button>
        
        {showParticipationDetails && (
          <div className="mt-4">
            <ParticipationStatus 
              taskId={task.id} 
              groupId={task.groupId} 
              compact={false}
            />
          </div>
        )}
      </div>

      {isFinalized && (
        <div className="mt-5 p-3 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-xl">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-semibold text-teal-700">
              Task finalized • Participation locked
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupTaskItem;