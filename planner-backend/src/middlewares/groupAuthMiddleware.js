const { Task, GroupMember } = require("../models");

const isGroupMember = async (req, res, next) => {
  const { groupId } = req.params;
  const membership = await GroupMember.findOne({
    where: { groupId, userId: req.user.id }
  });
  if (!membership) {
    return res.status(403).json({ message: "Not a group member" });
  }
  req.groupMembership = membership;
  next();
};

const isGroupAdmin = async (req, res, next) => {
  const { groupId } = req.params;
  const membership = await GroupMember.findOne({
    where: { groupId, userId: req.user.id, isAdmin: true }
  });
  if (!membership) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

const isGroupAdminByTask = async (req, res, next) => {
  const { taskId } = req.params;

  const task = await Task.findByPk(taskId);

  if (!task || !task.groupId) {
    return res.status(404).json({ message: "Group task not found" });
  }

  const membership = await GroupMember.findOne({
    where: {
      groupId: task.groupId,
      userId: req.user.id,
      isAdmin: true
    }
  });

  if (!membership) {
    return res.status(403).json({ message: "Admin access required" });
  }

  req.groupId = task.groupId;
  next();
};


module.exports = { isGroupMember, isGroupAdmin, isGroupAdminByTask};
