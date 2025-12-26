const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");
const enforceTenant = require("../middleware/tenant.middleware");

const {
  listTasks,
  updateTask,
} = require("../controllers/tasks.controller");

// All task routes require auth + tenant
router.use(authenticate, enforceTenant);

// Users + admins can view tasks
router.get("/", listTasks);

// Only tenant admin can update task
router.put("/:taskId", authorizeRoles("tenant_admin"), updateTask);

module.exports = router;
