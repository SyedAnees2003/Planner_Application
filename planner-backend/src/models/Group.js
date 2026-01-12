const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Group = sequelize.define("Group", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
     type: DataTypes.STRING, allowNull: false 
    },
  description: {
     type: DataTypes.TEXT 
    },
  createdBy: {
     type: DataTypes.INTEGER, allowNull: false 
    }
});

module.exports = Group;
