const db = require('./db');

(async () => {
    try {
        // Test exact query from authRoutes
        const result = await db.query('SELECT * FROM users WHERE username = $1', ['supervisor1']);
        console.log('Query result:', result.rows.length, 'rows');
        if (result.rows.length > 0) {
            console.log('User found:', result.rows[0]);
        } else {
            console.log('User NOT found');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
