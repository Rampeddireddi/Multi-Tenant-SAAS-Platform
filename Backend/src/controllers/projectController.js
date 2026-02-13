const { pool } = require('../utils/db-init');

exports.createProject = async (req, res) => {
  const { name, description, status } = req.body;
  const { tenantId } = req.user;
  const { id: userId, full_name } = req.user;

  try {
    // 1. STRICT REQUIREMENT: Check Plan Limits
    const usageRes = await pool.query('SELECT COUNT(*) FROM projects WHERE tenant_id = $1', [tenantId]);
    const limitRes = await pool.query('SELECT max_projects FROM tenants WHERE id = $1', [tenantId]);
    
    const currentCount = parseInt(usageRes.rows[0].count);
    const maxProjects = limitRes.rows[0].max_projects;

    if (currentCount >= maxProjects) {
      return res.status(403).json({ 
        success: false, 
        message: `Project limit reached. Your plan allows ${maxProjects} projects.` 
      });
    }

    // 2. Create Project
    const result = await pool.query(
      `INSERT INTO projects (tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tenantId, name, description, status || 'active', userId]
    );

    const project = result.rows[0];
    project.creator_name = full_name;

    // 3. AUDIT LOG: CREATE PROJECT
    try {
      await pool.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          tenantId,
          userId,
          'CREATE_PROJECT',
          'project',      // entity_type
          project.id,     // entity_id
          req.ip || '0.0.0.0'
        ]
      );
    } catch (logErr) { console.error('Create project audit failed:', logErr); }

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProjects = async (req, res) => {
  const { tenantId } = req.user;

  try {
    const result = await pool.query(`
      SELECT p.*, u.full_name as creator_name,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_task_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.tenant_id = $1
      ORDER BY p.created_at DESC
    `, [tenantId]);

    res.json({ success: true, data: { projects: result.rows } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(`
      SELECT p.*, u.full_name as creator_name
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1 AND p.tenant_id = $2
    `, [id, tenantId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: { project: result.rows[0] } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  const { tenantId } = req.user;

  try {
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const result = await pool.query(
      `UPDATE projects 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           status = COALESCE($3, status)
       WHERE id = $4 RETURNING *`,
      [name, description, status, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const { tenantId, role, id: userId, email } = req.user; 

  try {
    // 1. Security Check: Only Admins can delete
    if (role !== 'tenant_admin') {
      return res.status(403).json({ message: 'Only Tenant Admins can delete projects' });
    }

    // 2. Verify project belongs to tenant
    const projectCheck = await pool.query(
      'SELECT name FROM projects WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // 3. Delete the Project
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    // 4. AUDIT LOG: DELETE PROJECT
    try {
      await pool.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          tenantId, 
          userId, 
          'DELETE_PROJECT', 
          'project',
          id, // The deleted project ID
          req.ip || '0.0.0.0'
        ]
      );
      console.log(`[AUDIT] User ${email} deleted project ${id}`);
    } catch (logErr) { console.error('Audit log failed:', logErr); }

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};