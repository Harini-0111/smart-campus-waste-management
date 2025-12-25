const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function check() {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM waste_logs');
        console.log('WASTE_LOGS_COUNT:', res.rows[0].count);
        const logs = await pool.query('SELECT * FROM waste_logs LIMIT 5');
        console.log('RECENT_LOGS:', JSON.stringify(logs.rows, null, 2));
    } catch (err) {
        console.error('DATABASE_CHECK_ERROR:', err.message);
    } finally {
        await pool.end();
    }
}

check();
