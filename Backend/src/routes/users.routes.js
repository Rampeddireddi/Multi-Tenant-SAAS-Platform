const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");
const enforceTenant = require("../middleware/tenant.middleware");

const {
  createUser,
  listUsers,
  updateUser,
  deactivateUser,
} = require("../controllers/users.controller");

// All user management is tenant_admin only
router.use(authenticate, authorizeRoles("tenant_admin"), enforceTenant);

router.post("/", createUser);
router.get("/", listUsers);
router.put("/:userId", updateUser);
router.delete("/:userId", deactivateUser);

module.exports = router;
