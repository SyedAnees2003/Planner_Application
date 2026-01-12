import { createContext, useState } from "react";
import api from "../api/axios";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [createdTasks, setCreatedTasks] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);
  const [individualTasks, setIndividualTasks] = useState([]);
  const [groupComments, setGroupComments] = useState([]);
  const [taskComments, setTaskComments] = useState([]);
  const [groups, setGroups] = useState({});
  const [users, setUsers] = useState([]); // NEW: Store users list
  const [taskParticipants, setTaskParticipants] = useState({}); // Store participants by taskId
  
  // Load all users for assignment
  const loadUsers = async () => {
    try {
      const res = await api.get("/users"); // Need this endpoint
      setUsers(res.data);
      return res.data;
    } catch (error) {
      console.error("Failed to load users:", error);
      return [];
    }
  };

  // Load all groups for mapping
  const loadGroups = async () => {
    try {
      const res = await api.get("/groups");
      const groupMap = {};
      res.data.forEach(group => {
        groupMap[group.id] = group.name;
      });
      setGroups(groupMap);
      return groupMap;
    } catch (error) {
      console.error("Failed to load groups:", error);
      return {};
    }
  };

    // NEW: Load participation data for a specific task
    const loadTaskParticipants = async (taskId) => {
      try {
        const res = await api.get(`/progress/task/${taskId}/participants`);
        setTaskParticipants(prev => ({
          ...prev,
          [taskId]: res.data
        }));
        return res.data;
      } catch (error) {
        console.error(`Failed to load participants for task ${taskId}:`, error);
        return [];
      }
    };

  const loadGroupTasks = async (groupId) => {
    const res = await api.get(`/tasks/group/${groupId}`);
    setGroupTasks(res.data);
  };

  const loadMyTasks = async () => {
    try {
      // Load groups and users first
      const [groupMap, usersList] = await Promise.all([
        loadGroups().catch(() => ({})), // Handle errors
        loadUsers().catch(() => ([]))   // Handle errors
      ]);
      
      const res = await api.get("/tasks/my");
      
      setIndividualTasks(res.data.individualTasks || []);
      
// Enhance group tasks with group names
const enhancedGroupTasks = (res.data.groupTasks || []).map(item => {
  // Add debug logging here
  console.log("Processing task item:", item);
  
  // Check if task exists
  if (!item || !item.task) {
    console.warn("Skipping null task item:", item);
    return null; // or handle differently
  }
  
  return {
    ...item,
    task: {
      ...item.task,
      groupName: item.task.groupId ? (groupMap[item.task.groupId] || "Unknown Group") : "No Group"
    }
  };
}).filter(item => item !== null); // Filter out null items

      
      setGroupTasks(enhancedGroupTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      // Set empty arrays to prevent UI from breaking
      setIndividualTasks([]);
      setGroupTasks([]);
    }
  };

  const loadCreatedTasks = async () => {
    const res = await api.get("/tasks/created-by-me");
    setCreatedTasks(res.data || []);
  };
  
// In TaskContext.jsx - update createGroupTask function
const createGroupTask = async (groupId, data) => {
  // Ensure description is included
  const taskData = {
    title: data.title,
    description: data.description || "", // Add description
    priority: data.priority,
    dueDate: data.dueDate || null
  };
  
  const res = await api.post(`/tasks/group/${groupId}`, taskData);
  await loadMyTasks();
  return res.data;
};

const participateTask = async (taskId, groupId) => {
  await api.patch(`/tasks/group/${taskId}/participation`);
  
  // Refresh task participants after participation
  await loadTaskParticipants(taskId);
  await loadMyTasks();
};

const finalizeTask = async (taskId, groupId) => {
  await api.patch(`/tasks/group/${taskId}/finalize`);
  await loadMyTasks();
};

  const createIndividualTask = async (data) => {
    // Validate required fields
    if (!data.assignedUserId) {
      throw new Error("Please select a user to assign this task to");
    }
    
    const taskData = {
      title: data.title,
      description: data.description || "", // Add description
      priority: data.priority,
      dueDate: data.dueDate || null,
      assignedUserId: data.assignedUserId
    };
    
    await api.post("/tasks/individual", taskData);
    await loadMyTasks();
  };
  
  const updateIndividualTaskStatus = async (taskId, status) => {
    console.log("PATCH STATUS API CALLED:", taskId, status);
  
    const res = await api.patch(
      `/tasks/individual/${taskId}/status`,
      { status }
    );
  
    console.log("PATCH RESPONSE:", res.data);
  
    const updatedTask = res.data;
  
    // ✅ Single source of truth update
    setIndividualTasks(prev =>
      prev.map(task =>
        task.id === taskId ? updatedTask : task
      )
    );
  
    setCreatedTasks(prev =>
      prev.map(task =>
        task.id === taskId ? updatedTask : task
      )
    );
  
    return updatedTask;
  };
  
  
  const updateIndividualTask = async (taskId, updatedData) => {
    try {
      console.log("Updating individual task:", taskId, updatedData);
      
      const res = await api.put(`/tasks/individual/${taskId}`, updatedData);
      
      console.log("Update response:", res.data);
      
      const updatedTask = res.data.task || res.data;
      
      // Update the createdTasks state - FIX: use setCreatedTasks, not setTasksCreated
      setCreatedTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );

          // ✅ ALSO update individualTasks
    setIndividualTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      )
    );
      
      return updatedTask;
    } catch (error) {
      console.error("Failed to update individual task:", error);
      throw error;
    }
  };

  const updateTask = async (taskId, data) => {
    // First, check if it's individual or group task
    const allTasks = [...individualTasks, ...groupTasks.flatMap(g => g.task)];
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error("Task not found");
    }
    
    if (task.assignmentType === "INDIVIDUAL") {
      return await updateIndividualTask(taskId, data);
    } else if (task.assignmentType === "GROUP") {
      throw new Error("Group tasks cannot be edited directly");
    }
  };

  const updateGroupTask = async (taskId, updatedData) => {
    try {
      console.log("=== UPDATE GROUP TASK START ===");
      console.log("Task ID:", taskId);
      console.log("Update data:", updatedData);
      console.log("Current createdTasks before update:", createdTasks);
      
      const res = await api.put(`/tasks/group/${taskId}`, updatedData);
      
      console.log("API Response:", res.data);
      
      const updatedTask = res.data.task || res.data;
      
      // Update the createdTasks state
      setCreatedTasks(prevTasks => {
        console.log("Previous createdTasks:", prevTasks);
        const newTasks = prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        );
        console.log("New createdTasks after update:", newTasks);
        return newTasks;
      });
      
      console.log("=== UPDATE GROUP TASK END ===");
      return updatedTask;
    } catch (error) {
      console.error("Failed to update group task:", error);
      throw error;
    }
  };
  
  const updateTaskStatus = async (taskId, status) => {
    try {
      // First check if it's individual or group task from createdTasks
      const task = createdTasks.find(t => t.id === taskId);
      
      if (!task) {
        // If not in createdTasks, check individualTasks
        const individualTask = individualTasks.find(t => t.id === taskId);
        const groupTaskItem = groupTasks.find(item => item.task.id === taskId);
        
        if (individualTask) {
          return await updateIndividualTaskStatus(taskId, status);
        } else if (groupTaskItem) {
          // For group tasks, we might need a different endpoint
          const res = await api.patch(`/tasks/group/${taskId}/status`, { status });
          
          // Update groupTasks state
          setGroupTasks(prev => 
            prev.map(item => 
              item.task.id === taskId 
                ? { ...item, task: { ...item.task, status } } 
                : item
            )
          );
          
          // Also update createdTasks if this task was created by user
          setCreatedTasks(prevTasks => 
            prevTasks.map(t => 
              t.id === taskId ? { ...t, status } : t
            )
          );
          
          await loadMyTasks(); // Refresh all tasks
          return res.data;
        } else {
          throw new Error("Task not found");
        }
      }
      
      // Task is in createdTasks
      if (task.assignmentType === "INDIVIDUAL") {
        return await updateIndividualTaskStatus(taskId, status);
      } else if (task.assignmentType === "GROUP") {
        const res = await api.patch(`/tasks/group/${taskId}/status`, { status });
        
        // Update createdTasks state
        setCreatedTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === taskId ? { ...t, status } : t
          )
        );
        
        // Also update groupTasks if it's there
        setGroupTasks(prev => 
          prev.map(item => 
            item.task.id === taskId 
              ? { ...item, task: { ...item.task, status } } 
              : item
          )
        );
        
        return res.data;
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      throw error;
    }
  };

  // Add this to TaskContext.jsx
  const deleteTask = async (taskId) => {
    try {
      console.log("Deleting task:", taskId);
      
      const res = await api.delete(`/tasks/${taskId}`);
      
      console.log("Delete response:", res.data);
      
      // Update createdTasks state by removing the deleted task
      setCreatedTasks(prevTasks => 
        prevTasks.filter(task => task.id !== taskId)
      );
      
      // Also update individualTasks and groupTasks if needed
      setIndividualTasks(prev => prev.filter(task => task.id !== taskId));
      
      // For group tasks, need to filter from groupTasks array
      setGroupTasks(prev => 
        prev.filter(item => item.task.id !== taskId)
      );
      
      return res.data;
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  };

  const loadGroupComments = async (groupId) => {
    const res = await api.get(`/comments/group/${groupId}`);
    setGroupComments(res.data);
  };
  
  const addGroupComment = async (groupId, content) => {
    await api.post(`/comments/group/${groupId}`, { content });
    await loadGroupComments(groupId);
  };
  
  const loadTaskComments = async (taskId) => {
    const res = await api.get(`/comments/task/${taskId}`);
    setTaskComments(res.data);
  };
  
  const addTaskComment = async (taskId, content) => {
    await api.post(`/comments/task/${taskId}`, { content });
    await loadTaskComments(taskId);
  };
  
  return (
    <TaskContext.Provider
      value={{
        groupTasks,
        individualTasks,
        groupComments,
        taskComments,
        createdTasks,
        groups,
        users, // Add users to context
        taskParticipants, // Add participants to context
        loadGroupTasks,
        loadMyTasks,
        loadCreatedTasks,
        loadGroups,
        loadUsers, // Add loadUsers function
        createGroupTask,
        participateTask,
        finalizeTask,
        createIndividualTask,
        updateIndividualTask,
        updateIndividualTaskStatus,
        updateTask,
        deleteTask,
        updateGroupTask,
        updateTaskStatus,
        loadGroupComments,
        loadTaskParticipants, // Add this function
        addGroupComment,
        loadTaskComments,
        addTaskComment
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};