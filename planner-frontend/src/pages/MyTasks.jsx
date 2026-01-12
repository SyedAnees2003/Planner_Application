// ============================================
// MyTasks.jsx - ENHANCED VERSION
// ============================================
import { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { TaskContext } from "../contexts/TaskContext";
import { GroupContext } from "../contexts/GroupContext";
import IndividualTasksSection from "../components/IndividualTasksSection";
import GroupTasksSection from "../components/GroupTasksSection";
import CreatedTasksSection from "../components/CreatedTasksSection";
import CreateTaskModal from "../components/CreateTaskModal";
import StatCard from "../components/StatCard";
import TaskFilters from "../components/TaskFilters";

const MyTasks = () => {
  const {
    individualTasks,
    groupTasks,
    createdTasks,
    loadMyTasks,
    loadCreatedTasks
  } = useContext(TaskContext);

  const { loadMyGroups } = useContext(GroupContext);

  const [activeTab, setActiveTab] = useState("INDIVIDUAL");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "ALL",
    priority: "ALL",
    search: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadMyTasks(), 
          loadCreatedTasks(),
          loadMyGroups()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateStats = () => {
    const allIndividualTasks = individualTasks.filter(task => task !== null);
    const allGroupTasks = groupTasks
      .filter(item => item && item.task)
      .map(item => item.task);
    
    const allTasks = [...allIndividualTasks, ...allGroupTasks];
    const completed = allTasks.filter(task => task.status === "COMPLETED").length;
    const pending = allTasks.filter(task => task.status !== "COMPLETED").length;
    const today = new Date().toISOString().split('T')[0];
    const overdue = allTasks.filter(task => 
      task.dueDate && 
      task.dueDate < today && 
      task.status !== "COMPLETED"
    ).length;
    
    return {
      total: allTasks.length,
      completed,
      pending,
      overdue
    };
  };

  const stats = calculateStats();

  const getFilteredTasks = (tasks) => {
    return tasks.filter(task => {
      if (filters.status !== "ALL" && task.status !== filters.status) return false;
      if (filters.priority !== "ALL" && task.priority !== filters.priority) return false;
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  };

  const getFilteredGroupTasks = (groupTasksArray) => {
    return groupTasksArray.filter(item => {
      const task = item.task;
      if (filters.status !== "ALL" && task.status !== filters.status) return false;
      if (filters.priority !== "ALL" && task.priority !== filters.priority) return false;
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleTaskDeleted = (taskId) => {
    console.log("Task deleted:", taskId);
    loadCreatedTasks();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />

      <div className="flex-1 p-8 space-y-8 overflow-auto ml-64">
      
      {showCreateModal && (
        <CreateTaskModal 
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={() => {
            loadMyTasks();
            setShowCreateModal(false);
          }}
        />
      )}

      <div className="flex-1 p-8 space-y-8 overflow-auto">
        {/* HEADER SECTION - Enhanced */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
            <p className="text-slate-600 mt-2">Manage and track all your tasks in one place</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 flex items-center gap-3 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Task
            </button>
            <button
              onClick={loadMyTasks}
              className="px-6 py-3.5 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 flex items-center gap-3 shadow-lg border border-slate-200 font-medium hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* STATISTICS SECTION - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</h3>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.completed}</h3>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.pending}</h3>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overdue</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.overdue}</h3>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS SECTION - Enhanced */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
            <p className="text-slate-600 text-sm">Refine your task view</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 bg-slate-50 hover:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABS - Enhanced */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="flex gap-1 border-b border-slate-200 px-6 bg-slate-50/50">
            {[
              { key: "INDIVIDUAL", label: "Individual Tasks", count: individualTasks.length, icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )},
              { key: "GROUP", label: "Group Tasks", count: groupTasks.length, icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )},
              { key: "CREATED", label: "Created by Me", count: createdTasks.length, icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )}
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 px-6 py-4 rounded-t-xl transition-all duration-200 font-semibold relative ${activeTab === tab.key ? "bg-white text-teal-700 -mb-px border-t-2 border-l-2 border-r-2 border-teal-600" : "text-slate-600 hover:text-slate-900"}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2.5 py-1 text-xs rounded-full font-bold ${activeTab === tab.key ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-600"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT - Enhanced */}
          <div className="p-6">
            {activeTab === "INDIVIDUAL" && (
              <>
                {individualTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No individual tasks</h3>
                    <p className="text-slate-600 mb-6">Tasks assigned to you will appear here</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40"
                    >
                      Create Your First Task
                    </button>
                  </div>
                ) : (
                  <IndividualTasksSection tasks={getFilteredTasks(individualTasks)} />
                )}
              </>
            )}

            {activeTab === "GROUP" && (
              <>
                {groupTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No group tasks</h3>
                    <p className="text-slate-600 mb-6">Group tasks will appear when you're added to a group</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40"
                    >
                      Create Group Task
                    </button>
                  </div>
                ) : (
                  <GroupTasksSection groupTasks={getFilteredGroupTasks(groupTasks)} />
                )}
              </>
            )}

            {activeTab === "CREATED" && (
              <>
                {createdTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No created tasks</h3>
                    <p className="text-slate-600 mb-6">Tasks you create will appear here</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-semibold shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40"
                    >
                      Create Your First Task
                    </button>
                  </div>
                ) : (
                  <CreatedTasksSection 
                    tasks={getFilteredTasks(createdTasks)}
                    onTaskDeleted={handleTaskDeleted}
                  />                
                )}
              </>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS FOOTER - Enhanced */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>
              Showing {(() => {
                const tasks = activeTab === "INDIVIDUAL" ? individualTasks :
                             activeTab === "GROUP" ? groupTasks.map(item => item.task) : 
                             createdTasks;
                return getFilteredTasks(tasks).length;
              })()} of {(() => {
                const tasks = activeTab === "INDIVIDUAL" ? individualTasks :
                             activeTab === "GROUP" ? groupTasks.map(item => item.task) : 
                             createdTasks;
                return tasks.length;
              })()} tasks
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => console.log("Export tasks")}
              className="px-5 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MyTasks;