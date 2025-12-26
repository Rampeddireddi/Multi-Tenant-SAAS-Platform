  -- '$2b$10$ZQLX9GV4DdQkOuCmp9myVOINneAh8njta9iWOWS0cN.Ms3l4LBBwS',

-- =========================
-- UUIDs (deterministic)
-- =========================
-- Super Admin
-- 11111111-1111-1111-1111-111111111111

-- Tenant
-- 22222222-2222-2222-2222-222222222222

-- Tenant Admin
-- 33333333-3333-3333-3333-333333333333

-- Regular User
-- 44444444-4444-4444-4444-444444444444

-- Project
-- 55555555-5555-5555-5555-555555555555

-- Task
-- 66666666-6666-6666-6666-666666666666


-- =========================
-- 1️⃣ Super Admin
-- =========================
INSERT INTO users (
  id, email, password_hash, full_name, role, tenant_id
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'superadmin@system.com',
  '$2b$10$ZQLX9GV4DdQkOuCmp9myVOINneAh8njta9iWOWS0cN.Ms3l4LBBwS',
  'System Super Admin',
  'super_admin',
  NULL
)
ON CONFLICT DO NOTHING;


-- =========================
-- 2️⃣ Tenant
-- =========================
INSERT INTO tenants (
  id, name, subdomain, status, subscription_plan, max_users, max_projects
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Test Company Alpha',
  'testalpha',
  'active',
  'free',
  5,
  5
)
ON CONFLICT DO NOTHING;


-- =========================
-- 3️⃣ Tenant Admin
-- =========================
INSERT INTO users (
  id, email, password_hash, full_name, role, tenant_id
)
SELECT
  '33333333-3333-3333-3333-333333333333',
  'admin@testalpha.com',
  '$2b$10$ZQLX9GV4DdQkOuCmp9myVOINneAh8njta9iWOWS0cN.Ms3l4LBBwS',
  'Alpha Tenant Admin',
  'tenant_admin',
  t.id
FROM tenants t
WHERE t.subdomain = 'testalpha'
ON CONFLICT DO NOTHING;


-- =========================
-- 4️⃣ Regular User
-- =========================
INSERT INTO users (
  id, email, password_hash, full_name, role, tenant_id
)
SELECT
  '44444444-4444-4444-4444-444444444444',
  'user@testalpha.com',
  '$2b$10$ZQLX9GV4DdQkOuCmp9myVOINneAh8njta9iWOWS0cN.Ms3l4LBBwS',
  'Alpha User',
  'user',
  t.id
FROM tenants t
WHERE t.subdomain = 'testalpha'
ON CONFLICT DO NOTHING;



-- =========================
-- 5️⃣ Project
-- =========================
INSERT INTO projects (
  id, tenant_id, name, description, status
)
SELECT
  '55555555-5555-5555-5555-555555555555',
  t.id,
  'Alpha Project',
  'Initial seeded project',
  'active'
FROM tenants t
WHERE t.subdomain = 'testalpha'
ON CONFLICT DO NOTHING;



-- =========================
-- 6️⃣ Task
-- =========================

INSERT INTO tasks (
  id,
  project_id,
  tenant_id,
  title,
  description,
  status,
  priority,
  assigned_to
)
SELECT
  '66666666-6666-6666-6666-666666666666',
  p.id,
  p.tenant_id,
  'Initial Setup Task',
  'Seeded task for verification',
  'todo',
  'high',
  u.id
FROM projects p
JOIN users u ON u.email = 'user@testalpha.com'
WHERE p.name = 'Alpha Project'
ON CONFLICT DO NOTHING;

