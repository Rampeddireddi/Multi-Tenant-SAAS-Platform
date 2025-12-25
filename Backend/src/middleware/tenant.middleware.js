module.exports = function enforceTenant(req, res, next) {
  // super_admin is allowed to access all tenants
  if (req.user.role === "super_admin") {
    return next();
  }

  // attach tenantId to request for downstream usage
  if (!req.user.tenantId) {
    return res.status(403).json({
      success: false,
      message: "Tenant context missing",
    });
  }

  req.tenantId = req.user.tenantId;
  next();
};
