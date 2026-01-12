import { useEffect, useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { GroupContext } from "../contexts/GroupContext";
import { TaskContext } from "../contexts/TaskContext";
import AddMemberModal from "../components/AddMemberModal";
import CreateGroupTask from "../components/CreateGroupTask";
import GroupComments from "../components/GroupComments";

const GroupDetails = () => {
  const currentUserId = localStorage.getItem('userId');

  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const {
    activeGroup,
    members,
    isAdmin,
    loadGroup,
    removeMember
  } = useContext(GroupContext);
  
  const {
    groupTasks,
    loadGroupTasks,
    participateTask,
    finalizeTask
  } = useContext(TaskContext);
  
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);

  useEffect(() => {
    loadGroup(groupId);
    loadGroupTasks(groupId);
  }, [groupId]);

  if (!activeGroup) {
    return (
      <div className="min-h-screen flex bg-slate-100">
        <Sidebar />
        <div className="flex-1 p-8 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading group details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Update the handleRemoveMember function
  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member from the group?")) {
      try {
        // Make sure we're using the groupId from params, not from activeGroup
        const groupIdToUse = groupId; // This comes from useParams()
        
        console.log("Removing member with:", { 
          groupId: groupIdToUse, 
          memberId,
          activeGroupId: activeGroup?.id 
        }); // Debug log
        
        if (!groupIdToUse) {
          throw new Error("Group ID is missing");
        }
        
        await removeMember(groupIdToUse, memberId);
        
        // Reload both group data and tasks
        await Promise.all([
          loadGroup(groupIdToUse),
          loadGroupTasks(groupIdToUse)
        ]);
        
        // Show success message
        alert("Member removed successfully");
      } catch (error) {
        console.error("Error removing member:", error);
        alert(`Failed to remove member: ${error.message}`);
      }
    }
  };

  const pendingTasks = groupTasks.filter(item => {
    const task = item.task || item;
    return task.status !== "COMPLETED";
  }).length;

  const completedTasks = groupTasks.filter(item => {
    const task = item.task || item;
    return task.status === "COMPLETED";
  }).length;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      
      <div className="flex-1 p-8 space-y-8 overflow-auto">

      {/* Modals */}
      {showAddMember && (
        <AddMemberModal
          groupId={groupId}
          onClose={() => setShowAddMember(false)}
          onSuccess={() => loadGroup(groupId)}
        />
      )}

      {showCreateTask && (
        <CreateGroupTask
          groupId={groupId}
          onClose={() => setShowCreateTask(false)}
          onCreated={() => loadGroupTasks(groupId)}
        />
      )}

      <div className="flex-1 p-8 space-y-8 ml-64">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate("/groups")}
                className="flex items-center gap-2 text-slate-600 hover:text-teal-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Groups
              </button>
            </div>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{activeGroup.name}</h1>
                {activeGroup.description && (
                  <p className="text-slate-600 mt-2 max-w-2xl">{activeGroup.description}</p>
                )}
              </div>
              
              <button
                onClick={() => setShowGroupChat(!showGroupChat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  showGroupChat 
                    ? "bg-teal-100 text-teal-700 border border-teal-200"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {showGroupChat ? "Hide Chat" : "Group Chat"}
              </button>
            </div>
            
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{members.length} members</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{groupTasks.length} total tasks</span>
              </div>
              
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                isAdmin 
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}>
                {isAdmin ? "Group Admin" : "Member"}
              </span>
            </div>
          </div>
        </div>

        {/* Group Chat Section */}
        {showGroupChat && (
          <GroupComments
            groupId={groupId}
            isOpen={true}
            onClose={() => setShowGroupChat(false)}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Members</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{members.length}</h3>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{pendingTasks}</h3>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{completedTasks}</h3>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Members Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Group Members</h2>
                  <p className="text-sm text-slate-600 mt-1">Manage group members and permissions</p>
                </div>
                
                {isAdmin && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-semibold shadow-lg shadow-teal-500/30 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Member
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No members yet</h3>
                  <p className="text-slate-600">Add members to start collaborating</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {members.map((member, index) => (
                    <div
                      key={`${member.id}-${index}`}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{member.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              member.isAdmin 
                                ? "bg-teal-100 text-teal-700 border border-teal-200"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {member.isAdmin ? "Admin" : "Member"}
                            </span>
                            {member.id === localStorage.getItem('userId') && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isAdmin && !member.isAdmin && member.id !== currentUserId && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        title="Remove member"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Group Tasks</h2>
                  <p className="text-sm text-slate-600 mt-1">Collaborate on shared tasks</p>
                </div>
                
                {isAdmin && (
                  <button
                    onClick={() => setShowCreateTask(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-semibold shadow-lg shadow-teal-500/30 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Task
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {groupTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No tasks yet</h3>
                  <p className="text-slate-600">Create tasks to start collaborating</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {groupTasks.map((item, index) => {
                    const actualTask = item.task || item;
                    
                    return (
                      <div
                        key={`task-${actualTask.id}`}
                        className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-slate-900">{actualTask.title}</h4>
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                            actualTask.status === "COMPLETED"
                              ? "bg-teal-100 text-teal-700 border border-teal-200"
                              : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          }`}>
                            {actualTask.status.replace("_", " ")}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className={`font-medium ${
                              actualTask.priority === "HIGH" ? "text-red-600" :
                              actualTask.priority === "MEDIUM" ? "text-orange-600" :
                              "text-teal-600"
                            }`}>
                              {actualTask.priority} Priority
                            </span>
                          </div>
                          
                          {actualTask.dueDate && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Due: {new Date(actualTask.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-3">
                          {!isAdmin && actualTask.status !== "COMPLETED" && (
                            <button
                              onClick={() => participateTask(actualTask.id, groupId)}
                              className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-medium"
                            >
                              Mark as Done
                            </button>
                          )}
                          
                          {isAdmin && actualTask.status !== "COMPLETED" && (
                            <button
                              onClick={() => finalizeTask(actualTask.id, groupId)}
                              className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
                            >
                              Finalize Task
                            </button>
                          )}
                          
                          {actualTask.status === "COMPLETED" && (
                            <div className="flex-1 px-4 py-2 text-sm bg-teal-100 text-teal-700 rounded-lg font-medium text-center">
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default GroupDetails;