const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const db = require('./db');
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
app.use('/uploads', express.static('uploads'));

// Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check with real-time email & db testing
app.get('/api/v1/health', async (req, res) => {
    let dbStatus = 'Disconnected';
    let emailStatus = 'Not Configured';

    try {
        await db.query('SELECT 1');
        dbStatus = 'Connected';
    } catch (err) {
        dbStatus = `Error: ${err.message}`;
    }

    try {
        const user = process.env.EMAIL_USER;
        const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
        if (user && pass) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user, pass },
                connectionTimeout: 30000,
                greetingTimeout: 30000
            });
            await transporter.verify();
            emailStatus = 'Connected';
        }
    } catch (err) {
        emailStatus = `Error: ${err.message}`;
    }

    res.json({
        status: dbStatus === 'Connected' ? 'ok' : 'degraded',
        database: dbStatus,
        email: emailStatus,
        config: {
            email_user: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : 'Not Set',
            has_email_pass: !!process.env.EMAIL_PASS
        },
        timestamp: new Date().toISOString()
    });
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

app.get('/', (req, res) => {
    res.send('Smart Campus Waste Management System API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
