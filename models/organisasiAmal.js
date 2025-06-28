const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Akun = require('./akun');

const OrganisasiAmal = sequelize.define('OrganisasiAmal', {
  id_organisasi: { type: DataTypes.STRING(50), primaryKey: true },
  id_akun: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  nama_organisasi: { type: DataTypes.STRING(100), allowNull: false },
  alamat: { type: DataTypes.STRING(500), allowNull: false },
  tanggal_registrasi: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'organisasiamal',
  timestamps: false,
});

OrganisasiAmal.belongsTo(Akun, { foreignKey: 'id_akun', onDelete: 'CASCADE' });
Akun.hasOne(OrganisasiAmal, { foreignKey: 'id_akun' });

module.exports = OrganisasiAmal;