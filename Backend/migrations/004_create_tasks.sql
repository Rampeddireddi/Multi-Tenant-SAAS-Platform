CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  project_id UUID NOT NULL
    REFERENCES projects(id) ON DELETE CASCADE,

  tenant_id UUID NOT NULL
    REFERENCES tenants(id) ON DELETE CASCADE,

  title VARCHAR NOT NULL,
  description TEXT,

  status VARCHAR
    CHECK (status IN ('todo','in_progress','completed'))
    DEFAULT 'todo',

  priority VARCHAR
    CHECK (priority IN ('low','medium','high'))
    DEFAULT 'medium',

  assigned_to UUID
    REFERENCES users(id),

  due_date DATE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
