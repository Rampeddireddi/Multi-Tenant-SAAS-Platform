const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../utils/db-init');

exports.registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

  try {
    // 1. Check if subdomain exists
    const subCheck = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (subCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Subdomain already taken' });
    }

    // 2. Create Tenant
    const tenantResult = await pool.query(
      'INSERT INTO tenants (name, subdomain) VALUES ($1, $2) RETURNING id',
      [tenantName, subdomain]
    );
    const tenantId = tenantResult.rows[0].id;

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 4. Create Admin User
    const userResult = await pool.query(
      'INSERT INTO users (tenant_id, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [tenantId, adminEmail, hashedPassword, adminFullName, 'tenant_admin']
    );
    const newUserId = userResult.rows[0].id;

    // 5. Audit Log
    try {
      await pool.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tenantId, newUserId, 'REGISTER_TENANT', 'tenant', tenantId, req.ip || '0.0.0.0']
      );
    } catch (logErr) { console.error('Audit failed:', logErr); }

    res.status(201).json({ success: true, message: 'Tenant registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  try {
    let user;
    
    // SCENARIO 1: Super Admin Login
    if (!tenantSubdomain) {
      const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userRes.rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      
      user = userRes.rows[0];
      if (user.role !== 'super_admin') return res.status(403).json({ success: false, message: 'Regular users must provide a workspace subdomain.' });
    } 
    // SCENARIO 2: Regular Tenant Login
    else {
      const tenantRes = await pool.query('SELECT id, status FROM tenants WHERE subdomain = $1', [tenantSubdomain]);
      if (tenantRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Workspace not found' });
      
      const tenant = tenantRes.rows[0];
      if (tenant.status === 'suspended') return res.status(403).json({ success: false, message: 'This workspace has been suspended.' });
      
      const userRes = await pool.query('SELECT * FROM users WHERE email = $1 AND tenant_id = $2', [email, tenant.id]);
      if (userRes.rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      user = userRes.rows[0];
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role, tenantId: user.tenant_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    let tenantData = null;
    if (user.tenant_id) {
        const fullTenantRes = await pool.query('SELECT id, name, subdomain, subscription_plan, max_users, max_projects FROM tenants WHERE id = $1', [user.tenant_id]);
        tenantData = fullTenantRes.rows[0];
    }

    // Audit Log
    try {
      await pool.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.tenant_id, user.id, 'USER_LOGIN', 'user', user.id, req.ip || '0.0.0.0']
      );
    } catch (logErr) { console.error('Login audit failed:', logErr); }

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          tenant: tenantData
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userRes = await pool.query(
      'SELECT id, email, full_name, role, tenant_id, created_at FROM users WHERE id = $1', 
      [req.user.id]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const user = userRes.rows[0];
    let tenantData = null;

    if (user.tenant_id) {
      const tenantRes = await pool.query(
        'SELECT id, name, subdomain, subscription_plan, max_users, max_projects, status FROM tenants WHERE id = $1',
        [user.tenant_id]
      );
      tenantData = tenantRes.rows[0];
    }

    res.json({ success: true, data: { ...user, tenant: tenantData } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTenantUsers = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addTeamMember = async (req, res) => {
  const { email, fullName, password, role } = req.body;
  const { tenantId, id: adminId } = req.user;

  try {
    // 1. Check User Limits
    const countRes = await pool.query('SELECT COUNT(*) FROM users WHERE tenant_id = $1', [tenantId]);
    const limitRes = await pool.query('SELECT max_users FROM tenants WHERE id = $1', [tenantId]);
    
    if (parseInt(countRes.rows[0].count) >= limitRes.rows[0].max_users) {
      return res.status(403).json({ success: false, message: 'User limit reached for this plan.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, created_at`,
      [tenantId, email, hashedPassword, fullName, role || 'user']
    );

    // Audit Log
    try {
      await pool.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tenantId, adminId, 'CREATE_USER', 'user', result.rows[0].id, req.ip || '0.0.0.0']
      );
    } catch (logErr) { console.error('Audit failed:', logErr); }

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'Email already exists in this organization' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { full_name, currentPassword, newPassword } = req.body;
  const { id } = req.user;

  try {
    // 1. Fetch the current user to get their hashed password
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = userRes.rows[0];

    if (newPassword) {
      // SECURITY CHECK: Must provide current password to set a new one
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password.' });
      }

      // Verify Current Password
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect current password.' });
      }

      // Hash New Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update Name AND Password
      await pool.query(
        'UPDATE users SET full_name = $1, password_hash = $2 WHERE id = $3',
        [full_name, hashedPassword, id]
      );
    } else {
      // Update Name ONLY (No password checks needed)
      await pool.query(
        'UPDATE users SET full_name = $1 WHERE id = $2',
        [full_name, id]
      );
    }

    // Return updated user object
    const result = await pool.query(
      'SELECT id, email, full_name, role, tenant_id FROM users WHERE id = $1',
      [id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllTenants = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, subdomain, status, subscription_plan, created_at 
      FROM tenants ORDER BY created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('GetAllTenants Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUsersByTenant = async (req, res) => {
  const { tenantId } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('GetUsersByTenant Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};