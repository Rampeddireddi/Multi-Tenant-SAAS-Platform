const { pool } = require('../utils/db-init');

exports.checkHealth = async (req, res) => {
  try {
    // Check DB connection
    await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: error.message
    });
  }
};