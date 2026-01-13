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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        
          {/* HEADER */}
          <div className="bg-gradient-to-r from-teal-600 via-teal-600 to-cyan-600 rounded-3xl p-10 text-white shadow-xl border border-teal-500/20">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">
              Hello, {user?.name} 👋
            </h1>
            <p className="text-teal-50 text-xl font-light">
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

          {/* Divider */}
          <div className="border-t-2 border-slate-200"></div>

          {/* INDIVIDUAL TASKS OVERVIEW */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-gradient-to-b from-teal-500 to-teal-600 rounded-full shadow-md"></div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                    My Individual Tasks
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Track and manage your personal tasks
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/my-tasks")}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 hover:text-teal-800 font-semibold rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                <span>View All</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {individualTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-5 shadow-inner">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-slate-500 text-lg font-medium">No individual tasks yet</p>
                <p className="text-slate-400 text-sm mt-1">Create your first task to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Progress Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-800">Overall Progress</h3>
                      <p className="text-sm text-slate-600">
                        {completedIndividual} of {individualTasks.length} tasks completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-teal-600">{individualProgress}%</div>
                      <p className="text-xs text-slate-500 mt-1">Complete</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 h-4 rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${individualProgress}%` }}
                    ></div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="grid grid-cols-3 gap-5 mt-8">
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl border border-teal-100 hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-teal-600">{completedIndividual}</div>
                      <div className="text-xs text-teal-700 font-semibold mt-1 uppercase tracking-wide">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl border border-yellow-100 hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-yellow-600">
                        {individualTasks.filter(t => t.status === "TODO").length}
                      </div>
                      <div className="text-xs text-yellow-700 font-semibold mt-1 uppercase tracking-wide">To Do</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-slate-600">{individualTasks.length}</div>
                      <div className="text-xs text-slate-700 font-semibold mt-1 uppercase tracking-wide">Total</div>
                    </div>
                  </div>
                </div>

                {/* Recent Tasks */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-700 px-1">Recent Tasks</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {individualTasks.slice(0, 4).map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Divider */}
          <div className="border-t-2 border-slate-200"></div>

          {/* GROUP TASKS OVERVIEW */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full shadow-md"></div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                    My Group Tasks
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Collaborate with your team
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/my-tasks")}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 font-semibold rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                <span>View All</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {groupTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-5 shadow-inner">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-lg font-medium">No group tasks yet</p>
                <p className="text-slate-400 text-sm mt-1">Join a group to start collaborating</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Progress Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-slate-800">Participation Progress</h3>
                      <p className="text-sm text-slate-600">
                        {completedGroup} of {groupTasks.length} participations completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-purple-600">{groupProgress}%</div>
                      <p className="text-xs text-slate-500 mt-1">Complete</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 h-4 rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${groupProgress}%` }}
                    ></div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="grid grid-cols-3 gap-5 mt-8">
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl border border-teal-100 hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-teal-600">{completedGroup}</div>
                      <div className="text-xs text-teal-700 font-semibold mt-1 uppercase tracking-wide">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-100 hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-orange-600">
                        {groupTasks.filter(g => !g.participationCompleted).length}
                      </div>
                      <div className="text-xs text-orange-700 font-semibold mt-1 uppercase tracking-wide">Pending</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="text-3xl font-bold text-slate-600">{groupTasks.length}</div>
                      <div className="text-xs text-slate-700 font-semibold mt-1 uppercase tracking-wide">Total</div>
                    </div>
                  </div>
                </div>

                {/* Recent Group Tasks */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-700 px-1">Recent Group Tasks</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {groupTasks.slice(0, 4).map(({ task, participationCompleted }) => (
                      <GroupTaskCard
                        key={task.id}
                        task={task}
                        participationCompleted={participationCompleted}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Divider */}
          <div className="border-t-2 border-slate-200"></div>

          {/* GROUPS */}
          <section className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-md"></div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                    My Groups
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Your collaborative workspaces
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/groups")}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-semibold rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                <span>View All</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {groups.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-5 shadow-inner">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-lg font-medium">You are not in any groups</p>
                <p className="text-slate-400 text-sm mt-1">Create or join a group to collaborate with others</p>
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