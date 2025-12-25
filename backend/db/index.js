const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    // If no connectionString, fallback to individual vars
    user: connectionString ? undefined : process.env.DB_USER,
    host: connectionString ? undefined : process.env.DB_HOST,
    database: connectionString ? undefined : process.env.DB_DATABASE,
    password: connectionString ? undefined : process.env.DB_PASSWORD,
    port: connectionString ? undefined : process.env.DB_PORT,
    // Modern cloud DBs (Render, Neon, etc.) need SSL in production
    ssl: connectionString ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};
