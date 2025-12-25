const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    let user;
    let tenantId = null;

    if (tenantSubdomain) {
      const tenantResult = await pool.query(
        "SELECT id, status FROM tenants WHERE subdomain = $1",
        [tenantSubdomain]
      );

      if (tenantResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Tenant not found" });
      }

      if (tenantResult.rows[0].status !== "active") {
        return res.status(403).json({ success: false, message: "Tenant inactive" });
      }

      tenantId = tenantResult.rows[0].id;

      const userResult = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND tenant_id = $2",
        [email, tenantId]
      );

      user = userResult.rows[0];
    } else {

        const userResult = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND role = 'super_admin'",
        [email]
      );

      user = userResult.rows[0];
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Account inactive" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
        },
        token,
        expiresIn: 86400,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//register tenant

exports.registerTenant = async (req, res) => {
  const {
    tenantName,
    subdomain,
    adminEmail,
    adminPassword,
    adminFullName,
  } = req.body;

  if (
    !tenantName ||
    !subdomain ||
    !adminEmail ||
    !adminPassword ||
    !adminFullName
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Check subdomain uniqueness
    const existingTenant = await client.query(
      "SELECT id FROM tenants WHERE subdomain = $1",
      [subdomain]
    );

    if (existingTenant.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "Subdomain already exists",
      });
    }

    // 2️⃣ Create tenant
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain)
       VALUES ($1, $2)
       RETURNING id, subdomain`,
      [tenantName, subdomain]
    );

    const tenantId = tenantResult.rows[0].id;

    // 3️⃣ Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // 4️⃣ Create tenant admin
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin')
       RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, passwordHash, adminFullName]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId,
        subdomain,
        adminUser: userResult.rows[0],
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");

    if (err.code === "23505") {
      // unique violation
      return res.status(409).json({
        success: false,
        message: "Email already exists for this tenant",
      });
    }

    console.error(err);
    res.status(500).json({
      success: false,
      message: "Tenant registration failed",
    });
  } finally {
    client.release();
  }
};
