const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TaskParticipation = sequelize.define("TaskParticipation", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = TaskParticipation;
