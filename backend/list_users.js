const db = require('./db');

(async () => {
    try {
        const result = await db.query('SELECT username, role, location_id FROM users ORDER BY role, username');
        console.log('\n=== USERS IN DATABASE ===\n');
        console.log('Role         | Username        | Location');
        console.log('-------------|-----------------|-------------');
        result.rows.forEach(u => {
            console.log(`${u.role.padEnd(12)} | ${u.username.padEnd(15)} | ${u.location_id || 'N/A'}`);
        });
        console.log('\n');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
