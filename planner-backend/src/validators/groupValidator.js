const { body, param } = require("express-validator");

const createGroupValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Group name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Group name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
];

const groupIdParamValidator = [
  param("groupId")
    .isInt()
    .withMessage("Invalid groupId")
];

const addMemberValidator = [
  param("groupId")
    .isInt()
    .withMessage("Invalid groupId"),

  body("userId")
    .isInt()
    .withMessage("Valid userId is required")
];

const removeMemberValidator = [
  param("groupId")
    .isInt()
    .withMessage("Invalid groupId"),

  param("userId")
    .isInt()
    .withMessage("Invalid userId")
];

module.exports = {
  createGroupValidator,
  groupIdParamValidator,
  addMemberValidator,
  removeMemberValidator
};
