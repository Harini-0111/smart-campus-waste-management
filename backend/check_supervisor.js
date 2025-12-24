const db = require('./db');

(async () => {
    try {
        const result = await db.query("SELECT username, role FROM users WHERE username = 'supervisor1'");
        console.log('supervisor1 exists:', result.rows.length > 0 ? 'YES' : 'NO');
        if (result.rows.length > 0) {
            console.log('Data:', result.rows[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
