const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { isGroupMember } = require("../middlewares/groupAuthMiddleware");
const {
  addGroupComment,
  addTaskComment,
  addIndividualTaskComment,
  getGroupComments,
  getTaskComments
} = require("../controllers/commentController");

const router = express.Router();

// Group comments
router.post(
  "/group/:groupId",
  authMiddleware,
  isGroupMember,
  addGroupComment
);

router.get(
  "/group/:groupId",
  authMiddleware,
  isGroupMember,
  getGroupComments
);

// Task comments - Group tasks
router.post(
  "/task/group/:taskId",
  authMiddleware,
  addTaskComment
);

// Task comments - Individual tasks
router.post(
  "/task/individual/:taskId",
  authMiddleware,
  addIndividualTaskComment
);

// Get task comments (works for both individual and group tasks)
router.get(
  "/task/:taskId",
  authMiddleware,
  getTaskComments
);

module.exports = router;