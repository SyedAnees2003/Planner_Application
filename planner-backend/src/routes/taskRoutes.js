const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { isGroupAdmin, isGroupMember } = require("../middlewares/groupAuthMiddleware");
const { Task, GroupMember } = require("../models");
const handleValidation = require("../validators/handleValidation");
const {
  createIndividualTaskValidator,
  createGroupTaskValidator,
  taskIdParamValidator,
  updateTaskStatusValidator
} = require("../validators/taskValidator");

const {
  createIndividualTask,
  updateIndividualTask,
  updateIndividualTaskStatus,
  deleteTask,
  createGroupTask,
  markParticipationComplete,
  finalizeGroupTask,
  getMyTasks,
  getTasksCreatedByMe,
  getGroupTasks
} = require("../controllers/taskController");

const { isGroupAdminByTask } = require("../middlewares/groupAuthMiddleware");

const router = express.Router();

router.get("/my", authMiddleware, getMyTasks);
router.get("/created-by-me", authMiddleware, getTasksCreatedByMe);

router.get(
  "/group/:groupId",
  authMiddleware,
  isGroupMember,
  getGroupTasks
);

router.post(
  "/individual",
  authMiddleware,
  createIndividualTaskValidator,
  handleValidation,
  createIndividualTask
);

router.put(
  "/individual/:taskId",
  authMiddleware,
  taskIdParamValidator,
  handleValidation,
  updateIndividualTask
);

router.put(
  "/group/:taskId",
  authMiddleware,
  taskIdParamValidator,
  handleValidation,
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { title, description, priority, dueDate } = req.body;
      
      // Find the task
      const task = await Task.findByPk(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (task.assignmentType !== "GROUP") {
        return res.status(400).json({ message: "This is not a group task" });
      }
      
      // Check if user is admin of the group
      const membership = await GroupMember.findOne({
        where: { 
          groupId: task.groupId, 
          userId: req.user.id 
        }
      });
      
      if (!membership || !membership.isAdmin) {
        return res.status(403).json({ 
          message: "Only group admins can edit tasks" 
        });
      }
      
      // Check if task is finalized (COMPLETED status)
      if (task.status === "COMPLETED") {
        return res.status(400).json({ 
          message: "Cannot edit finalized tasks" 
        });
      }
      
      // Update task with validation
      const updatedTask = await task.update({
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        priority: priority || task.priority,
        dueDate: dueDate !== undefined ? dueDate : task.dueDate,
        // Add updatedAt timestamp
        updatedAt: new Date()
      });
      
      res.json({
        success: true,
        message: "Group task updated successfully",
        task: updatedTask
      });
      
    } catch (error) {
      console.error('Error updating group task:', error);
      res.status(500).json({ 
        message: 'Failed to update task',
        error: error.message 
      });
    }
  }
);

// Backend route for updating group task status
router.patch('/group/:taskId/status', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    
    const task = await Task.findByPk(taskId);
    
    if (!task || task.assignmentType !== "GROUP") {
      return res.status(404).json({ message: "Group task not found" });
    }
    
    // Check if user is admin of the group
    const membership = await GroupMember.findOne({
      where: { groupId: task.groupId, userId: req.user.id }
    });
    
    if (!membership || !membership.isAdmin) {
      return res.status(403).json({ message: "Only group admins can update task status" });
    }
    
    // Update status
    task.status = status;
    await task.save();
    
    res.json(task);
  } catch (error) {
    console.error('Error updating group task status:', error);
    res.status(500).json({ message: 'Failed to update task status' });
  }
});

router.patch(
  "/individual/:taskId/status",
  authMiddleware,
  taskIdParamValidator,
  updateTaskStatusValidator,
  handleValidation,
  updateIndividualTaskStatus
);

router.post(
  "/group/:groupId",
  authMiddleware,
  createGroupTaskValidator,
  handleValidation,
  isGroupAdmin,
  createGroupTask
);

router.patch(
  "/group/:taskId/participation",
  authMiddleware,
  taskIdParamValidator,
  handleValidation,
  markParticipationComplete
);

router.patch(
  "/group/:taskId/finalize",
  authMiddleware,
  taskIdParamValidator,
  handleValidation,
  isGroupAdminByTask,
  finalizeGroupTask
);

router.delete(
  "/:taskId",
  authMiddleware,
  taskIdParamValidator,
  handleValidation,
  deleteTask
);

module.exports = router;
