const sequelize = require("../config/db");

const User = require("./User");
const Group = require("./Group");
const GroupMember = require("./GroupMember");
const Task = require("./Task");
const TaskParticipation = require("./TaskParticipation");
const Comment = require("./Comment");

User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId" });
Group.belongsToMany(User, { through: GroupMember, foreignKey: "groupId" });

Group.hasMany(Task, { foreignKey: "groupId" });
Task.belongsTo(Group, { foreignKey: "groupId" });

User.hasMany(Task, { foreignKey: "assignedUserId" });
Task.belongsTo(User, { foreignKey: "assignedUserId" });

Task.hasMany(TaskParticipation, { foreignKey: "taskId" });
TaskParticipation.belongsTo(Task, { foreignKey: "taskId" });

User.hasMany(TaskParticipation, { foreignKey: "userId" });
TaskParticipation.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Comment, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });

Group.hasMany(Comment, { foreignKey: "groupId" });
Comment.belongsTo(Group, { foreignKey: "groupId" });

Task.hasMany(Comment, { foreignKey: "taskId" });
Comment.belongsTo(Task, { foreignKey: "taskId" });

module.exports = {
  sequelize,
  User,
  Group,
  GroupMember,
  Task,
  TaskParticipation,
  Comment
};