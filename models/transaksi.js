const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pengiriman = require('./pengiriman');
const SubPembelian = require('./subPembelian');

const Transaksi = sequelize.define('Transaksi', {
  id_transaksi: { type: DataTypes.STRING(50), primaryKey: true },
  id_sub_pembelian: { type: DataTypes.STRING(50), allowNull: false },
  komisi_reusemart: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  komisi_hunter: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  pendapatan: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  bonus_cepat: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
}, {
  tableName: 'transaksi',
  timestamps: false,
});

Transaksi.belongsTo(SubPembelian, { foreignKey: 'id_sub_pembelian', onDelete: 'CASCADE' });

module.exports = Transaksi;