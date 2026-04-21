const express = require('express');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { requireFields } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', getExpenses);
router.post('/', requireFields(['item', 'amount']), createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
