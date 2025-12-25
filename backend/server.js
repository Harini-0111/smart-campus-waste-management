const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const wasteRoutes = require('./routes/wasteRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint with DB test (Moved above routes for reliability)
app.get('/api/v1/health', async (req, res) => {
    try {
        const db = require('./db');
        await db.query('SELECT NOW()');
        res.json({
            status: 'success',
            message: 'Server is running',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('DATABASE ERROR:', err);
        res.status(500).json({
            status: 'error',
            message: 'Server is running but database connection failed',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Temporary Database Initialization Route
app.post('/api/v1/init-db', async (req, res) => {
    try {
        const { initializeSchema } = require('./db/dbSchema');
        await initializeSchema();
        res.json({ success: true, message: 'Database schema initialized successfully' });
    } catch (err) {
        console.error('Schema Init Error:', err);
        res.status(500).json({ error: 'Failed to initialize schema', message: err.message });
    }
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', wasteRoutes);

// Root route for sanity check
app.get('/', (req, res) => {
    res.send('Smart Campus Waste Management System API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
