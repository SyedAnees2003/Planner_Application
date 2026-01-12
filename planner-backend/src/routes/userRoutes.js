// routes/userRoutes.js
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { getCurrentUser, getAllUsers } = require("../controllers/userController");

const router = express.Router();

// Get current user
router.get("/me", authMiddleware, getCurrentUser);

// Get all users (for task assignment)
router.get("/", authMiddleware, getAllUsers);

module.exports = router;