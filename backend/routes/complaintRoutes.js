const express = require('express');
const {
  getComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { requireFields } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', getComplaints);
router.post('/', requireFields(['title', 'description', 'studentName', 'hostelBuilding', 'roomNo']), createComplaint);
router.put('/:id', updateComplaint);
router.delete('/:id', deleteComplaint);

module.exports = router;
