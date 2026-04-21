const expenseModel = require('../models/expenseModel');
const { sendNotificationEmail } = require('../services/emailService');

async function getExpenses(req, res, next) {
  try {
    const expenses = await expenseModel.list();
    res.json(expenses);
  } catch (error) {
    next(error);
  }
}

async function createExpense(req, res, next) {
  try {
    const created = await expenseModel.create(req.body);
    await sendNotificationEmail(req.body.userEmail || created.userEmail, {
      action: 'created',
      entity: 'expense',
      itemName: created.item,
      details: `Amount: ${created.amount}${created.note ? `, Note: ${created.note}` : ''}`,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function updateExpense(req, res, next) {
  try {
    const updated = await expenseModel.update(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await sendNotificationEmail(updated.userEmail || req.body.userEmail, {
      action: 'updated',
      entity: 'expense',
      itemName: updated.item,
      details: `Amount: ${updated.amount}${updated.note ? `, Note: ${updated.note}` : ''}`,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const existing = await expenseModel.getById(req.params.id);
    const deleted = await expenseModel.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (existing) {
      await sendNotificationEmail(existing.userEmail, {
        action: 'deleted',
        entity: 'expense',
        itemName: existing.item,
        details: `Amount: ${existing.amount}${existing.note ? `, Note: ${existing.note}` : ''}`,
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
