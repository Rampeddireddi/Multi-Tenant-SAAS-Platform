const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const enforceTenant = require("../middleware/tenant.middleware");
const { getDashboardSummary } = require("../controllers/dashboard.controller");

router.get("/summary", authenticate, enforceTenant, getDashboardSummary);

module.exports = router;
