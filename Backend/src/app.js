const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const dashboardRoutes = require("./routes/dashboard.routes");
const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");
const userRoutes = require("./routes/users.routes");
const projectRoutes = require("./routes/projects.routes");
const taskRoutes = require("./routes/tasks.routes");
const tenantsRoutes = require("./routes/tenants.routes");



const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tenants", tenantsRoutes);


app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

module.exports = app;
