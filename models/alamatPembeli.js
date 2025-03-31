const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlamatPembeli = sequelize.define('AlamatPembeli', {
  id_alamat: { type: DataTypes.STRING(50), primaryKey: true },
  nama_alamat: { type: DataTypes.STRING(100), allowNull: false },
  alamat_lengkap: { type: DataTypes.STRING(500), allowNull: false },
  is_main_address: { type: DataTypes.BOOLEAN, allowNull: false },
}, {
  tableName: 'AlamatPembeli',
  timestamps: false,
});

module.exports = AlamatPembeli;