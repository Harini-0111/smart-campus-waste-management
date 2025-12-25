const { Pool } = require('pg');
require('dotenv').config();

async function createDatabase() {
    // Connect to postgres database to create our database
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres', // Connect to default postgres database
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        console.log('🔗 Connecting to PostgreSQL...');
        
        // Check if database exists
        const checkDb = await pool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [process.env.DB_DATABASE]
        );

        if (checkDb.rows.length === 0) {
            console.log(`📦 Creating database: ${process.env.DB_DATABASE}`);
            await pool.query(`CREATE DATABASE ${process.env.DB_DATABASE}`);
            console.log('✅ Database created successfully!');
        } else {
            console.log('✅ Database already exists!');
        }

        await pool.end();
        console.log('🎯 Ready to initialize schema');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database creation failed:', err.message);
        await pool.end();
        process.exit(1);
    }
}

createDatabase();