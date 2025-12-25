const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");

async function runSQLFile(filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  await pool.query(sql);
}

async function runMigrations() {
  const migrationsDir = path.join(__dirname, "../migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    console.log(`Running migration: ${file}`);
    await runSQLFile(path.join(migrationsDir, file));
  }
}

async function runSeeds() {
  const seedFile = path.join(__dirname, "../seeds/seed.sql");
  console.log("Running seed data");
  await runSQLFile(seedFile);
}

(async () => {
  try {
    await runMigrations();
    await runSeeds();
    console.log("Database initialized");
    process.exit(0);
  } catch (err) {
    console.error("DB init failed", err);
    process.exit(1);
  }
})();
