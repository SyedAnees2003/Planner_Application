import { useEffect, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { TaskContext } from "../contexts/TaskContext";
import { GroupContext } from "../contexts/GroupContext";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";
import GroupTaskCard from "../components/GroupTaskCard";
import GroupCard from "../components/GroupCard";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    individualTasks,
    groupTasks,
    loadMyTasks
  } = useContext(TaskContext);

  const { groups, loadMyGroups } = useContext(GroupContext);

  useEffect(() => {
    loadMyTasks();
    loadMyGroups();
  }, []);

  const completedIndividual = individualTasks.filter(
    t => t.status === "COMPLETED"
  ).length;

  const completedGroup = groupTasks.filter(
    g => g.participationCompleted
  ).length;

  const individualProgress = individualTasks.length > 0 
    ? Math.round((completedIndividual / individualTasks.length) * 100) 
    : 0;

  const groupProgress = groupTasks.length > 0 
    ? Math.round((completedGroup / groupTasks.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />

      <div className="flex-1 p-8 space-y-8 overflow-auto ml-64">

      <div className="flex-1 p-8 space-y-8 overflow-auto">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">
            Hello, {user?.name} 👋
          </h1>
          <p className="text-teal-100 text-lg">
            Let's get things done 🚀
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="My Tasks" value={individualTasks.length} />
          <StatCard title="Group Tasks" value={groupTasks.length} />
          <StatCard
            title="Completed"
            value={completedIndividual + completedGroup}
          />
          <StatCard title="My Groups" value={groups.length} />
        </div>

        {/* INDIVIDUAL TASKS OVERVIEW */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-teal-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-slate-800">
                My Individual Tasks
              </h2>
            </div>
            <button
              onClick={() => navigate("/my-tasks")}
              className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-semibold transition group"
            >
              <span>View All</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {individualTasks.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500">No individual tasks yet</p>
            </div>
          ) : (
            <>
              {/* Progress Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Overall Progress</h3>
                    <p className="text-sm text-slate-600">
                      {completedIndividual} of {individualTasks.length} tasks completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-teal-600">{individualProgress}%</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${individualProgress}%` }}
                  ></div>
                </div>

                {/* Status Breakdown */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">{completedIndividual}</div>
                    <div className="text-xs text-teal-700 font-medium">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {individualTasks.filter(t => t.status === "TODO").length}
                    </div>
                    <div className="text-xs text-yellow-700 font-medium">To Do</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-600">{individualTasks.length}</div>
                    <div className="text-xs text-slate-700 font-medium">Total</div>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {individualTasks.slice(0, 4).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </>
          )}
        </section>

        {/* GROUP TASKS OVERVIEW */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-teal-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-slate-800">
                My Group Tasks
              </h2>
            </div>
            <button
              onClick={() => navigate("/my-tasks")}
              className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-semibold transition group"
            >
              <span>View All</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {groupTasks.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-slate-500">No group tasks yet</p>
            </div>
          ) : (
            <>
              {/* Progress Card */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Participation Progress</h3>
                    <p className="text-sm text-slate-600">
                      {completedGroup} of {groupTasks.length} participations completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{groupProgress}%</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${groupProgress}%` }}
                  ></div>
                </div>

                {/* Status Breakdown */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">{completedGroup}</div>
                    <div className="text-xs text-teal-700 font-medium">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {groupTasks.filter(g => !g.participationCompleted).length}
                    </div>
                    <div className="text-xs text-orange-700 font-medium">Pending</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-600">{groupTasks.length}</div>
                    <div className="text-xs text-slate-700 font-medium">Total</div>
                  </div>
                </div>
              </div>

              {/* Recent Group Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groupTasks.slice(0, 4).map(({ task, participationCompleted }) => (
                  <GroupTaskCard
                    key={task.id}
                    task={task}
                    participationCompleted={participationCompleted}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* GROUPS */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-teal-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-slate-800">
                My Groups
              </h2>
            </div>
            <button
              onClick={() => navigate("/groups")}
              className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-semibold transition group"
            >
              <span>View All</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-slate-500">You are not in any groups</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.slice(0, 6).map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </section>

      </div>
      </div>
    </div>
  );
};

export default Dashboard;