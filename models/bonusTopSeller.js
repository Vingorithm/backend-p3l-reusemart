const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Penitip = require('./penitip');

const BonusTopSeller = sequelize.define('BonusTopSeller', {
  id_bonus_top_seller: { type: DataTypes.STRING(50), primaryKey: true },
  id_penitip: { type: DataTypes.STRING(50), allowNull: false },
  nominal: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  tanggal_pembayaran: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'bonustopseller',
  timestamps: false,
});

BonusTopSeller.belongsTo(Penitip, { foreignKey: 'id_penitip', onDelete: 'RESTRICT' });

module.exports = BonusTopSeller;