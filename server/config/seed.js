require('dotenv').config();
const sequelize = require('./database');
const { User, Category, Item, Location, PriceLog, Report } = require('../models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...');
    await sequelize.sync({ force: true });
    console.log('✅ Tables created');

    // Users
    const adminHash = await bcrypt.hash('Admin@1234', 12);
    const editorHash = await bcrypt.hash('Editor@1234', 12);
    await User.bulkCreate([
      { username: 'admin', email: 'admin@supplychain.ng', password_hash: adminHash, role: 'admin' },
      { username: 'editor_lagos', email: 'editor@supplychain.ng', password_hash: editorHash, role: 'editor' }
    ]);
    console.log('✅ Users seeded');

    // Categories
    const categories = await Category.bulkCreate([
      { name: 'Tech Hardware', icon: 'cpu', color: '#0EA5E9' },
      { name: 'Fuel & Energy', icon: 'zap', color: '#F59E0B' },
      { name: 'Grains & Staples', icon: 'wheat', color: '#10B981' },
      { name: 'Protein & Livestock', icon: 'beef', color: '#EF4444' },
      { name: 'Construction', icon: 'building', color: '#8B5CF6' },
      { name: 'Cooking Essentials', icon: 'flame', color: '#F97316' }
    ]);
    console.log('✅ Categories seeded');

    // Items
    const items = await Item.bulkCreate([
      { category_id: categories[0].id, name: 'iPhone 15 Pro Max (256GB)', unit: 'unit', description: 'Apple smartphone flagship' },
      { category_id: categories[0].id, name: 'Samsung Galaxy S24 Ultra', unit: 'unit', description: 'Samsung flagship phone' },
      { category_id: categories[0].id, name: 'MacBook Air M2 (256GB)', unit: 'unit', description: 'Apple laptop' },
      { category_id: categories[0].id, name: 'Dell Latitude 5540 Laptop', unit: 'unit', description: 'Business laptop' },
      { category_id: categories[0].id, name: 'HP LaserJet Pro Printer', unit: 'unit', description: 'Office printer' },
      { category_id: categories[0].id, name: 'Starlink Internet Kit', unit: 'unit', description: 'Satellite internet hardware' },
      { category_id: categories[1].id, name: 'Petrol (PMS)', unit: 'litre', description: 'Premium Motor Spirit' },
      { category_id: categories[1].id, name: 'Diesel (AGO)', unit: 'litre', description: 'Automotive Gas Oil' },
      { category_id: categories[1].id, name: 'Kerosene (DPK)', unit: 'litre', description: 'Dual Purpose Kerosene' },
      { category_id: categories[1].id, name: 'Cooking Gas (LPG)', unit: 'kg', description: '12.5kg refill' },
      { category_id: categories[2].id, name: 'Bag of Rice (50kg)', unit: 'bag', description: 'Ofada or imported rice' },
      { category_id: categories[2].id, name: 'Bag of Maize (100kg)', unit: 'bag', description: 'Yellow maize' },
      { category_id: categories[2].id, name: 'Semovita (1kg)', unit: 'pack', description: 'Semowheat product' },
      { category_id: categories[2].id, name: 'Bag of Garri (100kg)', unit: 'bag', description: 'Cassava flakes' },
      { category_id: categories[3].id, name: 'Broiler Chicken (1kg)', unit: 'kg', description: 'Live or dressed chicken' },
      { category_id: categories[3].id, name: 'Beef (1kg)', unit: 'kg', description: 'Cow meat, boneless' },
      { category_id: categories[3].id, name: 'Catfish (1kg)', unit: 'kg', description: 'Fresh catfish' },
      { category_id: categories[4].id, name: 'Dangote Cement (50kg)', unit: 'bag', description: '3X grade cement' },
      { category_id: categories[4].id, name: 'Iron Rod 12mm (tonne)', unit: 'tonne', description: 'Steel reinforcement bar' },
      { category_id: categories[5].id, name: 'Vegetable Oil (5L)', unit: 'bottle', description: 'Palm or groundnut oil' },
      { category_id: categories[5].id, name: 'Tomato Paste (70g tin)', unit: 'tin', description: 'Tomato puree' },
      { category_id: categories[5].id, name: 'Flour (50kg)', unit: 'bag', description: 'Wheat flour' }
    ]);
    console.log('✅ Items seeded');

    // Locations
    const locations = await Location.bulkCreate([
      { state_name: 'Lagos', region: 'South West', latitude: 6.5244, longitude: 3.3792 },
      { state_name: 'Abuja (FCT)', region: 'North Central', latitude: 9.0765, longitude: 7.3986 },
      { state_name: 'Kano', region: 'North West', latitude: 12.0022, longitude: 8.5919 },
      { state_name: 'Rivers (Port Harcourt)', region: 'South South', latitude: 4.8156, longitude: 7.0498 },
      { state_name: 'Kaduna', region: 'North West', latitude: 10.5105, longitude: 7.4165 },
      { state_name: 'Oyo (Ibadan)', region: 'South West', latitude: 7.3775, longitude: 3.9470 },
      { state_name: 'Anambra (Onitsha)', region: 'South East', latitude: 6.1421, longitude: 6.7738 },
      { state_name: 'Enugu', region: 'South East', latitude: 6.4584, longitude: 7.5464 },
      { state_name: 'Delta (Warri)', region: 'South South', latitude: 5.5167, longitude: 5.7500 },
      { state_name: 'Imo (Owerri)', region: 'South East', latitude: 5.4836, longitude: 7.0333 }
    ]);
    console.log('✅ Locations seeded');

    // Price logs — generate 60 days of historical data
    const priceLogs = [];
    const now = new Date();

    const basePrices = {
      // Tech Hardware
      0: { base: 1850000, variance: 0.05, locationFactor: [1.0, 1.05, 1.12, 1.08, 1.10, 1.03, 1.15, 1.12, 1.07, 1.13] },
      1: { base: 1650000, variance: 0.04, locationFactor: [1.0, 1.04, 1.10, 1.06, 1.09, 1.02, 1.13, 1.11, 1.06, 1.12] },
      2: { base: 2200000, variance: 0.05, locationFactor: [1.0, 1.06, 1.15, 1.09, 1.12, 1.03, 1.18, 1.14, 1.08, 1.15] },
      3: { base: 950000,  variance: 0.06, locationFactor: [1.0, 1.04, 1.08, 1.05, 1.07, 1.02, 1.10, 1.08, 1.04, 1.09] },
      4: { base: 420000,  variance: 0.07, locationFactor: [1.0, 1.05, 1.09, 1.06, 1.08, 1.02, 1.12, 1.09, 1.05, 1.10] },
      5: { base: 680000,  variance: 0.03, locationFactor: [1.0, 1.02, 1.05, 1.03, 1.04, 1.01, 1.06, 1.05, 1.02, 1.05] },
      // Fuel & Energy
      6: { base: 950,     variance: 0.08, locationFactor: [1.0, 1.02, 1.05, 1.08, 1.03, 1.01, 1.04, 1.03, 1.07, 1.04] },
      7: { base: 1200,    variance: 0.06, locationFactor: [1.0, 1.03, 1.07, 1.10, 1.05, 1.02, 1.06, 1.05, 1.09, 1.06] },
      8: { base: 1400,    variance: 0.07, locationFactor: [1.0, 1.04, 1.08, 1.12, 1.06, 1.02, 1.07, 1.06, 1.10, 1.07] },
      9: { base: 16500,   variance: 0.05, locationFactor: [1.0, 1.03, 1.06, 1.05, 1.04, 1.01, 1.05, 1.04, 1.04, 1.05] },
      // Grains
      10: { base: 95000,  variance: 0.08, locationFactor: [1.0, 1.08, 1.12, 1.10, 1.09, 1.03, 1.06, 1.08, 1.09, 1.07] },
      11: { base: 48000,  variance: 0.10, locationFactor: [1.0, 1.12, 1.08, 1.06, 1.10, 1.05, 1.04, 1.06, 1.07, 1.05] },
      12: { base: 3200,   variance: 0.06, locationFactor: [1.0, 1.05, 1.08, 1.06, 1.07, 1.02, 1.05, 1.05, 1.06, 1.05] },
      13: { base: 42000,  variance: 0.12, locationFactor: [1.0, 1.10, 1.06, 1.08, 1.09, 1.04, 1.05, 1.07, 1.08, 1.06] },
      // Protein
      14: { base: 4500,   variance: 0.08, locationFactor: [1.0, 1.06, 1.08, 1.04, 1.07, 1.02, 1.05, 1.04, 1.03, 1.04] },
      15: { base: 7500,   variance: 0.07, locationFactor: [1.0, 1.05, 1.07, 1.03, 1.06, 1.02, 1.04, 1.04, 1.03, 1.04] },
      16: { base: 3800,   variance: 0.10, locationFactor: [1.0, 1.04, 1.07, 1.05, 1.06, 1.02, 1.05, 1.05, 1.04, 1.05] },
      // Construction
      17: { base: 9500,   variance: 0.06, locationFactor: [1.0, 1.03, 1.05, 1.04, 1.04, 1.01, 1.04, 1.04, 1.03, 1.04] },
      18: { base: 1850000,variance: 0.05, locationFactor: [1.0, 1.04, 1.07, 1.05, 1.06, 1.02, 1.06, 1.05, 1.04, 1.05] },
      // Cooking
      19: { base: 12500,  variance: 0.07, locationFactor: [1.0, 1.04, 1.08, 1.05, 1.07, 1.02, 1.06, 1.05, 1.05, 1.06] },
      20: { base: 850,    variance: 0.08, locationFactor: [1.0, 1.06, 1.10, 1.07, 1.09, 1.03, 1.08, 1.07, 1.07, 1.08] },
      21: { base: 58000,  variance: 0.06, locationFactor: [1.0, 1.05, 1.09, 1.06, 1.08, 1.02, 1.07, 1.06, 1.06, 1.07] }
    };

    for (let day = 59; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);

      for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
        const priceConfig = basePrices[itemIdx];
        if (!priceConfig) continue;

        // Create a market trend over time (slight inflation)
        const trendFactor = 1 + (59 - day) * 0.001;

        for (let locIdx = 0; locIdx < locations.length; locIdx++) {
          const randomVariance = 1 + (Math.random() - 0.5) * 2 * priceConfig.variance;
          const price = Math.round(
            priceConfig.base * trendFactor * priceConfig.locationFactor[locIdx] * randomVariance
          );

          priceLogs.push({
            item_id: items[itemIdx].id,
            location_id: locations[locIdx].id,
            price,
            recorded_at: date
          });
        }
      }
    }

    // Batch insert
    const chunkSize = 500;
    for (let i = 0; i < priceLogs.length; i += chunkSize) {
      await PriceLog.bulkCreate(priceLogs.slice(i, i + chunkSize));
    }
    console.log(`✅ ${priceLogs.length} price logs seeded`);

    // Reports
    await Report.bulkCreate([
      {
        user_id: 1,
        title: 'Petrol Prices Surge 12% in Northern States Amid Supply Disruptions',
        content: 'Fuel scarcity hits Kano and Kaduna as depot shortages drive pump prices above ₦1,100/litre. Independent marketers blame logistics delays from Lagos depots. NNPCL has assured supply normalization within 72 hours.',
        source_url: 'https://businessday.ng',
        category: 'Fuel & Energy',
        status: 'verified',
        views: 1240
      },
      {
        user_id: 1,
        title: 'Dangote Cement Announces Price Review as Iron Rod Costs Stabilize',
        content: 'Construction sector stakeholders welcome the marginal 3% reduction in cement prices at ex-factory gates. Iron rod prices which hit record highs in Q3 2024 have seen a 8% correction, offering relief to developers.',
        source_url: 'https://nairametrics.com',
        category: 'Construction',
        status: 'verified',
        views: 876
      },
      {
        user_id: 2,
        title: 'Apple iPhone 15 Series Sees 18% Naira Depreciation Impact on Retail Prices',
        content: 'Grey market and authorized dealers in Lagos Computer Village adjust iPhone 15 Pro Max prices upward to between ₦1.75M - ₦2.1M as the naira weakens further against the dollar at parallel markets.',
        source_url: 'https://techcabal.com',
        category: 'Tech Hardware',
        status: 'verified',
        views: 2103
      },
      {
        user_id: 2,
        title: 'Rice Harvest Season Expected to Ease Prices in South-West Markets',
        content: 'Farmers in Kebbi, Ekiti, and Kogi report above-average yields this season. Analysts project a 10-15% softening in 50kg bag prices at Mushin and Bodija markets by mid-November.',
        source_url: 'https://agrobusiness.ng',
        category: 'Grains & Staples',
        status: 'verified',
        views: 654
      },
      {
        user_id: 1,
        title: 'Starlink Expands Coverage to 12 Additional Nigerian States',
        content: 'SpaceX-owned Starlink has activated service in Gombe, Benue, Kogi, and 9 other states, pushing its Nigerian footprint to 36 states. Hardware kits retail at approximately ₦680,000 with a ₦38,000 monthly subscription.',
        source_url: 'https://techpoint.africa',
        category: 'Tech Hardware',
        status: 'verified',
        views: 3412
      },
      {
        user_id: 2,
        title: 'Cooking Gas Crisis: LPG Hits ₦20,000 for 12.5kg Refill in South East',
        content: 'Households in Enugu, Owerri, and Onitsha report severe LPG supply shortages. Distributors cite pipeline infrastructure challenges. Government urged to fast-track domestic LPG distribution terminals.',
        source_url: 'https://vanguardngr.com',
        category: 'Fuel & Energy',
        status: 'pending',
        views: 0
      },
      {
        user_id: 2,
        title: 'Onitsha Main Market Becomes Key Hub for Refurbished Tech Imports',
        content: 'Anambra traders report 40% increase in refurbished smartphone imports from China and Dubai. Grade A refurbished iPhones selling at 35-50% discount to new prices, fueling strong demand from budget-conscious consumers.',
        source_url: 'https://guardian.ng',
        category: 'Tech Hardware',
        status: 'pending',
        views: 0
      }
    ]);
    console.log('✅ Reports seeded');

    console.log('\n🎉 Database seeded successfully!');
    console.log('Admin credentials: admin / Admin@1234');
    console.log('Editor credentials: editor_lagos / Editor@1234');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
