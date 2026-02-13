const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Construct Connection Configuration
// This supports both DATABASE_URL (if you added it) OR the separate DB_ variables you already have.
const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    };

const pool = new Pool(dbConfig);

// 2. Define Absolute Paths
// Navigates from 'backend/src/utils' up to 'backend/'
const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');
const SEED_FILE = path.join(__dirname, '../../seeds/seed_data.sql');

/**
 * Helper: Wait for Database to be ready (Retry Logic)
 * Solves the "ECONNREFUSED" error when the DB starts slower than the backend.
 */
const waitForDatabase = async (retries = 15, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Connected to Database');
      return true;
    } catch (err) {
      const host = process.env.DB_HOST || 'unknown';
      console.log(`⏳ Database not ready at ${host}:5432 (Attempt ${i + 1}/${retries}). Retrying in 3s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error('Could not connect to database after multiple retries. Exiting.');
};

/**
 * Runs all SQL migration files found in backend/migrations
 */
const runMigrations = async () => {
  console.log('🔄 Starting database initialization...');
  
  try {
    // Wait for DB connection before doing anything
    await waitForDatabase();

    // Check if directory exists
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      throw new Error(`Migrations directory not found at: ${MIGRATIONS_DIR}`);
    }

    // Read and Sort files (ensures 001 runs before 002)
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found.');
      return;
    }

    console.log(`📂 Found ${files.length} migration files.`);

    // Execute each file sequentially
    for (const file of files) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`▶️  Executing migration: ${file}`);
      await pool.query(sql);
    }
    
    console.log('✅ All migrations applied successfully.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1); // Critical error, stop the server so Docker can restart it
  }
};

/**
 * Loads seed data from backend/seeds/seed_data.sql
 */
const seedData = async () => {
  console.log('🌱 Checking for seed data...');

  try {
    if (fs.existsSync(SEED_FILE)) {
      const sql = fs.readFileSync(SEED_FILE, 'utf8');
      
      console.log(`📖 Executing seed file: seed_data.sql`);
      await pool.query(sql);
      
      console.log('✅ Database seeded successfully!');
    } else {
      console.warn(`⚠️  Seed file not found at: ${SEED_FILE}`);
    }
  } catch (error) {
    // Ignore duplicate key errors (code 23505) which happen on restarts
    if (error.code === '23505') {
      console.log('ℹ️  Seed data already exists (Skipping).');
    } else {
      console.error('❌ Seeding failed:', error);
    }
  }
};

module.exports = { pool, runMigrations, seedData };