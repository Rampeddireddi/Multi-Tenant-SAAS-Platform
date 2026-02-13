const express = require('express');
const { getAllTenants } = require('../controllers/tenantController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Only Super Admin can access this
router.get('/', protect, authorize('super_admin'), getAllTenants);

module.exports = router;