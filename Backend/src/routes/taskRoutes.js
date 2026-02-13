const express = require('express');
const router = express.Router({ mergeParams: true }); 

const { protect } = require('../middleware/authMiddleware');
const { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  getUserTasks 
} = require('../controllers/taskController');
const { pool } = require('../utils/db-init');

// Apply Auth Middleware
router.use(protect);

// Get tasks assigned to logged-in user (Dashboard use)
router.get('/my-tasks', getUserTasks);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:taskId')
  // Simple handler to get single task details (Requirement for 19 endpoints)
  .get(async (req, res) => {
      try {
          const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.taskId]);
          if (result.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
          res.json({ success: true, data: result.rows[0] });
      } catch(e) { res.status(500).send('Server Error'); }
  })
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;