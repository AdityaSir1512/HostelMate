const announcementModel = require('../models/announcementModel');

async function getAnnouncements(req, res, next) {
  try {
    const announcements = await announcementModel.list();
    res.json(announcements);
  } catch (error) {
    next(error);
  }
}

async function createAnnouncement(req, res, next) {
  try {
    const created = await announcementModel.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function deleteAnnouncement(req, res, next) {
  try {
    const deleted = await announcementModel.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
};