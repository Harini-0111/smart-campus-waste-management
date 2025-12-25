const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing PostgreSQL connection...\n');
    console.log('Configuration:');
    console.log(`  Host: ${process.env.DB_HOST}`);
    console.log(`  Port: ${process.env.DB_PORT}`);
    console.log(`  User: ${process.env.DB_USER}`);
    console.log(`  Database: ${process.env.DB_DATABASE}\n`);

    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });

    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Connection successful!');
        console.log(`   Server time: ${result.rows[0].now}`);
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.log('❌ Connection failed!');
        console.log(`   Error: ${err.message}\n`);

        if (err.code === '3D000') {
            console.log('💡 Database does not exist. Run: node create_db.js');
        } else if (err.code === '28P01') {
            console.log('💡 Authentication failed. Check your password in .env file');
        } else if (err.code === 'ECONNREFUSED') {
            console.log('💡 PostgreSQL server is not running. Start it with:');
            console.log('   - Windows: Open Services and start "postgresql-x64-XX"');
            console.log('   - Or use pgAdmin to start the server');
        }

        await pool.end();
        process.exit(1);
    }
}

testConnection();
