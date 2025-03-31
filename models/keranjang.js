const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Barang = require('./barang');
const Pembeli = require('./pembeli');

const Keranjang = sequelize.define('Keranjang', {
  id_keranjang: { type: DataTypes.STRING(50), primaryKey: true },
  id_barang: { type: DataTypes.STRING(50), allowNull: false },
  id_pembeli: { type: DataTypes.STRING(50), allowNull: false },
}, {
  tableName: 'Keranjang',
  timestamps: false,
  indexes: [{ unique: true, fields: ['id_barang', 'id_pembeli'] }],
});

Keranjang.belongsTo(Barang, { foreignKey: 'id_barang', onDelete: 'RESTRICT' });
Keranjang.belongsTo(Pembeli, { foreignKey: 'id_pembeli', onDelete: 'RESTRICT' });

module.exports = Keranjang;