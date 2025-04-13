// routes/settings.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GlobalSettings = require('../models/GlobalSettings');

// @route   GET /api/settings
// @desc    Get global settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Find settings or create default if none exist
    let settings = await GlobalSettings.findOne({});
    
    if (!settings) {
      settings = await GlobalSettings.create({
        wasteReduction: 42,
        costSavings: 12450,
        optimizedPackages: 8672,
        recyclablePercentage: 78
      });
    }
    
    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings
// @desc    Update global settings
// @access  Private/Admin
router.put('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }
    
    const {
      wasteReduction,
      costSavings,
      optimizedPackages,
      recyclablePercentage
    } = req.body;
    
    // Find and update settings
    let settings = await GlobalSettings.findOne({});
    
    if (!settings) {
      // Create settings if they don't exist
      settings = new GlobalSettings({
        wasteReduction,
        costSavings,
        optimizedPackages,
        recyclablePercentage,
        updatedBy: req.user.id
      });
    } else {
      // Update existing settings
      settings.wasteReduction = wasteReduction;
      settings.costSavings = costSavings;
      settings.optimizedPackages = optimizedPackages;
      settings.recyclablePercentage = recyclablePercentage;
      settings.lastUpdated = Date.now();
      settings.updatedBy = req.user.id;
    }
    
    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;