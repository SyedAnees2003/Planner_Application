const { body, param } = require("express-validator");

const createIndividualTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Task title must be between 3 and 150 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH"])
    .withMessage("Invalid priority"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid due date"),

  body("assignedUserId")
    .isInt()
    .withMessage("Valid assignedUserId is required")
];

const createGroupTaskValidator = [
  param("groupId")
    .isInt()
    .withMessage("Invalid groupId"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Task title must be between 3 and 150 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("priority")
    .optional()
    .isIn(["LOW", "MEDIUM", "HIGH"])
    .withMessage("Invalid priority"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid due date")
];

const taskIdParamValidator = [
  param("taskId")
    .isInt()
    .withMessage("Invalid taskId")
];

const updateTaskStatusValidator = [
  body("status")
    .isIn(["TODO", "IN_PROGRESS", "COMPLETED"])
    .withMessage("Invalid task status")
];

module.exports = {
  createIndividualTaskValidator,
  createGroupTaskValidator,
  taskIdParamValidator,
  updateTaskStatusValidator
};
