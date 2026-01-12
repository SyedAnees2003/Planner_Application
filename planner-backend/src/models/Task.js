const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Task = sequelize.define("Task", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  assignmentType: {
    type: DataTypes.ENUM("INDIVIDUAL", "GROUP"),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("TODO", "IN_PROGRESS", "COMPLETED"),
    defaultValue: "TODO"
  },
  priority: {
    type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
    defaultValue: "MEDIUM"
  },
  dueDate: { type: DataTypes.DATE },
  createdBy: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Task;
