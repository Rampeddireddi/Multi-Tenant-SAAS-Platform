-- 1. Drop old constraint (if any)
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_status_check;

-- 2. Normalize existing data
UPDATE tasks
SET status = 'todo'
WHERE status = 'pending';

-- 3. Add new constraint
ALTER TABLE tasks
ADD CONSTRAINT tasks_status_check
CHECK (status IN ('todo','in_progress','completed'));
