const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ─── User Model ───────────────────────────────────────
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'editor'), defaultValue: 'editor' }
}, { tableName: 'users', underscored: true });

// ─── Category Model ───────────────────────────────────
const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  icon: { type: DataTypes.STRING(50) },
  color: { type: DataTypes.STRING(20) }
}, { tableName: 'categories', underscored: true });

// ─── Item Model ───────────────────────────────────────
const Item = sequelize.define('Item', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false },
  unit: { type: DataTypes.STRING(30), allowNull: false },
  description: { type: DataTypes.TEXT }
}, { tableName: 'items', underscored: true });

// ─── Location Model ───────────────────────────────────
const Location = sequelize.define('Location', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  state_name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  region: { type: DataTypes.STRING(50) },
  latitude: { type: DataTypes.FLOAT },
  longitude: { type: DataTypes.FLOAT }
}, { tableName: 'locations', underscored: true });

// ─── PriceLog Model ───────────────────────────────────
const PriceLog = sequelize.define('PriceLog', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  item_id: { type: DataTypes.INTEGER, allowNull: false },
  location_id: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  recorded_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, { tableName: 'price_logs', underscored: true, timestamps: false });

// ─── Report Model ─────────────────────────────────────
const Report = sequelize.define('Report', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(300), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  source_url: { type: DataTypes.STRING(500) },
  category: { type: DataTypes.STRING(100) },
  status: { type: DataTypes.ENUM('pending', 'verified', 'rejected'), defaultValue: 'pending' },
  views: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'reports', underscored: true });

// ─── Associations ─────────────────────────────────────
Category.hasMany(Item, { foreignKey: 'category_id' });
Item.belongsTo(Category, { foreignKey: 'category_id' });

Item.hasMany(PriceLog, { foreignKey: 'item_id' });
PriceLog.belongsTo(Item, { foreignKey: 'item_id' });

Location.hasMany(PriceLog, { foreignKey: 'location_id' });
PriceLog.belongsTo(Location, { foreignKey: 'location_id' });

User.hasMany(Report, { foreignKey: 'user_id' });
Report.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Category, Item, Location, PriceLog, Report };
