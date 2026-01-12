const { Task, TaskParticipation, GroupMember, Group } = require("../models");

/* ---------------- INDIVIDUAL TASKS ---------------- */

const createIndividualTask = async (req, res) => {
  const { title, description, priority, dueDate, assignedUserId } = req.body;

  const task = await Task.create({
    title,
    description,
    priority,
    dueDate,
    assignmentType: "INDIVIDUAL",
    assignedUserId,
    createdBy: req.user.id
  });

  res.status(201).json(task);
};

const updateIndividualTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, dueDate, assignedUserId } = req.body;
    
    const task = await Task.findByPk(taskId);
    
    if (!task || task.assignmentType !== "INDIVIDUAL") {
      return res.status(404).json({ message: "Individual task not found" });
    }
    
    // Check if user owns the task
    if (task.createdBy !== req.user.id) {
      return res.status(403).json({ 
        message: "You can only edit tasks you created" 
      });
    }
    
    const updatedTask = await task.update({
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      priority: priority || task.priority,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      assignedUserId: assignedUserId || task.assignedUserId,
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: "Individual task updated successfully",
      task: updatedTask
    });
    
  } catch (error) {
    console.error('Error updating individual task:', error);
    res.status(500).json({ 
      message: 'Failed to update task',
      error: error.message 
    });
  }
  
};

const updateIndividualTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  const task = await Task.findByPk(taskId);

  if (!task || task.assignmentType !== "INDIVIDUAL") {
    return res.status(404).json({ message: "Task not found" });
  }

  // IMPORTANT: Allow both creator AND assigned user to update status
  if (task.createdBy !== req.user.id && task.assignedUserId !== req.user.id) {
    return res.status(403).json({ 
      message: "Only task creator or assigned user can update status" 
    });
  }

  task.status = status;
  await task.save();

  res.json(task);
};

/* ---------------- GROUP TASKS ---------------- */

const createGroupTask = async (req, res) => {
  const { groupId } = req.params;
  const { title, description, priority, dueDate } = req.body;

  const membership = await GroupMember.findOne({
    where: { groupId, userId: req.user.id }
  });

  if (!membership) {
    return res.status(403).json({ message: "Not a group member" });
  }

  const task = await Task.create({
    title,
    description,
    priority,
    dueDate,
    assignmentType: "GROUP",
    groupId,
    createdBy: req.user.id
  });

  const members = await GroupMember.findAll({ where: { groupId } });

  for (const member of members) {
    await TaskParticipation.create({
      taskId: task.id,
      userId: member.userId
    });
  }

  res.status(201).json(task);
};

const markParticipationComplete = async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findByPk(taskId);

  if (!task || task.assignmentType !== "GROUP") {
    return res.status(404).json({ message: "Group task not found" });
  }

  if (task.status === "COMPLETED") {
    return res.status(403).json({ message: "Task already finalized" });
  }

  const participation = await TaskParticipation.findOne({
    where: { taskId, userId: req.user.id }
  });

  if (!participation) {
    return res.status(403).json({ message: "Not allowed" });
  }

  participation.isCompleted = true;
  await participation.save();

  res.json({ message: "Marked complete from your side" });
};

const finalizeGroupTask = async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findByPk(taskId);

  if (!task || task.assignmentType !== "GROUP") {
    return res.status(404).json({ message: "Group task not found" });
  }

  if (task.status === "COMPLETED") {
    return res.status(400).json({ message: "Task already finalized" });
  }

  task.status = "COMPLETED";
  await task.save();

  res.json({ message: "Group task finalized" });
};

/* ---------------- DELETE ---------------- */

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find the task
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // For group tasks, check if finalized
    if (task.assignmentType === "GROUP" && task.status === "COMPLETED") {
      return res.status(400).json({ 
        message: "Cannot delete finalized group task" 
      });
    }

    // Delete the task
    await task.destroy();

    res.json({ 
      success: true,
      message: "Task deleted successfully" 
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      message: 'Failed to delete task',
      error: error.message 
    });
  }
};
/* ---------------- FETCH APIs ---------------- */

const getMyTasks = async (req, res) => {
  const individualTasks = await Task.findAll({
    where: {
      assignmentType: "INDIVIDUAL",
      assignedUserId: req.user.id
    }
  });

  const participations = await TaskParticipation.findAll({
    where: { userId: req.user.id },
    include: Task,
  });

  const groupTasks = participations.map(p => ({
    task: p.Task,
    participationCompleted: p.isCompleted
  }));

  res.json({ individualTasks, groupTasks });
};

const getGroupTasks = async (req, res) => {
  const { groupId } = req.params;

  const tasks = await Task.findAll({ where: { groupId },
    include: [
      {
        model: Group,
        attributes: ["id", "name"],
        required: false // allows individual tasks (groupId = null)
      }
    ],
    order: [["createdAt", "DESC"]] });

  res.json(tasks);
};

const getTasksCreatedByMe = async (req, res) => {
  const tasks = await Task.findAll({
    where: { createdBy: req.user.id },
    include: [
      {
        model: Group,
        attributes: ["id", "name"],
        required: false // allows individual tasks (groupId = null)
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  res.json(tasks);
};

module.exports = {
  createIndividualTask,
  updateIndividualTask,
  updateIndividualTaskStatus,
  deleteTask,
  createGroupTask,
  markParticipationComplete,
  finalizeGroupTask,
  getMyTasks,
  getGroupTasks,
  getTasksCreatedByMe
};