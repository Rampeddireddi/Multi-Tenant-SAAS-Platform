CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  subdomain VARCHAR UNIQUE NOT NULL,
  status VARCHAR CHECK (status IN ('active','suspended','trial')) DEFAULT 'active',
  subscription_plan VARCHAR CHECK (subscription_plan IN ('free','pro','enterprise')) DEFAULT 'free',
  max_users INT DEFAULT 5,
  max_projects INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
