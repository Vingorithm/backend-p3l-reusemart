const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pengiriman = require('./pengiriman');

const Transaksi = sequelize.define('Transaksi', {
  id_transaksi: { type: DataTypes.STRING(50), primaryKey: true },
  id_pengiriman: { type: DataTypes.STRING(50), allowNull: false },
  komisi_reusemart: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  komisi_hunter: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  pendapatan: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  bonus_cepat: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
}, {
  tableName: 'Transaksi',
  timestamps: false,
});

Transaksi.belongsTo(Pengiriman, { foreignKey: 'id_pengiriman', onDelete: 'CASCADE' });

module.exports = Transaksi;