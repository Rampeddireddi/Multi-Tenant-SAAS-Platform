const { pool } = require('../utils/db-init');

exports.getAllTenants = async (req, res) => {
  try {
    // Fetch tenants with user and project counts
    const result = await pool.query(`
      SELECT t.id, t.name, t.subdomain, t.status, t.subscription_plan, t.created_at,
      (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) as user_count,
      (SELECT COUNT(*) FROM projects p WHERE p.tenant_id = t.id) as project_count
      FROM tenants t
      ORDER BY t.created_at DESC
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get Tenants Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};