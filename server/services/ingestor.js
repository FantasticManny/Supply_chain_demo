const cron = require('node-cron');
const { PriceLog, Item, Location } = require('../models');

// ─────────────────────────────────────────────────────────────────────────────
// Market Price Simulation Engine
//
// This module generates simulated daily price updates for all tracked items
// across all state locations. It is intentionally a simulation so this project
// can run standalone without external API keys or data subscriptions.
//
// TO CONNECT REAL DATA SOURCES, replace generateMarketPrice() below with
// actual API calls or scrapers. Suggested production integrations:
//
//   Fuel prices (PMS/AGO/DPK/LPG):
//     → PPPRA daily price bulletins: https://www.pppra.gov.ng
//     → DPR monitoring reports
//
//   Foreign exchange (affects tech hardware pricing):
//     → CBN official rates: https://www.cbn.gov.ng/rates/ExchRates.asp
//
//   Agricultural commodity prices:
//     → NBS (National Bureau of Statistics) market surveys
//     → Agmarknet-style price feeds
//
//   Tech hardware prices:
//     → Scrape Jumia.com.ng / Konga.com product listings
//     → Computer Village Lagos price aggregators
//
// The cron schedule, database write logic, and item/location structure
// remain the same regardless of data source.
// ─────────────────────────────────────────────────────────────────────────────

// Simulated daily price volatility per category (as fraction of price)
const MARKET_VOLATILITY = {
  'Tech Hardware':       0.02,  // Relatively stable, moves with FX
  'Fuel & Energy':       0.04,  // More volatile, policy-sensitive
  'Grains & Staples':    0.05,  // Seasonal variation
  'Protein & Livestock': 0.04,  // Moderate volatility
  'Construction':        0.025, // Slow-moving commodity
  'Cooking Essentials':  0.035  // Moderate
};

// Location price premiums relative to Lagos (lowest cost base for most goods)
const LOCATION_PREMIUMS = {
  'Lagos':                1.00,
  'Abuja (FCT)':          1.05,
  'Kano':                 1.08,
  'Rivers (Port Harcourt)': 1.06,
  'Kaduna':               1.07,
  'Oyo (Ibadan)':         1.03,
  'Anambra (Onitsha)':    1.10,
  'Enugu':                1.09,
  'Delta (Warri)':        1.07,
  'Imo (Owerri)':         1.09
};

/**
 * Simulates a new market price for an item at a given location.
 * Replace this function body with a real API call in production.
 *
 * @param {Object} item - Sequelize Item instance (with Category association)
 * @param {Object} location - Sequelize Location instance
 * @param {number} lastPrice - Most recent recorded price
 * @returns {number} New price (rounded to nearest Naira)
 */
function generateMarketPrice(item, location, lastPrice) {
  const volatility = MARKET_VOLATILITY[item.Category?.name] || 0.03;
  const direction = Math.random() > 0.45 ? 1 : -1; // Slight upward bias (inflation)
  const change = 1 + direction * Math.random() * volatility;
  const premium = LOCATION_PREMIUMS[location.state_name] || 1.05;
  return Math.round(lastPrice * change * premium);
}

async function runIngestor() {
  console.log(`[Ingestor] Running price update at ${new Date().toISOString()}`);

  try {
    const items = await Item.findAll({ include: ['Category'] });
    const locations = await Location.findAll();

    const logs = [];
    const now = new Date();

    for (const item of items) {
      for (const location of locations) {
        const last = await PriceLog.findOne({
          where: { item_id: item.id, location_id: location.id },
          order: [['recorded_at', 'DESC']]
        });

        const basePrice = last ? parseFloat(last.price) : 50000;
        const price = generateMarketPrice(item, location, basePrice);

        logs.push({ item_id: item.id, location_id: location.id, price, recorded_at: now });
      }
    }

    // Batch insert for performance
    const chunkSize = 500;
    for (let i = 0; i < logs.length; i += chunkSize) {
      await PriceLog.bulkCreate(logs.slice(i, i + chunkSize));
    }

    console.log(`[Ingestor] Inserted ${logs.length} price records`);
  } catch (err) {
    console.error('[Ingestor] Error:', err.message);
  }
}

// Schedule: run every day at midnight WAT (UTC+1)
// Cron format: second(optional) minute hour day month weekday
cron.schedule('0 23 * * *', runIngestor, {
  timezone: 'Africa/Lagos'
});

console.log('[Ingestor] Scheduled for daily midnight WAT price updates');

module.exports = { runIngestor };
