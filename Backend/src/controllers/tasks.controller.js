const pool = require("../config/db");

/**
 * CREATE TASK
 */
exports.createTask = async (req, res) => {
  const { projectId, title, description, assignedTo } = req.body;
  const tenantId = req.tenantId;

  if (!projectId || !title) {
    return res.status(400).json({
      success: false,
      message: "Project ID and title are required",
    });
  }

  try {
    // 1️⃣ Verify project belongs to tenant
    const projectCheck = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND tenant_id = $2 AND status = 'active'`,
      [projectId, tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    // 2️⃣ Create task
    const result = await pool.query(
      `INSERT INTO tasks (project_id, tenant_id, title, description, assigned_to)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, status, project_id`,
      [projectId, tenantId, title, description, assignedTo || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

/**
 * LIST TASKS (by project)
 */
exports.listTasks = async (req, res) => {
  const { projectId } = req.query;
  const tenantId = req.tenantId;

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "projectId query param is required",
    });
  }

  // Verify project ownership
  const projectCheck = await pool.query(
    `SELECT id FROM projects WHERE id = $1 AND tenant_id = $2`,
    [projectId, tenantId]
  );

  if (projectCheck.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Project not found or access denied",
    });
  }

  const result = await pool.query(
    `SELECT id, title, description, status, assigned_to
     FROM tasks
     WHERE project_id = $1 AND tenant_id = $2`,
    [projectId, tenantId]
  );

  res.json({ success: true, data: result.rows });
};

/**
 * UPDATE TASK
 */
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, assignedTo } = req.body;
  const tenantId = req.tenantId;

  const result = await pool.query(
    `UPDATE tasks
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         assigned_to = COALESCE($4, assigned_to),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5 AND tenant_id = $6
     RETURNING id, title, status`,
    [title, description, status, assignedTo, taskId, tenantId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Task not found or access denied",
    });
  }

  res.json({ success: true, data: result.rows[0] });
};
