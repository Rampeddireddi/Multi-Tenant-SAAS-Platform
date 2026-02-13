const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { pool, runMigrations, seedData } = require('./utils/db-init');

// Load Environment Variables
dotenv.config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes'); // Import this

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- MOUNT ROUTES ---
app.use('/api/auth', authRoutes);

// Projects Route (Handles /api/projects/:id/tasks internally via mergeParams)
app.use('/api/projects', projectRoutes);

// CRITICAL FIX: Mount Tasks globally so "/api/tasks/my-tasks" works
app.use('/api/tasks', taskRoutes); 

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Run Migrations & Seeds
    await runMigrations();
    await seedData();

    // 2. Start Server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();