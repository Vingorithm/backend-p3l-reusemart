const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Akun = sequelize.define('Akun', {
  id_akun: {
    type: DataTypes.STRING(255),
    primaryKey: true,
  },
  profile_picture: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fcm_token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'Akun',
  timestamps: false,
});

module.exports = Akun;