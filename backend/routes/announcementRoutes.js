const express = require('express');
const {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { requireFields } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', getAnnouncements);
router.post('/', requireFields(['title', 'message']), createAnnouncement);
router.delete('/:id', deleteAnnouncement);

module.exports = router;