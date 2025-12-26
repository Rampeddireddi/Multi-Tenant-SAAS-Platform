ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS priority VARCHAR
    CHECK (priority IN ('low','medium','high'))
    DEFAULT 'medium';

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS due_date DATE;
