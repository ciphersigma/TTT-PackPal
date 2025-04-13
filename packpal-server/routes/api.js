// routes/api.js
const express = require('express');
const router = express.Router();

// @route   GET /api/status
// @desc    Check API status
// @access  Public
router.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() });
});

module.exports = router;