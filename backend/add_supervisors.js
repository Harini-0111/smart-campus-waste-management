const db = require('./db');
const bcrypt = require('bcrypt');

(async () => {
    try {
        const hash = await bcrypt.hash('password123', 10);

        // Insert supervisor1
        await db.query(
            `INSERT INTO users (username, password_hash, role, location_id) 
             VALUES ($1, $2, 'block_admin', 'HOSTEL_A') 
             ON CONFLICT (username) DO NOTHING`,
            ['supervisor1', hash]
        );

        // Insert supervisor2
        await db.query(
            `INSERT INTO users (username, password_hash, role, location_id) 
             VALUES ($1, $2, 'block_admin', 'CANTEEN_MAIN') 
             ON CONFLICT (username) DO NOTHING`,
            ['supervisor2', hash]
        );

        console.log('✅ Supervisors added successfully');

        // List all users
        const result = await db.query('SELECT username, role, location_id FROM users ORDER BY role, username');
        console.log('\n=== ALL USERS ===');
        console.log('Role         | Username        | Location');
        console.log('-------------|-----------------|-------------');
        result.rows.forEach(u => {
            console.log(`${u.role.padEnd(12)} | ${u.username.padEnd(15)} | ${u.location_id || 'N/A'}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
