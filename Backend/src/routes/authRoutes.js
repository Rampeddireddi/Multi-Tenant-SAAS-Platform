const express = require('express');
const router = express.Router();

// 1. Import 'authorize' along with 'protect'
const { protect, authorize } = require('../middleware/authMiddleware');

const { 
  registerTenant, 
  login, 
  getMe, 
  getTenantUsers, 
  addTeamMember, 
  updateProfile,
  getAllTenants,
  getUsersByTenant // <--- IMPORT THIS
} = require('../controllers/authController');

// --- Routes ---

// Public
router.post('/register-tenant', registerTenant);
router.post('/login', login);

// Protected
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// User Management (Current Tenant Context)
router.get('/users', protect, getTenantUsers);
router.post('/users', protect, authorize('tenant_admin'), addTeamMember);

// --- SUPER ADMIN ROUTES ---
router.get('/tenants', protect, authorize('super_admin'), getAllTenants);
router.get('/tenants/:tenantId/users', protect, authorize('super_admin'), getUsersByTenant);

module.exports = router;