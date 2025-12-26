CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
