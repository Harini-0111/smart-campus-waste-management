const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    user: connectionString ? undefined : process.env.DB_USER,
    host: connectionString ? undefined : process.env.DB_HOST,
    database: connectionString ? undefined : process.env.DB_DATABASE,
    password: connectionString ? undefined : process.env.DB_PASSWORD,
    port: connectionString ? undefined : process.env.DB_PORT,
    ssl: connectionString ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
    console.log('✅ Database client connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle database client:', err.message);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};
