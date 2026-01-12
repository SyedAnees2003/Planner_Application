const { Comment, Task, GroupMember, User } = require("../models");

const addGroupComment = async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;

  const isMember = await GroupMember.findOne({
    where: { groupId, userId: req.user.id }
  });

  if (!isMember) {
    return res.status(403).json({ message: "Not a group member" });
  }

  const comment = await Comment.create({
    content,
    userId: req.user.id,
    groupId
  });

  res.status(201).json(comment);
};

const addTaskComment = async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;

  const task = await Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Check if user is a member of the group (for group tasks)
  const isMember = await GroupMember.findOne({
    where: { groupId: task.groupId, userId: req.user.id }
  });

  if (!isMember) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const comment = await Comment.create({
    content,
    userId: req.user.id,
    taskId
  });

  // Fetch comment with user details
  const commentWithUser = await Comment.findByPk(comment.id, {
    include: [{ model: User, attributes: ["id", "name"] }]
  });

  res.status(201).json(commentWithUser);
};


const getGroupComments = async (req, res) => {
  const { groupId } = req.params;

  const comments = await Comment.findAll({
    where: { groupId, taskId: null },
    include: [{ model: User, attributes: ["id", "name"] }],
    order: [["createdAt", "ASC"]]
  });

  res.json(comments);
};

const getTaskComments = async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  // For individual tasks, only assigned user can view comments
  if (!task.groupId && task.assignedUserId !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // For group tasks, check membership
  if (task.groupId) {
    const isMember = await GroupMember.findOne({
      where: { groupId: task.groupId, userId: req.user.id }
    });

    if (!isMember) {
      return res.status(403).json({ message: "Not authorized" });
    }
  }

  const comments = await Comment.findAll({
    where: { taskId },
    include: [{ model: User, attributes: ["id", "name"] }],
    order: [["createdAt", "ASC"]]
  });

  res.json(comments);
};


const addIndividualTaskComment = async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;

  const task = await Task.findByPk(taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  // For individual tasks, only the assigned user can comment
  if (task.assignedUserId !== req.user.id) {
    return res.status(403).json({ message: "Not authorized to comment on this task" });
  }

  const comment = await Comment.create({
    content,
    userId: req.user.id,
    taskId,
    groupId: null // Individual tasks don't belong to a group
  });

  // Fetch comment with user details
  const commentWithUser = await Comment.findByPk(comment.id, {
    include: [{ model: User, attributes: ["id", "name"] }]
  });

  res.status(201).json(commentWithUser);
};

module.exports = {
  addGroupComment,
  addTaskComment,
  addIndividualTaskComment,
  getGroupComments,
  getTaskComments
};