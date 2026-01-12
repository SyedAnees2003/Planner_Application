const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { isGroupMember } = require("../middlewares/groupAuthMiddleware");
const {
  getGroupProgress,
  getTaskProgress,
  getMemberParticipationStatus
} = require("../controllers/progressController");

const router = express.Router();

router.get(
  "/group/:groupId",
  authMiddleware,
  isGroupMember,
  getGroupProgress
);

router.get(
  "/task/:taskId",
  authMiddleware,
  getTaskProgress
);

router.get(
  "/task/:taskId/participants",
  authMiddleware,
  getMemberParticipationStatus
);

module.exports = router;
