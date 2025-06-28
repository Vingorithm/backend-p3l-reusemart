const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Akun = require('./akun');

const Pembeli = sequelize.define('Pembeli', {
  id_pembeli: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  id_akun: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  total_poin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  tanggal_registrasi: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'pembeli',
  timestamps: false,
});

Pembeli.belongsTo(Akun, { foreignKey: 'id_akun', onDelete: 'CASCADE' });
Akun.hasOne(Pembeli, { foreignKey: 'id_akun' });

module.exports = Pembeli;