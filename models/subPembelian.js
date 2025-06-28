const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pembelian = require('./pembelian');
const Barang = require('./barang');

const SubPembelian = sequelize.define('SubPembelian', {
  id_sub_pembelian: { type: DataTypes.STRING(50), primaryKey: true },
  id_pembelian: { type: DataTypes.STRING(50), allowNull: false },
  id_barang: { type: DataTypes.STRING(50), allowNull: false },
}, {
  tableName: 'subpembelian',
  timestamps: false,
});

SubPembelian.belongsTo(Pembelian, { foreignKey: 'id_pembelian', onDelete: 'RESTRICT' });
SubPembelian.belongsTo(Barang, { foreignKey: 'id_barang', onDelete: 'RESTRICT' });

module.exports = SubPembelian;