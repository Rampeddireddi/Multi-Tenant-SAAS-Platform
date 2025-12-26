const pool = require("../config/db");

/**
 * CREATE TASK
 */
exports.createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Task title is required",
    });
  }

  try {
    // 1️⃣ Verify project + get tenantId from project
    const projectResult = await pool.query(
      `
      SELECT id, tenant_id
      FROM projects
      WHERE id = $1
      `,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Project doesn't belong to your tenant",
      });
    }

    const tenantId = projectResult.rows[0].tenant_id;

    // 2️⃣ Validate assignedTo belongs to same tenant
    if (assignedTo) {
      const userCheck = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
        [assignedTo, tenantId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Assigned user does not belong to this tenant",
        });
      }
    }

    // 3️⃣ Create task
    const result = await pool.query(
      `
      INSERT INTO tasks (
        project_id,
        tenant_id,
        title,
        description,
        status,
        priority,
        assigned_to,
        due_date
      )
      VALUES ($1, $2, $3, $4, 'todo', $5, $6, $7)
      RETURNING
        id,
        project_id AS "projectId",
        tenant_id AS "tenantId",
        title,
        description,
        status,
        priority,
        assigned_to AS "assignedTo",
        due_date AS "dueDate",
        created_at AS "createdAt"
      `,
      [
        projectId,
        tenantId,
        title,
        description || null,
        priority || "medium",
        assignedTo || null,
        dueDate || null,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
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

  const result = await pool.query(
    `
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.due_date AS "dueDate",
      t.assigned_to AS "assignedTo",
      u.full_name AS "assignedToName"
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    WHERE t.project_id = $1 AND t.tenant_id = $2
    ORDER BY t.created_at DESC
    `,
    [projectId, tenantId]
  );

  res.json({ success: true, data: result.rows });
};



/**
 * UPDATE TASK
 */
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const {
    title,
    description,
    status,
    priority,
    assignedTo,
    dueDate,
  } = req.body;

  const tenantId = req.tenantId;

  const result = await pool.query(
    `
    UPDATE tasks
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      status = COALESCE($3, status),
      priority = COALESCE($4, priority),
      assigned_to = COALESCE($5, assigned_to),
      due_date = COALESCE($6, due_date),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7 AND tenant_id = $8
    RETURNING
      id,
      title,
      status,
      priority,
      assigned_to AS "assignedTo",
      due_date AS "dueDate"
    `,
    [
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      taskId,
      tenantId,
    ]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Task not found or access denied",
    });
  }

  res.json({ success: true, data: result.rows[0] });
};
