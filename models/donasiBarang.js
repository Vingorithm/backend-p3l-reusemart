const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const RequestDonasi = require('./requestDonasi');
const Pegawai = require('./pegawai');
const Barang = require('./barang');

const DonasiBarang = sequelize.define('DonasiBarang', {
  id_donasi_barang: { type: DataTypes.STRING(50), primaryKey: true },
  id_request_donasi: { type: DataTypes.STRING(50), allowNull: false },
  id_owner: { type: DataTypes.STRING(50), allowNull: false },
  id_barang: { type: DataTypes.STRING(50), allowNull: false },
  tanggal_donasi: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'DonasiBarang',
  timestamps: false,
});

DonasiBarang.belongsTo(RequestDonasi, { foreignKey: 'id_request_donasi', onDelete: 'RESTRICT' });
DonasiBarang.belongsTo(Pegawai, { foreignKey: 'id_owner', onDelete: 'RESTRICT' });
DonasiBarang.belongsTo(Barang, { foreignKey: 'id_barang', onDelete: 'RESTRICT' });

module.exports = DonasiBarang;