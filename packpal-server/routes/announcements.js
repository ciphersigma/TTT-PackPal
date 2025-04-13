// routes/announcements.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Announcement = require('../models/Announcement');

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Public
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');
    
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/announcements
// @desc    Create a new announcement
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }
    
    const { title, message } = req.body;
    
    // Create new announcement
    const announcement = new Announcement({
      title,
      message,
      createdBy: req.user.id // This is required by your schema
    });
    
    await announcement.save();
    
    // Return the saved announcement
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name');
    
    res.status(201).json(populatedAnnouncement);
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as an admin' });
    }
    
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    await announcement.remove();
    
    res.json({ message: 'Announcement removed', id: req.params.id });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

