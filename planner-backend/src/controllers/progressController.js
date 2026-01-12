const { Task, TaskParticipation, GroupMember } = require("../models");

const getGroupProgress = async (req, res) => {
  const { groupId } = req.params;

  const totalTasks = await Task.count({
    where: { groupId, assignmentType: "GROUP" }
  });

  const completedTasks = await Task.count({
    where: {
      groupId,
      assignmentType: "GROUP",
      status: "COMPLETED"
    }
  });

  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  res.json({
    totalTasks,
    completedTasks,
    progress
  });
};

const getTaskProgress = async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (task.assignmentType === "INDIVIDUAL") {
    return res.json({
      taskId: task.id,
      status: task.status
    });
  }

  const totalMembers = await TaskParticipation.count({
    where: { taskId }
  });

  const completedMembers = await TaskParticipation.count({
    where: { taskId, isCompleted: true }
  });

  res.json({
    taskId,
    totalMembers,
    completedMembers,
    finalized: task.status === "COMPLETED"
  });
};

const getMemberParticipationStatus = async (req, res) => {
  const { taskId } = req.params;

  const participations = await TaskParticipation.findAll({
    where: { taskId }
  });

  res.json(participations);
};

module.exports = {
  getGroupProgress,
  getTaskProgress,
  getMemberParticipationStatus
};
