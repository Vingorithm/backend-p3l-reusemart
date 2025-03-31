const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Akun = sequelize.define('Akun', {
  id_akun: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName: 'Akun',
  timestamps: false,
});

module.exports = Akun;