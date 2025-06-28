const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pegawai = require('./pegawai');

const Merchandise = sequelize.define('Merchandise', {
  id_merchandise: { type: DataTypes.STRING(50), primaryKey: true },
  id_admin: { type: DataTypes.STRING(50), allowNull: false },
  nama_merchandise: { type: DataTypes.STRING(100), allowNull: false },
  harga_poin: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
  deskripsi: { type: DataTypes.STRING(255), allowNull: false },
  gambar: { type: DataTypes.STRING(255), allowNull: false },
  stok_merchandise: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
}, {
  tableName: 'merchandise',
  timestamps: false,
});

Merchandise.belongsTo(Pegawai, { foreignKey: 'id_admin', onDelete: 'RESTRICT' });

module.exports = Merchandise;