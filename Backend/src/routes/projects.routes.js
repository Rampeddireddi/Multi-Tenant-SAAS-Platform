const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");
const enforceTenant = require("../middleware/tenant.middleware");
const { createTask } = require("../controllers/tasks.controller");


const {
  createProject,
  listProjects,
  updateProject,
  archiveProject,
} = require("../controllers/projects.controller");

/**
 * LIST PROJECTS
 * tenant_admin + user
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("tenant_admin", "user"),
  enforceTenant,
  listProjects
);

/**
 * CREATE PROJECT
 * tenant_admin only
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("tenant_admin"),
  enforceTenant,
  createProject
);

/**
 * UPDATE PROJECT
 * tenant_admin only
 */
router.put(
  "/:projectId",
  authenticate,
  authorizeRoles("tenant_admin"),
  enforceTenant,
  updateProject
);

/**
 * ARCHIVE PROJECT
 * tenant_admin only
 */
router.delete(
  "/:projectId",
  authenticate,
  authorizeRoles("tenant_admin"),
  enforceTenant,
  archiveProject
);

/**
 * CREATE TASK UNDER PROJECT
 * tenant_admin only
 * POST /api/projects/:projectId/tasks
 */
router.post(
  "/:projectId/tasks",
  authenticate,
  authorizeRoles("tenant_admin"),
  enforceTenant,
  createTask
);


module.exports = router;
