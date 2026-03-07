const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const { Item, Category, Location, PriceLog } = require('../models');
const sequelize = require('../config/database');

// GET /api/prices/summary — Latest avg prices per item with delta
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Get latest day avg prices per item
    const todayPrices = await sequelize.query(`
      SELECT 
        pl.item_id,
        AVG(pl.price) as avg_price,
        DATE(pl.recorded_at) as price_date
      FROM price_logs pl
      WHERE DATE(pl.recorded_at) = DATE(NOW())
      GROUP BY pl.item_id, DATE(pl.recorded_at)
      LIMIT 200
    `, { type: sequelize.QueryTypes.SELECT });

    // Fallback: get most recent day if today has no data
    const recentPrices = todayPrices.length > 0 ? todayPrices :
      await sequelize.query(`
        SELECT 
          pl.item_id,
          AVG(pl.price) as avg_price,
          MAX(DATE(pl.recorded_at)) as price_date
        FROM price_logs pl
        WHERE DATE(pl.recorded_at) = (SELECT MAX(DATE(recorded_at)) FROM price_logs)
        GROUP BY pl.item_id
        LIMIT 200
      `, { type: sequelize.QueryTypes.SELECT });

    // Get previous day
    const prevPrices = await sequelize.query(`
      SELECT 
        pl.item_id,
        AVG(pl.price) as avg_price
      FROM price_logs pl
      WHERE DATE(pl.recorded_at) = (SELECT MAX(DATE(recorded_at)) FROM price_logs) - INTERVAL '1 day'
      GROUP BY pl.item_id
      LIMIT 200
    `, { type: sequelize.QueryTypes.SELECT });

    const prevMap = {};
    prevPrices.forEach(p => { prevMap[p.item_id] = parseFloat(p.avg_price); });

    const items = await Item.findAll({ include: [Category] });
    const itemMap = {};
    items.forEach(i => { itemMap[i.id] = i; });

    const result = recentPrices.map(p => {
      const item = itemMap[p.item_id];
      if (!item) return null;
      const current = parseFloat(p.avg_price);
      const prev = prevMap[p.item_id];
      const delta = prev ? ((current - prev) / prev * 100).toFixed(2) : 0;
      return {
        item_id: p.item_id,
        item_name: item.name,
        unit: item.unit,
        category: item.Category?.name,
        category_color: item.Category?.color,
        avg_price: Math.round(current),
        delta: parseFloat(delta),
        price_date: p.price_date
      };
    }).filter(Boolean);

    res.json({ data: result, count: result.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/prices/:itemId — Price history for chart (60 days)
router.get('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { location_id, days = 60 } = req.query;

    const whereClause = { item_id: itemId };
    if (location_id) whereClause.location_id = location_id;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let query;
    if (location_id) {
      query = await sequelize.query(`
        SELECT 
          DATE(recorded_at) as date,
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price
        FROM price_logs
        WHERE item_id = :itemId
          AND location_id = :locationId
          AND recorded_at >= :startDate
        GROUP BY DATE(recorded_at)
        ORDER BY date ASC
      `, {
        replacements: { itemId, locationId: location_id, startDate },
        type: sequelize.QueryTypes.SELECT
      });
    } else {
      query = await sequelize.query(`
        SELECT 
          DATE(recorded_at) as date,
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price
        FROM price_logs
        WHERE item_id = :itemId
          AND recorded_at >= :startDate
        GROUP BY DATE(recorded_at)
        ORDER BY date ASC
      `, {
        replacements: { itemId, startDate },
        type: sequelize.QueryTypes.SELECT
      });
    }

    const item = await Item.findByPk(itemId, { include: [Category] });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    res.json({
      item: { id: item.id, name: item.name, unit: item.unit, category: item.Category?.name },
      history: query.map(r => ({
        date: r.date,
        avg_price: Math.round(parseFloat(r.avg_price)),
        min_price: Math.round(parseFloat(r.min_price)),
        max_price: Math.round(parseFloat(r.max_price))
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/prices/location/:locationId/latest — State price snapshot
router.get('/location/:locationId/latest', async (req, res) => {
  try {
    const { locationId } = req.params;
    const data = await sequelize.query(`
      SELECT 
        pl.item_id,
        i.name as item_name,
        i.unit,
        c.name as category,
        c.color as category_color,
        pl.price,
        pl.recorded_at
      FROM price_logs pl
      JOIN items i ON i.id = pl.item_id
      JOIN categories c ON c.id = i.category_id
      WHERE pl.location_id = :locationId
        AND DATE(pl.recorded_at) = (SELECT MAX(DATE(recorded_at)) FROM price_logs WHERE location_id = :locationId)
      ORDER BY c.name, i.name
    `, {
      replacements: { locationId },
      type: sequelize.QueryTypes.SELECT
    });
    const location = await Location.findByPk(locationId);
    res.json({ location, data });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/prices/market/state-comparison/:itemId — Compare item across states
router.get('/market/state-comparison/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const data = await sequelize.query(`
      SELECT 
        l.state_name,
        l.region,
        AVG(pl.price) as avg_price
      FROM price_logs pl
      JOIN locations l ON l.id = pl.location_id
      WHERE pl.item_id = :itemId
        AND DATE(pl.recorded_at) >= (SELECT MAX(DATE(recorded_at)) FROM price_logs) - INTERVAL '7 days'
      GROUP BY l.state_name, l.region
      ORDER BY avg_price ASC
    `, {
      replacements: { itemId },
      type: sequelize.QueryTypes.SELECT
    });
    res.json({ data: data.map(r => ({ ...r, avg_price: Math.round(parseFloat(r.avg_price)) })) });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
