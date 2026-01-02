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



/**
 * GET TENANT BY ID WITH STATS
 */
exports.getTenantById = async (req, res) => {
  const { tenantId } = req.params;
  const user = req.user;

  try {
    // 🔐 Authorization check
    if (
      user.role !== "super_admin" &&
      user.tenantId !== tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // 1️⃣ Fetch tenant
    const tenantResult = await pool.query(
      `
      SELECT
        id,
        name,
        subdomain,
        status,
        subscription_plan AS "subscriptionPlan",
        max_users AS "maxUsers",
        max_projects AS "maxProjects",
        created_at AS "createdAt"
      FROM tenants
      WHERE id = $1
      `,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // 2️⃣ Stats
    const [usersCount, projectsCount, tasksCount] =
      await Promise.all([
        pool.query(
          "SELECT COUNT(*) FROM users WHERE tenant_id = $1",
          [tenantId]
        ),
        pool.query(
          "SELECT COUNT(*) FROM projects WHERE tenant_id = $1",
          [tenantId]
        ),
        pool.query(
          `
          SELECT COUNT(*)
          FROM tasks
          WHERE tenant_id = $1
          `,
          [tenantId]
        ),
      ]);

    const tenant = tenantResult.rows[0];

    res.json({
      success: true,
      data: {
        ...tenant,
        stats: {
          totalUsers: Number(usersCount.rows[0].count),
          totalProjects: Number(projectsCount.rows[0].count),
          totalTasks: Number(tasksCount.rows[0].count),
        },
      },
    });
  } catch (err) {
    console.error("Get tenant by ID error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenant details",
    });
  }
};
