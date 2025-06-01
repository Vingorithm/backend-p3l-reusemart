const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Barang = require('./barang');

const Penitipan = sequelize.define('Penitipan', {
  id_penitipan: { type: DataTypes.STRING(50), primaryKey: true },
  id_barang: { type: DataTypes.STRING(50), allowNull: false },
  tanggal_awal_penitipan: { type: DataTypes.DATE, allowNull: false },
  tanggal_akhir_penitipan: { type: DataTypes.DATE, allowNull: false },
  tanggal_batas_pengambilan: { type: DataTypes.DATE, allowNull: false },
  perpanjangan: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: 0 },
  status_penitipan: { type: DataTypes.STRING(255), allowNull: false },
}, {
  tableName: 'Penitipan',
  timestamps: false,
});

Penitipan.belongsTo(Barang, { foreignKey: 'id_barang', onDelete: 'RESTRICT' });

module.exports = Penitipan;