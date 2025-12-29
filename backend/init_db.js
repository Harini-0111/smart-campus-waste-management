const db = require('./db');
const { initializeSchema } = require('./db/dbSchema');

async function initDatabase() {
  try {
    console.log('🔄 Reinitializing database...');
    await initializeSchema();
    console.log('✅ Database initialized successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

initDatabase();
