const express = require('express');
const router = express.Router();
const { Item, Category, Location } = require('../models');

// GET /api/items — All items with categories
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query;
    const where = category_id ? { category_id } : {};
    const items = await Item.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name', 'color', 'icon'] }],
      order: [['category_id', 'ASC'], ['name', 'ASC']]
    });
    res.json({ data: items });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/items/categories — All categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json({ data: categories });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/items/locations — All locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await Location.findAll({ order: [['state_name', 'ASC']] });
    res.json({ data: locations });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id, { include: [Category] });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
