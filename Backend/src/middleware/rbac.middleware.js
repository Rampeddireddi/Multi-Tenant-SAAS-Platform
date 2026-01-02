module.exports = function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const { role } = req.user;
     console.log("Authorizing role:", role, "against allowed roles:", allowedRoles);
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
