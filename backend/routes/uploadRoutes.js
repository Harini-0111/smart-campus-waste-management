const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/v1/upload
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return URL for the uploaded file
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: imageUrl
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
