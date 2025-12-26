const pool = require("../config/db");
const bcrypt = require("bcrypt");

/**
 * CREATE USER
 */
exports.createUser = async (req, res) => {
  const { email, password, fullName, role } = req.body;
  const tenantId = req.tenantId;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  if (!["user"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  try {
    // 1️⃣ Check subscription limit
    const limitResult = await pool.query(
      `SELECT max_users FROM tenants WHERE id = $1`,
      [tenantId]
    );

    const maxUsers = limitResult.rows[0].max_users;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1 AND is_active = true`,
      [tenantId]
    );

    if (parseInt(countResult.rows[0].count) >= maxUsers) {
      return res.status(403).json({
        success: false,
        message: "User limit reached for this subscription",
      });
    }

    // 2️⃣ Create user
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role`,
      [tenantId, email, passwordHash, fullName, role]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

/**
 * LIST USERS
 */
exports.listUsers = async (req, res) => {
  const tenantId = req.tenantId;

  const result = await pool.query(
    `SELECT id, email, full_name, role, is_active
     FROM users
     WHERE tenant_id = $1`,
    [tenantId]
  );

  res.json({ success: true, data: result.rows });
};

/**
 * UPDATE USER
 */
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { fullName, role, isActive } = req.body;
  const tenantId = req.tenantId;
  const requester = req.user;

  // Prevent tenant_admin from deactivating himself
  if (
    requester.role === "tenant_admin" &&
    requester.userId === userId &&
    isActive === false
  ) {
    return res.status(403).json({
      success: false,
      message: "You cannot deactivate your own account",
    });
  }

  // Self-update restrictions (non-tenant_admin)
  if (requester.role !== "tenant_admin") {
    if (requester.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (role !== undefined || isActive !== undefined) {
      return res.status(403).json({
        success: false,
        message: "You can only update your name",
      });
    }
  }

  const result = await pool.query(
    `
    UPDATE users
    SET
      full_name = COALESCE($1, full_name),
      role = COALESCE($2, role),
      is_active = COALESCE($3, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4 AND tenant_id = $5
    RETURNING id, email, full_name, role, is_active, updated_at
    `,
    [fullName, role, isActive, userId, tenantId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    message: "User updated successfully",
    data: result.rows[0],
  });
};


/**
 * DEACTIVATE USER
 */
exports.deactivateUser = async (req, res) => {
  const { userId } = req.params;
  const tenantId = req.tenantId;

  // Prevent self-deactivation
  if (userId === req.user.userId) {
    return res.status(400).json({
      success: false,
      message: "You cannot deactivate yourself",
    });
  }

  const result = await pool.query(
    `UPDATE users
     SET is_active = false
     WHERE id = $1 AND tenant_id = $2
     RETURNING id`,
    [userId, tenantId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.json({ success: true, message: "User deactivated" });
};
