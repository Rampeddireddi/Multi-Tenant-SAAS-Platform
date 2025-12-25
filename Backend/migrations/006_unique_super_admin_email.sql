CREATE UNIQUE INDEX IF NOT EXISTS unique_super_admin_email
ON users (email)
WHERE role = 'super_admin';
