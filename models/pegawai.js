const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Akun = require('./akun');

const Pegawai = sequelize.define('Pegawai', {
  id_pegawai: { type: DataTypes.STRING(50), primaryKey: true },
  id_akun: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  nama_pegawai: { type: DataTypes.STRING(100), allowNull: false },
  tanggal_lahir: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'Pegawai',
  timestamps: false,
});

Pegawai.belongsTo(Akun, { foreignKey: 'id_akun', onDelete: 'CASCADE' });
Akun.hasOne(Pegawai, { foreignKey: 'id_akun' });

module.exports = Pegawai;