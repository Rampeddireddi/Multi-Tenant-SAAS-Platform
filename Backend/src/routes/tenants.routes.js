const express = require("express");
const router = express.Router();
const { getTenants, updateTenant, getMyTenant ,getTenantById} = require("../controllers/tenants.controller");
const auth = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");
const tenantFromParam = require("../middleware/tenantParam.middleware");
const {
  listUsers,
  createUser,
} = require("../controllers/users.controller");

router.get("/", auth, getTenants);

router.get(
  "/:tenantId",
  auth,
  getTenantById
);

router.put(
  "/:tenantId",
  auth,
  authorizeRoles("super_admin", "tenant_admin"),
  updateTenant
);

router.get(
  "/:tenantId/users",
  auth,
  tenantFromParam,
  listUsers
);

router.post(
  "/:tenantId/users",
  auth,
  authorizeRoles("tenant_admin"),
  tenantFromParam,
  createUser
);

module.exports = router;
