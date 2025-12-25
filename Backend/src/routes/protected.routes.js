const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/rbac.middleware");
const enforceTenant = require("../middleware/tenant.middleware");

router.get(
  "/me",
  authenticate,
  enforceTenant,
  (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user,
        tenantId: req.tenantId || null,
      },
    });
  }
);

router.get(
  "/admin-only",
  authenticate,
  authorizeRoles("super_admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome super admin",
    });
  }
);

module.exports = router;
