const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");
const enforceTenant = require("../middleware/tenant.middleware");

const {
  createTask,
  listTasks,
  updateTask,
} = require("../controllers/tasks.controller");

// All task routes require auth + tenant
router.use(authenticate, enforceTenant);

// Only tenant admin can create/update
router.post("/", authorizeRoles("tenant_admin"), createTask);
router.put("/:taskId", authorizeRoles("tenant_admin"), updateTask);

// Users + admins can view
router.get("/", listTasks);

module.exports = router;
