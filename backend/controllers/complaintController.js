const complaintModel = require('../models/complaintModel');
const { sendNotificationEmail } = require('../services/emailService');

async function getComplaints(req, res, next) {
  try {
    const complaints = await complaintModel.list();
    res.json(complaints);
  } catch (error) {
    next(error);
  }
}

async function createComplaint(req, res, next) {
  try {
    const created = await complaintModel.create(req.body);
    await sendNotificationEmail(req.body.userEmail || created.userEmail, {
      action: 'created',
      entity: 'complaint',
      itemName: created.title,
      details: created.description,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function updateComplaint(req, res, next) {
  try {
    const updated = await complaintModel.update(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await sendNotificationEmail(updated.userEmail || req.body.userEmail, {
      action: 'updated',
      entity: 'complaint',
      itemName: updated.title,
      details: updated.description,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteComplaint(req, res, next) {
  try {
    const existing = await complaintModel.getById(req.params.id);
    const deleted = await complaintModel.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (existing) {
      await sendNotificationEmail(existing.userEmail, {
        action: 'deleted',
        entity: 'complaint',
        itemName: existing.title,
        details: existing.description,
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
};
