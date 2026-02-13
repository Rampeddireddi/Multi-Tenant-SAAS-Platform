-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Super Admin Account
-- Email: superadmin@system.com, Password: Admin@123, Role: super_admin
INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
VALUES (
    NULL, 
    'superadmin@system.com', 
    crypt('Admin@123', gen_salt('bf')), 
    'System Super Admin', 
    'super_admin', 
    true
) ON CONFLICT (tenant_id, email) DO NOTHING;

-- 2. Sample Tenant
-- Name: Demo Company, Subdomain: demo, Status: active, Plan: pro
INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES ('Demo Company', 'demo', 'active', 'pro', 25, 15)
ON CONFLICT (subdomain) DO NOTHING;

-- 3. Tenant Admin for Demo Company
-- Email: admin@demo.com, Password: Demo@123, Role: tenant_admin
INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
SELECT 
    id, 
    'admin@demo.com', 
    crypt('Demo@123', gen_salt('bf')), 
    'Demo Admin', 
    'tenant_admin', 
    true
FROM tenants WHERE subdomain = 'demo'
ON CONFLICT (tenant_id, email) DO NOTHING;

-- 4. Two Regular Users for Demo Company
-- User 1: user1@demo.com / User@123
INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
SELECT 
    id, 
    'user1@demo.com', 
    crypt('User@123', gen_salt('bf')), 
    'User One', 
    'user', 
    true
FROM tenants WHERE subdomain = 'demo'
ON CONFLICT (tenant_id, email) DO NOTHING;

-- User 2: user2@demo.com / User@123
INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
SELECT 
    id, 
    'user2@demo.com', 
    crypt('User@123', gen_salt('bf')), 
    'User Two', 
    'user', 
    true
FROM tenants WHERE subdomain = 'demo'
ON CONFLICT (tenant_id, email) DO NOTHING;

-- 5. Two Sample Projects for Demo Company
-- Project 1: Website Redesign
INSERT INTO projects (tenant_id, name, description, status, created_by)
SELECT 
    t.id, 
    'Website Redesign', 
    'Overhaul of the corporate website', 
    'active', 
    u.id
FROM tenants t
JOIN users u ON u.email = 'admin@demo.com' AND u.tenant_id = t.id
WHERE t.subdomain = 'demo'
AND NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Website Redesign' AND tenant_id = t.id);

-- Project 2: Mobile App Launch
INSERT INTO projects (tenant_id, name, description, status, created_by)
SELECT 
    t.id, 
    'Mobile App Launch', 
    'iOS and Android release', 
    'active', 
    u.id
FROM tenants t
JOIN users u ON u.email = 'admin@demo.com' AND u.tenant_id = t.id
WHERE t.subdomain = 'demo'
AND NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Mobile App Launch' AND tenant_id = t.id);

-- 6. Five Sample Tasks distributed across projects
-- Task 1: Design Homepage (Linked to Website Redesign)
INSERT INTO tasks (tenant_id, project_id, title, status, priority, assigned_to)
SELECT 
    t.id, 
    p.id, 
    'Design Homepage', 
    'in_progress', 
    'high', 
    u.id
FROM tenants t
JOIN projects p ON p.tenant_id = t.id AND p.name = 'Website Redesign'
JOIN users u ON u.email = 'user1@demo.com' AND u.tenant_id = t.id
WHERE t.subdomain = 'demo'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Design Homepage' AND project_id = p.id);

-- Task 2: Setup React Router (Linked to Website Redesign)
INSERT INTO tasks (tenant_id, project_id, title, status, priority, assigned_to)
SELECT 
    t.id, 
    p.id, 
    'Setup React Router', 
    'todo', 
    'medium', 
    u.id
FROM tenants t
JOIN projects p ON p.tenant_id = t.id AND p.name = 'Website Redesign'
JOIN users u ON u.email = 'user2@demo.com' AND u.tenant_id = t.id
WHERE t.subdomain = 'demo'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Setup React Router' AND project_id = p.id);

-- Task 3: API Integration (Linked to Mobile App)
INSERT INTO tasks (tenant_id, project_id, title, status, priority, assigned_to)
SELECT 
    t.id, 
    p.id, 
    'API Integration', 
    'todo', 
    'high', 
    u.id
FROM tenants t
JOIN projects p ON p.tenant_id = t.id AND p.name = 'Mobile App Launch'
JOIN users u ON u.email = 'admin@demo.com' AND u.tenant_id = t.id
WHERE t.subdomain = 'demo'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'API Integration' AND project_id = p.id);

-- Task 4: App Icon Design (Linked to Mobile App)
INSERT INTO tasks (tenant_id, project_id, title, status, priority, assigned_to)
SELECT 
    t.id, 
    p.id, 
    'App Icon Design', 
    'completed', 
    'low', 
    u.id
FROM tenants t
JOIN projects p ON p.tenant_id = t.id AND p.name = 'Mobile App Launch'
JOIN users u ON u.email = 'user1@demo.com' AND u.tenant_id = t.id
WHERE t.subdomain = 'demo'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'App Icon Design' AND project_id = p.id);

-- Task 5: QA Testing (Linked to Mobile App)
INSERT INTO tasks (tenant_id, project_id, title, status, priority, assigned_to)
SELECT 
    t.id, 
    p.id, 
    'QA Testing', 
    'todo', 
    'medium', 
    u.id
FROM tenants t
JOIN projects p ON p.tenant_id = t.id AND p.name = 'Mobile App Launch'
JOIN users u ON u.email = 'user2@demo.com' AND u.tenant_id = t.id
WHERE t.subdomain = 'demo'
AND NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'QA Testing' AND project_id = p.id);