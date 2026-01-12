// controllers/userController.js
const { User } = require("../models");

const getCurrentUser = async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email
  });
};

// NEW FUNCTION: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

module.exports = {
  getCurrentUser,
  getAllUsers // Export the new function
};