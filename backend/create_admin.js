require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

async function upsertAdmin() {
  const username = 'admin';
  const email = 'admin@demo.com';
  const password = 'admin123';

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (username, password_hash, role, email, email_verified)
       VALUES ($1, $2, 'admin', $3, true)
       ON CONFLICT (username) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = 'admin',
           email = EXCLUDED.email,
           email_verified = true`,
      [username, hash, email]
    );

    console.log('Admin user ready. Login with:');
    console.log('username: admin');
    console.log('password: admin123');
  } catch (err) {
    console.error('Failed to seed admin:', err.message);
  }
}

upsertAdmin();
