const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pembelian = require('./pembelian');
const Pegawai = require('./pegawai');

const Pengiriman = sequelize.define('Pengiriman', {
  id_pengiriman: { type: DataTypes.STRING(50), primaryKey: true },
  id_pembelian: { type: DataTypes.STRING(50), allowNull: false },
  id_pengkonfirmasi: { type: DataTypes.STRING(50), allowNull: true },
  tanggal_mulai: { type: DataTypes.DATE, allowNull: true },
  tanggal_berakhir: { type: DataTypes.DATE, allowNull: true },
  status_pengiriman: { type: DataTypes.STRING(255), allowNull: false },
  jenis_pengiriman: { type: DataTypes.STRING(255), allowNull: false },
}, {
  tableName: 'pengiriman',
  timestamps: false,
});

Pengiriman.belongsTo(Pembelian, {
  foreignKey: 'id_pembelian',
  targetKey: 'id_pembelian',
  onDelete: 'CASCADE'
});

Pembelian.hasOne(Pengiriman, {
  foreignKey: 'id_pembelian',
  sourceKey: 'id_pembelian',
  onDelete: 'CASCADE'
});

Pengiriman.belongsTo(Pegawai, {
  foreignKey: 'id_pengkonfirmasi',
  onDelete: 'RESTRICT'
});

module.exports = Pengiriman;