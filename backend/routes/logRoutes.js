const express = require('express');
const {
  getLogs,
  createLog,
  updateLog,
  deleteLog,
} = require('../controllers/logController');
const { requireFields } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', getLogs);
router.post('/', requireFields(['type', 'timestamp']), createLog);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

module.exports = router;
