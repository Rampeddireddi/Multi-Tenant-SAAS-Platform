const express = require("express");
const router = express.Router();
const { getTenants } = require("../controllers/tenants.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth, getTenants);

module.exports = router;
