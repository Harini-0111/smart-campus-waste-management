const { Client } = require('pg');
require('dotenv').config();

async function ensureDatabase() {
    console.log('🔍 Checking local PostgreSQL...');

    // Connect to the default 'postgres' database first
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: 'postgres', // Connect to default db
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 5432,
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL default database.');

        const dbName = process.env.DB_DATABASE || 'ecocampus';
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

        if (res.rowCount === 0) {
            console.log(`🚀 Database "${dbName}" not found. Creating it...`);
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ Database "${dbName}" created successfully.`);
        } else {
            console.log(`✅ Database "${dbName}" already exists.`);
        }
    } catch (err) {
        console.error('❌ Could not connect to local PostgreSQL.');
        console.error('   Error:', err.message);
        console.log('\n💡 Tip: Make sure PostgreSQL is installed and running on your machine.');
    } finally {
        await client.end();
    }
}

ensureDatabase();
