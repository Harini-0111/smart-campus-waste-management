try {
    const mw = require('./middleware/authMiddleware');
    console.log('Middleware imported successfully');
    console.log('authenticateToken:', typeof mw.authenticateToken);
    console.log('authorizeRoles:', typeof mw.authorizeRoles);
} catch (err) {
    console.error('Import failed:', err.message);
}
