const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} = require('../controllers/projectController');

// Import Task Routes to mount them under projects
const taskRoutes = require('./taskRoutes');

router.use(protect);

router.use('/:projectId/tasks', taskRoutes);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(authorize('tenant_admin'), deleteProject);

module.exports = router;