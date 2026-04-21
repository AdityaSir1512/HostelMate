const logModel = require('../models/logModel');
const { sendNotificationEmail } = require('../services/emailService');

async function getLogs(req, res, next) {
  try {
    const logs = await logModel.list();
    res.json(logs);
  } catch (error) {
    next(error);
  }
}

async function createLog(req, res, next) {
  try {
    const created = await logModel.create(req.body);
    await sendNotificationEmail(req.body.userEmail || created.userEmail, {
      action: 'created',
      entity: 'log entry',
      itemName: String(created.type || '').toUpperCase(),
      details: `Timestamp: ${created.timestamp}${created.note ? `, Note: ${created.note}` : ''}`,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function updateLog(req, res, next) {
  try {
    const updated = await logModel.update(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    await sendNotificationEmail(updated.userEmail || req.body.userEmail, {
      action: 'updated',
      entity: 'log entry',
      itemName: String(updated.type || '').toUpperCase(),
      details: `Timestamp: ${updated.timestamp}${updated.note ? `, Note: ${updated.note}` : ''}`,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteLog(req, res, next) {
  try {
    const existing = await logModel.getById(req.params.id);
    const deleted = await logModel.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Log entry not found' });
    }

    if (existing) {
      await sendNotificationEmail(existing.userEmail, {
        action: 'deleted',
        entity: 'log entry',
        itemName: String(existing.type || '').toUpperCase(),
        details: `Timestamp: ${existing.timestamp}${existing.note ? `, Note: ${existing.note}` : ''}`,
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLogs,
  createLog,
  updateLog,
  deleteLog,
};
