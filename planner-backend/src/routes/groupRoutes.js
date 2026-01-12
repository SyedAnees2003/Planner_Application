const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { isGroupMember, isGroupAdmin } = require("../middlewares/groupAuthMiddleware");
const handleValidation = require("../validators/handleValidation");
const {
  createGroupValidator,
  groupIdParamValidator,
  addMemberValidator,
  removeMemberValidator
} = require("../validators/groupValidator");
const {
  createGroup,
  getMyGroups,
  getGroupDetails,
  addMember,
  removeMember
} = require("../controllers/groupController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createGroupValidator,
  handleValidation,
  createGroup
);

router.get(
  "/",
  authMiddleware,
  getMyGroups
);

router.get(
  "/:groupId",
  authMiddleware,
  groupIdParamValidator,
  handleValidation,
  isGroupMember,
  getGroupDetails
);

router.post(
  "/:groupId/members",
  authMiddleware,
  addMemberValidator,
  handleValidation,
  isGroupAdmin,
  addMember
);

router.delete(
  "/:groupId/members/:userId",
  authMiddleware,
  removeMemberValidator,
  handleValidation,
  isGroupAdmin,
  removeMember
);

module.exports = router;
