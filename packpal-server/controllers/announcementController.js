const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  reactToAnnouncement,
  markAsRead
} = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/auth');

// Routes for /api/announcements
router.route('/')
  .get(getAnnouncements)
  .post(protect, admin, createAnnouncement);

router.route('/:id')
  .get(getAnnouncementById)
  .put(protect, admin, updateAnnouncement)
  .delete(protect, admin, deleteAnnouncement);

router.route('/:id/react')
  .post(protect, reactToAnnouncement);

router.route('/:id/read')
  .post(protect, markAsRead);

module.exports = router;