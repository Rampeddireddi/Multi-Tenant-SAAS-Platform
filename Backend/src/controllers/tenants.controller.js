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
    SELECT id, name, subdomain, subscription_plan, max_users, max_projects,status
    FROM tenants
    ORDER BY created_at DESC
  `);

  res.json({
    success: true,
    data: result.rows,
  });
};


/**
 * UPDATE TENANT
 * PUT /api/tenants/:tenantId
 */
exports.updateTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;

  const { role, userId } = req.user;

  // Fetch existing tenant
  const existing = await pool.query(
    "SELECT * FROM tenants WHERE id = $1",
    [tenantId]
  );

  if (existing.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  const oldTenant = existing.rows[0];

  // 🔐 RBAC rules
  if (role === "tenant_admin") {
    if (
      status !== undefined ||
      subscriptionPlan !== undefined ||
      maxUsers !== undefined ||
      maxProjects !== undefined
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }
  }

  // Update tenant
  const result = await pool.query(
    `
    UPDATE tenants
    SET
      name = COALESCE($1, name),
      status = COALESCE($2, status),
      subscription_plan = COALESCE($3, subscription_plan),
      max_users = COALESCE($4, max_users),
      max_projects = COALESCE($5, max_projects),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING id, name, updated_at
    `,
    [
      name,
      status,
      subscriptionPlan,
      maxUsers,
      maxProjects,
      tenantId,
    ]
  );

  const updatedTenant = result.rows[0];

  // 🧾 Audit log
  await pool.query(
    `
    INSERT INTO audit_logs (actor_user_id, tenant_id, action, old_value, new_value)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [
      userId,
      tenantId,
      "UPDATE_TENANT",
      oldTenant,
      { name, status, subscriptionPlan, maxUsers, maxProjects },
    ]
  );

  res.json({
    success: true,
    message: "Tenant updated successfully",
    data: updatedTenant,
  });
};

exports.getMyTenant = async (req, res) => {
  const tenantId = req.user.tenantId;

  const result = await pool.query(
    `
    SELECT
      id,
      name,
      status,
      subscription_plan,
      max_users,
      max_projects
    FROM tenants
    WHERE id = $1
    `,
    [tenantId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  res.json({
    success: true,
    data: result.rows[0],
  });
};

