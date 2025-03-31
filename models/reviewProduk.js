const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Transaksi = require('./transaksi');

const ReviewProduk = sequelize.define('ReviewProduk', {
  id_review: { type: DataTypes.STRING(50), primaryKey: true },
  id_transaksi: { type: DataTypes.STRING(50), allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  tanggal_review: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'ReviewProduk',
  timestamps: false,
});

ReviewProduk.belongsTo(Transaksi, { foreignKey: 'id_transaksi', onDelete: 'CASCADE' });

module.exports = ReviewProduk;