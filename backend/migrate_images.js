const db = require('./db');

async function migrate() {
    try {
        await db.query(`
      ALTER TABLE waste_logs 
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
    `);
        console.log('Schema updated: added image_url to waste_logs');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
