const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function diagnose() {
    console.log('--- DIAGNOSIS START ---');
    console.log('PORT:', process.env.PORT);
    console.log('DATABASE_URL starts with:', (process.env.DATABASE_URL || '').substring(0, 20));
    console.log('EMAIL_USER:', process.env.EMAIL_USER);

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render') ? { rejectUnauthorized: false } : false
    });

    try {
        await pool.query('SELECT 1');
        console.log('✅ DATABASE: Connected');
    } catch (err) {
        console.log('❌ DATABASE: Connection Failed');
        console.log('   Error:', err.message);
        console.log('   Stack:', err.stack);
    } finally {
        await pool.end();
    }

    try {
        const user = process.env.EMAIL_USER;
        const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
        if (user && pass) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user, pass }
            });
            await transporter.verify();
            console.log('✅ EMAIL: Connected');
        } else {
            console.log('⚠️  EMAIL: Not configured (missing user/pass)');
        }
    } catch (err) {
        console.log('❌ EMAIL: Verification Failed');
        console.log('   Error:', err.message);
    }
    console.log('--- DIAGNOSIS END ---');
}

diagnose();
