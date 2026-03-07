const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Report, User } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/reports — Public: list verified reports
router.get('/', async (req, res) => {
  try {
    const { status = 'verified', category, limit = 20, offset = 0 } = req.query;
    const where = { status };
    if (category) where.category = category;
    const reports = await Report.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['username'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.json({ data: reports.rows, total: reports.count });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/reports/all — Admin only: all reports including pending
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [{ model: User, attributes: ['username'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ data: reports });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/reports/mine — Editor: their own reports (all statuses)
router.get('/mine', auth, async (req, res) => {
  try {
    const reports = await Report.findAll({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ['username'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ data: reports });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['username'] }]
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    await report.increment('views');
    res.json({ data: report });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/reports — Authenticated users submit reports
router.post('/',
  auth,
  [
    body('title').isLength({ min: 10, max: 300 }).trim(),
    body('content').isLength({ min: 50 }).trim(),
    body('source_url').optional().isURL()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { title, content, source_url, category } = req.body;
      const report = await Report.create({
        user_id: req.user.id,
        title, content, source_url, category,
        status: 'pending'
      });
      res.status(201).json({ message: 'Report submitted for review', data: report });
    } catch (err) {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
);

// PUT /api/reports/:id — Edit own pending report
router.put('/:id',
  auth,
  [
    body('title').isLength({ min: 10, max: 300 }).trim(),
    body('content').isLength({ min: 50 }).trim(),
    body('source_url').optional().isURL()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const report = await Report.findByPk(req.params.id);
      if (!report) return res.status(404).json({ error: 'Report not found' });
      if (report.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You can only edit your own reports' });
      }
      if (report.status !== 'pending') {
        return res.status(400).json({ error: 'Only pending reports can be edited' });
      }
      const { title, content, source_url, category } = req.body;
      await report.update({ title, content, source_url, category });
      res.json({ message: 'Report updated', data: report });
    } catch (err) {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
);

// PUT /api/reports/:id/verify — Admin only
router.put('/:id/verify', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be verified or rejected' });
    }
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    await report.update({ status });
    res.json({ message: `Report ${status}`, data: report });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// DELETE /api/reports/:id — Author (pending only) or Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    const isAdmin = req.user.role === 'admin';
    const isAuthor = report.user_id === req.user.id;
    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ error: 'You can only delete your own reports' });
    }
    if (!isAdmin && report.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending reports can be deleted' });
    }
    await report.destroy();
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
