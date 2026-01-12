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
  const [users, setUsers] = useState([]);
  const [taskParticipants, setTaskParticipants] = useState({});
  
  // Load all users for assignment
  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
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
      const [groupMap, usersList] = await Promise.all([
        loadGroups().catch(() => ({})),
        loadUsers().catch(() => ([]))
      ]);
      
      const res = await api.get("/tasks/my");
      
      setIndividualTasks(res.data.individualTasks || []);
      
      const enhancedGroupTasks = (res.data.groupTasks || []).map(item => {
        if (!item || !item.task) {
          console.warn("Skipping null task item:", item);
          return null;
        }
        
        return {
          ...item,
          task: {
            ...item.task,
            groupName: item.task.groupId ? (groupMap[item.task.groupId] || "Unknown Group") : "No Group"
          }
        };
      }).filter(item => item !== null);
      
      setGroupTasks(enhancedGroupTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setIndividualTasks([]);
      setGroupTasks([]);
    }
  };

  const loadCreatedTasks = async () => {
    const res = await api.get("/tasks/created-by-me");
    setCreatedTasks(res.data || []);
  };
  
  const createGroupTask = async (groupId, data) => {
    const taskData = {
      title: data.title,
      description: data.description || "",
      priority: data.priority,
      dueDate: data.dueDate || null
    };
    
    const res = await api.post(`/tasks/group/${groupId}`, taskData);
    await loadMyTasks();
    return res.data;
  };

  const participateTask = async (taskId, groupId) => {
    await api.patch(`/tasks/group/${taskId}/participation`);
    await loadTaskParticipants(taskId);
    await loadMyTasks();
  };

  const finalizeTask = async (taskId, groupId) => {
    await api.patch(`/tasks/group/${taskId}/finalize`);
    await loadMyTasks();
  };

  const createIndividualTask = async (data) => {
    if (!data.assignedUserId) {
      throw new Error("Please select a user to assign this task to");
    }
    
    const taskData = {
      title: data.title,
      description: data.description || "",
      priority: data.priority,
      dueDate: data.dueDate || null,
      assignedUserId: data.assignedUserId
    };
    
    await api.post("/tasks/individual", taskData);
    await loadMyTasks();
  };
  
  // ✅ FIXED: Update individual task status with proper state sync
  const updateIndividualTaskStatus = async (taskId, status) => {
    console.log("🔄 Updating task status:", { taskId, status });
  
    try {
      const res = await api.patch(`/tasks/individual/${taskId}/status`, { status });
      console.log("✅ Status update response:", res.data);
      
      const updatedTask = res.data;
  
      // Update all three state arrays to ensure consistency
      setIndividualTasks(prev => {
        const updated = prev.map(task =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        );
        console.log("📝 Updated individualTasks:", updated);
        return updated;
      });
  
      setCreatedTasks(prev => {
        const updated = prev.map(task =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        );
        console.log("📝 Updated createdTasks:", updated);
        return updated;
      });
  
      // Also update groupTasks in case this task appears there
      setGroupTasks(prev =>
        prev.map(item =>
          item.task && item.task.id === taskId
            ? { ...item, task: { ...item.task, ...updatedTask } }
            : item
        )
      );
  
      return updatedTask;
    } catch (error) {
      console.error("❌ Failed to update task status:", error);
      throw error;
    }
  };
  
  // ✅ FIXED: Update individual task with proper state sync
  const updateIndividualTask = async (taskId, updatedData) => {
    try {
      console.log("🔄 Updating individual task:", { taskId, updatedData });
      
      const res = await api.put(`/tasks/individual/${taskId}`, updatedData);
      console.log("✅ Update response:", res.data);
      
      // Handle different response structures
      const updatedTask = res.data.task || res.data;
      
      // Ensure we have the complete updated task
      if (!updatedTask || !updatedTask.id) {
        console.error("❌ Invalid response from server:", res.data);
        throw new Error("Invalid response from server");
      }

      // Update all state arrays
      setIndividualTasks(prev => {
        const updated = prev.map(task =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        );
        console.log("📝 Updated individualTasks:", updated);
        return updated;
      });

      setCreatedTasks(prev => {
        const updated = prev.map(task =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        );
        console.log("📝 Updated createdTasks:", updated);
        return updated;
      });

      // Also update groupTasks if needed
      setGroupTasks(prev =>
        prev.map(item =>
          item.task && item.task.id === taskId
            ? { ...item, task: { ...item.task, ...updatedTask } }
            : item
        )
      );
      
      return updatedTask;
    } catch (error) {
      console.error("❌ Failed to update individual task:", error);
      throw error;
    }
  };

  const updateTask = async (taskId, data) => {
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
      
      const res = await api.put(`/tasks/group/${taskId}`, updatedData);
      console.log("API Response:", res.data);
      
      const updatedTask = res.data.task || res.data;
      
      setCreatedTasks(prevTasks => {
        const newTasks = prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        );
        console.log("New createdTasks after update:", newTasks);
        return newTasks;
      });
      
      // Also update groupTasks
      setGroupTasks(prev =>
        prev.map(item =>
          item.task && item.task.id === taskId
            ? { ...item, task: { ...item.task, ...updatedTask } }
            : item
        )
      );
      
      console.log("=== UPDATE GROUP TASK END ===");
      return updatedTask;
    } catch (error) {
      console.error("Failed to update group task:", error);
      throw error;
    }
  };
  
  const updateTaskStatus = async (taskId, status) => {
    try {
      const task = createdTasks.find(t => t.id === taskId);
      
      if (!task) {
        const individualTask = individualTasks.find(t => t.id === taskId);
        const groupTaskItem = groupTasks.find(item => item.task.id === taskId);
        
        if (individualTask) {
          return await updateIndividualTaskStatus(taskId, status);
        } else if (groupTaskItem) {
          const res = await api.patch(`/tasks/group/${taskId}/status`, { status });
          
          setGroupTasks(prev => 
            prev.map(item => 
              item.task.id === taskId 
                ? { ...item, task: { ...item.task, status } } 
                : item
            )
          );
          
          setCreatedTasks(prevTasks => 
            prevTasks.map(t => 
              t.id === taskId ? { ...t, status } : t
            )
          );
          
          await loadMyTasks();
          return res.data;
        } else {
          throw new Error("Task not found");
        }
      }
      
      if (task.assignmentType === "INDIVIDUAL") {
        return await updateIndividualTaskStatus(taskId, status);
      } else if (task.assignmentType === "GROUP") {
        const res = await api.patch(`/tasks/group/${taskId}/status`, { status });
        
        setCreatedTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === taskId ? { ...t, status } : t
          )
        );
        
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

  const deleteTask = async (taskId) => {
    try {
      console.log("Deleting task:", taskId);
      
      const res = await api.delete(`/tasks/${taskId}`);
      console.log("Delete response:", res.data);
      
      setCreatedTasks(prevTasks => 
        prevTasks.filter(task => task.id !== taskId)
      );
      
      setIndividualTasks(prev => prev.filter(task => task.id !== taskId));
      
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
        users,
        taskParticipants,
        loadGroupTasks,
        loadMyTasks,
        loadCreatedTasks,
        loadGroups,
        loadUsers,
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
        loadTaskParticipants,
        addGroupComment,
        loadTaskComments,
        addTaskComment
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};