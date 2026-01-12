import GroupTaskItem from "../components/GroupTaskItem";
import { useEffect, useState, useContext } from "react";
import { TaskContext } from "../contexts/TaskContext";
import { GroupContext } from "../contexts/GroupContext";
import ParticipationBadge from "../components/ParticipationBadge";

const GroupTasksSection = ({ groupTasks, onTaskDeleted }) => {
  const { groups: taskGroups } = useContext(TaskContext);
  const { userGroups } = useContext(GroupContext);
  
  const [groupedTasks, setGroupedTasks] = useState({});
  
  useEffect(() => {
    if (!groupTasks || groupTasks.length === 0) {
      setGroupedTasks({});
      return;
    }

    const grouped = groupTasks.reduce((acc, item) => {
      const task = item.task;
      const participationCompleted = item.participationCompleted || false;

      if (task.assignmentType !== 'GROUP') {
        return acc;
      }

      const groupId = task.groupId;

      if (!groupId) {
        return acc;
      }

      if (!acc[groupId]) {
        // Helper function to get group name safely
        const getGroupName = () => {
          let groupName = "Unknown Group";
          
          // Try from userGroups (GroupContext)
          if (userGroups && userGroups.length > 0) {
            const group = userGroups.find(g => g.id === groupId);
            if (group && group.name) {
              groupName = group.name;
            }
          }
          // Try from taskGroups (TaskContext)
          else if (taskGroups) {
            if (Array.isArray(taskGroups)) {
              const group = taskGroups.find(g => g.id === groupId);
              if (group) {
                groupName = typeof group === 'string' ? group : group.name;
              }
            } else if (typeof taskGroups === 'object' && taskGroups[groupId]) {
              // Handle both { groupId: "name" } and { groupId: { name: "name" } }
              const groupValue = taskGroups[groupId];
              groupName = typeof groupValue === 'string' ? groupValue : groupValue.name;
            }
          }
          // Check task properties
          else if (task.groupName) {
            groupName = task.groupName;
          } else if (task.Group && task.Group.name) {
            groupName = task.Group.name;
          }
          
          return groupName;
        };

        // Get group name
        const groupName = getGroupName();
        
        // Calculate statistics
        const groupTaskItems = groupTasks
          .filter(gt => gt.task.groupId === groupId && gt.task.assignmentType === 'GROUP');

        const completedTasks = groupTaskItems.filter(t => t.task.status === 'COMPLETED').length;
        const totalTasks = groupTaskItems.length;

        acc[groupId] = {
          groupId,
          groupName,
          tasks: [],
          totalTasks,
          completedTasks,
          completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
      }

      acc[groupId].tasks.push({
        task,
        participationCompleted
      });
      
      return acc;
    }, {});

    setGroupedTasks(grouped);
  }, [groupTasks, taskGroups, userGroups]);

  if (Object.keys(groupedTasks).length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No group tasks assigned</h3>
        <p className="text-slate-600">Group tasks will appear here when assigned</p>
      </div>
    );
  }

  const handleTaskDeleted = (taskId) => {
    if (onTaskDeleted) {
      onTaskDeleted(taskId);
    }
  };

  return (
    <div className="space-y-6">
      {Object.values(groupedTasks).map(group => (
        <div
          key={group.groupId}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        >
          {/* Group Header with Participation Stats - Enhanced */}
          <div className="bg-gradient-to-r from-teal-100 to-teal-200 px-8 py-6 border-b border-teal-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-2xl text-slate-900">
                  {group.groupName}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Group-level participation summary - Enhanced */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-sm font-semibold text-slate-700">
                    Group Progress
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-600">
                      {group.completedTasks}/{group.totalTasks} tasks completed
                    </span>
                    <div className="w-32 bg-slate-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-teal-600 to-teal-700 h-2.5 rounded-full"
                        style={{ width: `${group.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {group.completionPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tasks List - Enhanced */}
          <div className="divide-y divide-slate-100">
            {group.tasks.map(({ task, participationCompleted }) => (
              <div key={task.id} className="hover:bg-slate-50/50 transition-colors">
                
                {/* GroupTaskItem with participation details */}
                <GroupTaskItem
                  task={task}
                  participationCompleted={participationCompleted}
                />
              </div>
            ))}
          </div>
          
          {/* Group Footer with Summary - Enhanced */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
            <div className="flex justify-between items-center text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span><span className="font-bold">{group.tasks.length}</span> tasks in <span className="font-bold">{group.groupName}</span></span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                  <span className="font-medium">{group.completedTasks} completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="font-medium">{group.tasks.length - group.completedTasks} pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupTasksSection;