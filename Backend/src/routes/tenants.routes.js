const express = require("express");
const router = express.Router();
const { getTenants, updateTenant, getMyTenant } = require("../controllers/tenants.controller");
const auth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");

router.get("/", auth, getTenants);
router.put(
  "/:tenantId",
  auth,
  authorizeRoles("super_admin", "tenant_admin"),
  updateTenant
);
router.get(
  "/me",
  auth,
  authorizeRoles("tenant_admin"),
  getMyTenant
);


module.exports = router;
