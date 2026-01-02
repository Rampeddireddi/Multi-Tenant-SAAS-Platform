const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");
const { getMyTenant } = require("../controllers/tenants.controller");
const { login, registerTenant, logout } = require("../controllers/auth.controller");

router.post("/login", login);
router.post("/register-tenant", registerTenant);
router.post("/logout", authenticate, logout);
router.get(
  "/me",
  authenticate,
  authorizeRoles("tenant_admin"),
  getMyTenant
);


module.exports = router;
