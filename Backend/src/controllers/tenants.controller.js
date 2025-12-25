const pool = require("../config/db");
exports.getTenants = async (req, res) => {
  // RBAC: only super admin
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const result = await pool.query(`
    SELECT id, name, subdomain, subscription_plan, max_users, max_projects
    FROM tenants
    ORDER BY created_at DESC
  `);

  res.json({
    success: true,
    data: result.rows,
  });
};
