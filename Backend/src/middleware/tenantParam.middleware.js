// middleware/tenantParam.middleware.js
module.exports = (req, res, next) => {
  const { tenantId } = req.params;

  // super_admin can access any tenant
  if (req.user.role === "super_admin") {
    req.tenantId = tenantId;
    return next();
  }

  // tenant user must match tenant
  if (req.user.tenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized tenant access",
    });
  }

  req.tenantId = tenantId;
  next();
};
