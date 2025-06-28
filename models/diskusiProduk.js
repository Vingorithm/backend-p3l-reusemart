const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Barang = require('./barang');
const Pegawai = require('./pegawai');
const Pembeli = require('./pembeli');

const DiskusiProduk = sequelize.define('DiskusiProduk', {
  id_diskusi_produk: { type: DataTypes.STRING(50), primaryKey: true },
  id_barang: { type: DataTypes.STRING(50), allowNull: false },
  id_customer_service: { type: DataTypes.STRING(50), allowNull: false },
  id_pembeli: { type: DataTypes.STRING(50), allowNull: false },
  pertanyaan: { type: DataTypes.STRING(500), allowNull: false },
  jawaban: { type: DataTypes.STRING(500), allowNull: true },
  tanggal_pertanyaan: { type: DataTypes.DATE, allowNull: false },
  tanggal_jawaban: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'diskusiproduk',
  timestamps: false,
});

DiskusiProduk.belongsTo(Barang, { foreignKey: 'id_barang', onDelete: 'RESTRICT' });
DiskusiProduk.belongsTo(Pegawai, { foreignKey: 'id_customer_service', onDelete: 'RESTRICT' });
DiskusiProduk.belongsTo(Pembeli, { foreignKey: 'id_pembeli', onDelete: 'RESTRICT' });

module.exports = DiskusiProduk;