-- Super Admin (tenant_id = NULL)
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'superadmin@system.com',
  '$2b$10$ZQLX9GV4DdQkOuCmp9myVOINneAh8njta9iWOWS0cN.Ms3l4LBBwS',
  'Super Admin',
  'super_admin'
)
ON CONFLICT DO NOTHING;
