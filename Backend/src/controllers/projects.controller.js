const pool = require("../config/db");

/**
 * CREATE PROJECT
 */
exports.createProject = async (req, res) => {
  const { name, description } = req.body;
 const tenantId = req.user.tenantId;
  console.log("request",req);
 if (req.user.role !== "tenant_admin") {
  return res.status(403).json({
    success: false,
    message: "Only tenant admins can create projects",
  });
}

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Project name is required",
    });
  }


  try {
    // 1️⃣ Check project limit
    const limitResult = await pool.query(
      "SELECT max_projects FROM tenants WHERE id = $1",
      [tenantId]
    );

    const maxProjects = limitResult.rows[0].max_projects;

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE tenant_id = $1 AND status = 'active'",
      [tenantId]
    );

    if (parseInt(countResult.rows[0].count) >= maxProjects) {
      return res.status(403).json({
        success: false,
        message: "Project limit reached for this subscription",
      });
    }

    // 2️⃣ Create project
    const result = await pool.query(
      `INSERT INTO projects (tenant_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, status`,
      [tenantId, name, description]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

/**
 * LIST PROJECTS
 */
exports.listProjects = async (req, res) => {
  const tenantId = req.user.tenantId;;
   console.log("request",req);
  const result = await pool.query(
    `SELECT id, name, description, status
     FROM projects
     WHERE tenant_id = $1`,
    [tenantId]
  );

  res.json({ success: true, data: result.rows });
};

/**
 * UPDATE PROJECT
 */
exports.updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, status } = req.body;
  const tenantId = req.tenantId;

  const result = await pool.query(
    `UPDATE projects
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4 AND tenant_id = $5
     RETURNING id, name, description, status`,
    [name, description, status, projectId, tenantId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  res.json({ success: true, data: result.rows[0] });
};

/**
 * ARCHIVE PROJECT (soft delete)
 */
exports.archiveProject = async (req, res) => {
  const { projectId } = req.params;
  const tenantId = req.tenantId;

  const result = await pool.query(
    `UPDATE projects
     SET status = 'archived', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND tenant_id = $2
     RETURNING id`,
    [projectId, tenantId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  res.json({ success: true, message: "Project archived" });
};
