const { pool } = require('../utils/db-init');

// Create a new task in a specific project
exports.createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority, dueDate } = req.body;
  const { tenantId } = req.user;

  try {
    // 1. Verify Project exists and belongs to tenant
    const projectCheck = await pool.query(
        'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
        [projectId, tenantId]
    );
    if (projectCheck.rows.length === 0) return res.status(403).json({ message: 'Access denied or project not found' });

    // 2. Insert Task
    const result = await pool.query(
      `INSERT INTO tasks (project_id, tenant_id, title, description, priority, status, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5, 'todo', $6, $7) RETURNING *`,
      [projectId, tenantId, title, description, priority || 'medium', assignedTo || null, dueDate || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all tasks for a specific project
exports.getTasks = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(`
        SELECT t.*, u.full_name as assignee_name 
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.project_id = $1 AND t.tenant_id = $2
        ORDER BY t.created_at DESC
    `, [projectId, tenantId]);

    res.json({ success: true, data: { tasks: result.rows } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update Task (Edit / Mark Complete / Reassign)
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, priority, assignedTo, due_date } = req.body;
  const { tenantId } = req.user;

  try {
    // Verify task belongs to tenant
    const taskCheck = await pool.query('SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2', [taskId, tenantId]);
    if (taskCheck.rows.length === 0) return res.status(404).json({ message: 'Task not found' });

    const result = await pool.query(
      `UPDATE tasks SET 
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       status = COALESCE($3, status),
       priority = COALESCE($4, priority),
       assigned_to = COALESCE($5, assigned_to),
       due_date = COALESCE($6, due_date),
       updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, description, status, priority, assignedTo, due_date, taskId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING id', 
      [taskId, tenantId]
    );
    
    if (result.rowCount === 0) return res.status(404).json({ message: 'Task not found' });

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// NEW: Get tasks assigned to current user (Used by Dashboard)
exports.getUserTasks = async (req, res) => {
  const { id, tenantId } = req.user;

  try {
    const result = await pool.query(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.assigned_to = $1 AND t.tenant_id = $2 AND t.status != 'completed'
      ORDER BY t.due_date ASC
    `, [id, tenantId]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};