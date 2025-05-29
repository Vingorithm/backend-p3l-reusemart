const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Akun = require('./akun');

const Penitip = sequelize.define('Penitip', {
  id_penitip: { type: DataTypes.STRING(50), primaryKey: true },
  id_akun: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  nama_penitip: { type: DataTypes.STRING(100), allowNull: false },
  foto_ktp: { type: DataTypes.STRING(255), allowNull: false },
  nomor_ktp: { type: DataTypes.STRING(16), allowNull: false, unique: true },
  keuntungan: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0.00 },
  rating: { type: DataTypes.DECIMAL(2, 1), allowNull: false, defaultValue: 0.0 },
  badge: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: 0 },
  total_poin: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  tanggal_registrasi: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'Penitip',
  timestamps: false,
});

Penitip.belongsTo(Akun, { foreignKey: 'id_akun', onDelete: 'CASCADE' });
Akun.hasOne(Penitip, { foreignKey: 'id_akun' });

module.exports = Penitip;