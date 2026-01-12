import { createContext, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

export const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [isAdminMap, setIsAdminMap] = useState({}); // Store admin status per group { groupId: boolean }
  const [userGroups, setUserGroups] = useState([]); // Store user's groups with admin status

  // Add this function to your GroupContext
// Update the removeMember function
const removeMember = async (groupId, userId) => {
  try {
    console.log("Removing member:", { groupId, userId }); // Debug log
    
    const token = localStorage.getItem('token');
    
    // Check if groupId and userId are valid
    if (!groupId || !userId) {
      throw new Error('Group ID or User ID is missing');
    }
    
    // Convert userId to number if it's a string (since route expects number)
    const numericUserId = parseInt(userId, 10);
    const numericGroupId = parseInt(groupId, 10);
    
    const response = await fetch(`https://planner-application-oym5.onrender.com/api/groups/${numericGroupId}/members/${numericUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Remove member response status:", response.status); // Debug log
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Remove member error response:", errorText);
      throw new Error(`Failed to remove member: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error removing member:', error);
    throw error;
  }
};

// Also make sure createGroup accepts description:
const createGroup = async (groupData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://planner-application-oym5.onrender.com/api/groups', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(groupData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create group');
    }
    
    await loadMyGroups();
    return await response.json();
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

  const loadMyGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
      
      // Extract user's groups with admin status
      const userGroupsWithAdmin = res.data.map(group => {
        // Check if current user is admin in this group
        const userMember = group.Users?.find(u => u.id === user.id);
        const isAdmin = userMember?.GroupMember?.isAdmin || false;
        
        return {
          ...group,
          isCurrentUserAdmin: isAdmin
        };
      });
      
      setUserGroups(userGroupsWithAdmin);
      
      // Create admin map for quick lookup
      const adminMap = {};
      userGroupsWithAdmin.forEach(group => {
        adminMap[group.id] = group.isCurrentUserAdmin;
      });
      
      setIsAdminMap(adminMap);
      
      return userGroupsWithAdmin;
    } catch (error) {
      console.error("Failed to load groups:", error);
      return [];
    }
  };

  const loadGroup = async (groupId) => {
    const res = await api.get(`/groups/${groupId}`);

    setActiveGroup(res.data);
    setMembers(res.data.Users);

    const me = res.data.Users.find(u => u.id === user.id);
    const isAdmin = me?.GroupMember?.isAdmin || false;
    
    // Update admin map
    setIsAdminMap(prev => ({
      ...prev,
      [groupId]: isAdmin
    }));

    return isAdmin;
  };

  const clearGroup = () => {
    setActiveGroup(null);
    setMembers([]);
  };

  const addMember = async (groupId, userId) => {
    await api.post(`/groups/${groupId}/members`, { userId });
    await loadGroup(groupId);
  };
  
  // Helper function to check if user is admin in a specific group
  const checkIsAdmin = (groupId) => {
    return isAdminMap[groupId] || false;
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        userGroups, // Groups with user's admin status
        activeGroup,
        members,
        isAdmin: isAdminMap[activeGroup?.id] || false, // For active group
        isAdminMap, // Map of all groups
        loadMyGroups,
        loadGroup,
        createGroup,
        addMember,
        removeMember,
        clearGroup,
        checkIsAdmin // Function to check admin status
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};